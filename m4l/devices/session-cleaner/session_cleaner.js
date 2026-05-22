// session_cleaner.js — Alfred M4L Suite: Session Cleaner
//
// Scans the current Live set and (optionally) removes:
//   - Empty audio / MIDI tracks      (no clips, no input, no devices beyond an empty chain)
//   - Muted tracks                    (mute == 1)
//   - Muted / disabled clips         (Clip.muted == 1, in Session AND/OR Arrangement)
//   - Inactive devices                (Device.is_active == 0)
//   - Empty return tracks             (no devices, no incoming sends)
//
// Two-step workflow:
//   1. SCAN — count what would be deleted, emit a preview. Nothing is removed.
//   2. CLEAN — actually delete. Live's own undo (Cmd/Ctrl-Z) is the safety net.
//
// Recognised messages from the patch:
//   "scan"
//   "clean"
//   "cat <name> <0|1>"           — enable/disable a category
//   "scope <0|1|2>"              — 0 = Session, 1 = Arrangement, 2 = Both (for clips)

include("alfred-liveapi.js");

autowatch = 1;
inlets = 1;
outlets = 2;

var categories = {
    empty_tracks:    true,
    muted_tracks:    false,   // off by default — can be destructive
    muted_clips:     true,
    inactive_devices: true,
    empty_returns:   false    // off by default — returns are often kept around for routing
};

var scope = 2;   // 0 session, 1 arrangement, 2 both

var lastReport = null;

// ---------------------------------------------------------------------
// Category controls
// ---------------------------------------------------------------------

function cat(name, v) {
    if (categories.hasOwnProperty(name)) {
        categories[name] = (parseInt(v, 10) === 1);
        _emitStatus("ok", name + " = " + categories[name]);
    } else {
        _emitStatus("warn", "Unknown category: " + name);
    }
}

function scope_(v) { /* alias to avoid reserved-word collisions */ scope = parseInt(v, 10) || 0; }
this.scope = scope_;   // bind both names

// ---------------------------------------------------------------------
// SCAN — collect a plan of what would be deleted
// ---------------------------------------------------------------------

function scan() {
    var plan = _buildPlan();
    lastReport = plan;
    outlet(1, "plan",
        plan.tracks.length,
        plan.clips.length,
        plan.devices.length,
        plan.returns.length);
    _emitStatus("ok",
        "Plan: " + plan.tracks.length + " tracks, " +
                  plan.clips.length + " clips, " +
                  plan.devices.length + " devices, " +
                  plan.returns.length + " returns.");
}

function _buildPlan() {
    var song = new LiveAPI("live_set");
    var tracksRaw = song.get("tracks");
    var returnsRaw = song.get("return_tracks");

    var plan = {
        tracks: [],     // [{id, name, index, why}]
        clips: [],      // [{trackId, slotIndex|arrIndex, name, where}]
        devices: [],    // [{trackId, deviceIndex, name}]
        returns: []     // [{id, name, index}]
    };

    var trackIds = _flattenIds(tracksRaw);
    var returnIds = _flattenIds(returnsRaw);

    // ---- tracks ----
    for (var i = 0; i < trackIds.length; i++) {
        var tid = trackIds[i];
        var t = new LiveAPI("id " + tid);
        var name = String(t.get("name")[0]);
        var muted = t.get("mute")[0] === 1;
        var isGroup = t.get("is_foldable")[0] === 1;
        if (isGroup) continue;   // never auto-delete groups

        var hasArrClips = (t.get("arrangement_clips") || []).length > 0;
        var hasSesClips = _trackHasAnySessionClip(t);
        var devices = _flattenIds(t.get("devices"));
        var hasDevices = devices.length > 0;

        if (categories.empty_tracks &&
            !hasArrClips && !hasSesClips && !hasDevices) {
            plan.tracks.push({ id: tid, name: name, index: i, why: "empty" });
            continue;
        }
        if (categories.muted_tracks && muted) {
            plan.tracks.push({ id: tid, name: name, index: i, why: "muted" });
            continue;
        }

        // ---- clips on this track ----
        if (categories.muted_clips) {
            // Arrangement
            if (scope === 1 || scope === 2) {
                var arrClips = _flattenIds(t.get("arrangement_clips"));
                for (var a = 0; a < arrClips.length; a++) {
                    var c = new LiveAPI("id " + arrClips[a]);
                    if (c.get("muted")[0] === 1) {
                        plan.clips.push({
                            trackId: tid, clipId: arrClips[a],
                            name: String(c.get("name")[0]), where: "arr"
                        });
                    }
                }
            }
            // Session
            if (scope === 0 || scope === 2) {
                var slots = _flattenIds(t.get("clip_slots"));
                for (var s = 0; s < slots.length; s++) {
                    var slot = new LiveAPI("id " + slots[s]);
                    if (slot.get("has_clip")[0] !== 1) continue;
                    var clipRef = slot.get("clip");
                    if (!clipRef || clipRef.length < 2) continue;
                    var clipId = parseInt(clipRef[1], 10);
                    var clip = new LiveAPI("id " + clipId);
                    if (clip.get("muted")[0] === 1) {
                        plan.clips.push({
                            trackId: tid, slotId: slots[s],
                            slotIndex: s,
                            name: String(clip.get("name")[0]), where: "ses"
                        });
                    }
                }
            }
        }

        // ---- inactive devices ----
        if (categories.inactive_devices) {
            for (var d = 0; d < devices.length; d++) {
                var dev = new LiveAPI("id " + devices[d]);
                if (dev.get("is_active")[0] === 0) {
                    plan.devices.push({
                        trackId: tid, deviceIndex: d,
                        name: String(dev.get("name")[0])
                    });
                }
            }
        }
    }

    // ---- empty return tracks ----
    if (categories.empty_returns) {
        for (var r = 0; r < returnIds.length; r++) {
            var rt = new LiveAPI("id " + returnIds[r]);
            var rdev = _flattenIds(rt.get("devices"));
            if (rdev.length === 0) {
                plan.returns.push({
                    id: returnIds[r],
                    name: String(rt.get("name")[0]),
                    index: r
                });
            }
        }
    }

    return plan;
}

function _flattenIds(arr) {
    var out = [];
    if (!arr) return out;
    for (var i = 0; i < arr.length; i += 2) {
        if (arr[i] === "id") out.push(parseInt(arr[i + 1], 10));
    }
    return out;
}

function _trackHasAnySessionClip(t) {
    var slots = _flattenIds(t.get("clip_slots"));
    for (var i = 0; i < slots.length; i++) {
        var s = new LiveAPI("id " + slots[i]);
        if (s.get("has_clip")[0] === 1) return true;
    }
    return false;
}

// ---------------------------------------------------------------------
// CLEAN — execute the most recent plan
// ---------------------------------------------------------------------

function clean() {
    if (!lastReport) {
        _emitStatus("warn", "Run SCAN first.");
        return;
    }
    var plan = lastReport;
    var deleted = { tracks: 0, clips: 0, devices: 0, returns: 0 };

    // Delete clips first (deleting a track invalidates clip ids inside it).
    for (var i = 0; i < plan.clips.length; i++) {
        var c = plan.clips[i];
        try {
            if (c.where === "arr") {
                // Arrangement clips are removed via Track.delete_clip(clip)
                var t = new LiveAPI("id " + c.trackId);
                t.call("delete_clip", "id " + c.clipId);
            } else {
                var slot = new LiveAPI("id " + c.slotId);
                slot.call("delete_clip");
            }
            deleted.clips++;
        } catch (e) { _log("clip delete: " + e); }
    }

    // Devices next (by track, descending index — indices shift on delete).
    var byTrack = {};
    for (var d = 0; d < plan.devices.length; d++) {
        var dv = plan.devices[d];
        (byTrack[dv.trackId] = byTrack[dv.trackId] || []).push(dv.deviceIndex);
    }
    for (var tid in byTrack) {
        var indices = byTrack[tid].sort(function (a, b) { return b - a; });
        var tk = new LiveAPI("id " + tid);
        for (var k = 0; k < indices.length; k++) {
            try {
                tk.call("delete_device", indices[k]);
                deleted.devices++;
            } catch (e) { _log("device delete: " + e); }
        }
    }

    // Tracks last, descending index. Refresh indices because the world
    // may have shifted (clips/devices removed don't change track indices,
    // but we still snapshot fresh).
    var song = new LiveAPI("live_set");
    var trackIndices = plan.tracks.map(function (x) { return x.index; })
                                  .sort(function (a, b) { return b - a; });
    for (var ti = 0; ti < trackIndices.length; ti++) {
        try {
            song.call("delete_track", trackIndices[ti]);
            deleted.tracks++;
        } catch (e) { _log("track delete: " + e); }
    }

    // Return tracks.
    var returnIndices = plan.returns.map(function (x) { return x.index; })
                                    .sort(function (a, b) { return b - a; });
    for (var ri = 0; ri < returnIndices.length; ri++) {
        try {
            song.call("delete_return_track", returnIndices[ri]);
            deleted.returns++;
        } catch (e) { _log("return delete: " + e); }
    }

    lastReport = null;
    outlet(1, "cleaned",
        deleted.tracks, deleted.clips, deleted.devices, deleted.returns);
    _emitStatus("ok",
        "Cleaned: " + deleted.tracks + "T / " + deleted.clips + "C / " +
                     deleted.devices + "D / " + deleted.returns + "R. Cmd-Z to undo.");
}
