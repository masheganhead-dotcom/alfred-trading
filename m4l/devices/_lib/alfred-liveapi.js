// alfred-liveapi.js — shared LiveAPI helpers for the Alfred M4L Suite.
//
// Loaded by every device's [js] object. Exposes a flat function surface
// (Max's [js] object can call any top-level function by name via the
// `f <name> <args...>` message) plus helpers that are consumed inside
// the device-specific scripts via `require()` once they're in the
// Max search path.
//
// Conventions:
//   - All LiveAPI access goes through a fresh LiveAPI() instance and
//     is released before the function returns. Holding references is a
//     classic cause of device-reload zombies.
//   - Functions never throw; they post to the Max console and return a
//     sentinel (null / -1 / false) so the patch can react.

autowatch = 1;
inlets = 1;
outlets = 2;   // 0: status messages, 1: structured results

// ---------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------

function _api(path) {
    var a = new LiveAPI();
    if (path) a.path = path;
    return a;
}

function _song() {
    return _api("live_set");
}

function _log(msg) {
    post("[alfred] " + msg + "\n");
}

function _emitStatus(level, msg) {
    // level: "ok" | "warn" | "err"
    outlet(0, "status", level, msg);
}

// ---------------------------------------------------------------------
// Track creation / lookup
// ---------------------------------------------------------------------

function getSelectedTrackId() {
    var view = _api("live_set view");
    var id = view.get("selected_track");
    // LiveAPI .get returns ["id", "<n>"] for object refs.
    if (id && id.length >= 2 && id[0] === "id") {
        return parseInt(id[1], 10);
    }
    return -1;
}

function createAudioTrack(name) {
    var song = _song();
    // create_audio_track takes an integer index; -1 = end of list.
    song.call("create_audio_track", -1);

    // Newly created track is now the last audio track.
    var tracks = song.get("tracks");
    // tracks is a flat list: [id, n0, id, n1, ...]; last entry is newest.
    var lastId = null;
    for (var i = 0; i < tracks.length; i += 2) {
        if (tracks[i] === "id") lastId = parseInt(tracks[i + 1], 10);
    }
    if (lastId === null) {
        _emitStatus("err", "createAudioTrack: failed");
        return -1;
    }
    if (name) {
        var t = new LiveAPI("id " + lastId);
        t.set("name", '"' + name + '"');
    }
    return lastId;
}

// ---------------------------------------------------------------------
// Input routing
// ---------------------------------------------------------------------

function listInputChannels(trackId) {
    // Returns an array of channel names available on the given track.
    var t = new LiveAPI("id " + trackId);
    var channels = t.get("available_input_routing_channels");
    // channels is JSON-encoded as ["available_input_routing_channels",
    // <JSON-string>] in Live 11+. Normalise.
    if (!channels || channels.length === 0) return [];
    var raw = channels[0];
    if (typeof raw === "string") {
        try {
            var parsed = JSON.parse(raw);
            if (parsed.available_input_routing_channels) {
                return parsed.available_input_routing_channels.map(function (c) {
                    return c.display_name;
                });
            }
        } catch (e) { /* fall through */ }
    }
    return channels;
}

function findInputChannelMatching(trackId, needle) {
    var names = listInputChannels(trackId);
    var lower = (needle || "").toLowerCase();
    for (var i = 0; i < names.length; i++) {
        if (String(names[i]).toLowerCase().indexOf(lower) !== -1) {
            return names[i];
        }
    }
    return null;
}

function setInputRoutingChannelByName(trackId, channelName) {
    var t = new LiveAPI("id " + trackId);
    var avail = t.get("available_input_routing_channels");
    if (!avail || avail.length === 0) return false;
    var raw = avail[0];
    try {
        var parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        var list = parsed.available_input_routing_channels || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].display_name === channelName) {
                t.set("input_routing_channel",
                      '{"identifier": ' + list[i].identifier + '}');
                return true;
            }
        }
    } catch (e) {
        _log("setInputRoutingChannelByName parse error: " + e);
    }
    return false;
}

// ---------------------------------------------------------------------
// Monitoring & arming
// ---------------------------------------------------------------------

// monitoring_state: 0 = In, 1 = Auto, 2 = Off
function setMonitoring(trackId, mode) {
    var t = new LiveAPI("id " + trackId);
    t.set("current_monitoring_state", mode);
}

function armTrack(trackId, armed) {
    var t = new LiveAPI("id " + trackId);
    t.set("arm", armed ? 1 : 0);
}

// ---------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------

function setSessionRecord(on) {
    _song().set("session_record", on ? 1 : 0);
}

function startArrangementRecord() {
    var s = _song();
    s.set("record_mode", 1);
    if (s.get("is_playing")[0] === 0) {
        s.call("start_playing");
    }
}

function stopArrangementRecord() {
    var s = _song();
    s.set("record_mode", 0);
}

function stopTransport() {
    _song().call("stop_playing");
}

// ---------------------------------------------------------------------
// Group introspection (used by Smart Group Resample)
// ---------------------------------------------------------------------

function isGroupTrack(trackId) {
    var t = new LiveAPI("id " + trackId);
    var v = t.get("is_foldable");
    return v && v[0] === 1;
}

function groupBarLength(trackId) {
    // Walk the group's children, find the longest clip end time across
    // their arrangement clips, return ceiled bar count (4/4 assumed; the
    // device exposes a manual override).
    if (!isGroupTrack(trackId)) return 0;
    var song = _song();
    var tracks = song.get("tracks");
    var maxEnd = 0;
    for (var i = 0; i < tracks.length; i += 2) {
        if (tracks[i] !== "id") continue;
        var childId = parseInt(tracks[i + 1], 10);
        var child = new LiveAPI("id " + childId);
        var groupId = child.get("group_track");
        if (!groupId || groupId.length < 2) continue;
        if (parseInt(groupId[1], 10) !== trackId) continue;
        var clips = child.get("arrangement_clips");
        for (var j = 0; j < clips.length; j += 2) {
            if (clips[j] !== "id") continue;
            var clipId = parseInt(clips[j + 1], 10);
            var c = new LiveAPI("id " + clipId);
            var end = c.get("end_time")[0];
            if (end > maxEnd) maxEnd = end;
        }
    }
    return maxEnd;
}

// ---------------------------------------------------------------------
// Audio clip insertion (used by Suno Bridge)
// ---------------------------------------------------------------------

function insertArrangementClip(trackId, filePath, position) {
    // Live 11.2+: Track.create_audio_clip(file_path, position_in_beats)
    var t = new LiveAPI("id " + trackId);
    try {
        t.call("create_audio_clip", filePath, position);
        return true;
    } catch (e) {
        _log("insertArrangementClip failed: " + e);
        return false;
    }
}

function currentSongTime() {
    return _song().get("current_song_time")[0];
}

// ---------------------------------------------------------------------
// Health checks
// ---------------------------------------------------------------------

function detectVirtualAudioDriver() {
    // The driver appears as an *input* channel name on any audio track.
    // Strategy: query the first audio track (or create a hidden test
    // path on master, fall back to picking the master and reading
    // *its* input channels — masters in Live don't expose inputs, so
    // we look at the first audio track).
    var song = _song();
    var tracks = song.get("tracks");
    for (var i = 0; i < tracks.length; i += 2) {
        if (tracks[i] !== "id") continue;
        var tid = parseInt(tracks[i + 1], 10);
        var t = new LiveAPI("id " + tid);
        if (t.get("has_audio_input")[0] !== 1) continue;
        var names = listInputChannels(tid);
        for (var j = 0; j < names.length; j++) {
            var n = String(names[j]).toLowerCase();
            if (n.indexOf("blackhole") !== -1 ||
                n.indexOf("loopback") !== -1 ||
                n.indexOf("vb-cable") !== -1 ||
                n.indexOf("vb-audio") !== -1 ||
                n.indexOf("cable output") !== -1) {
                return names[j];
            }
        }
        // Only need to check one audio track; available inputs are
        // identical across them.
        return null;
    }
    return null;
}

// ---------------------------------------------------------------------
// Self-test entry point (called from a [loadbang] in each device).
// ---------------------------------------------------------------------

function ping() {
    _emitStatus("ok", "alfred-liveapi loaded");
}
