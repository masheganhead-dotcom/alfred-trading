// smart_group_resample.js — Alfred M4L Suite: Smart Group Resample
//
// Renders a selected Group track down to a single audio clip on a new
// track. A pragmatic alternative to LiveAPI's missing freeze/flatten.
//
// Loaded by SmartGroupResample.maxpat via [js smart_group_resample.js].
//
// Recognised messages:
//   "prep"             — analyse selection, create destination track, route, arm
//   "capture"          — start arrangement record, stop at calculated end
//   "abort"            — abort + clean up destination track
//   "tap <0|1>"        — 0 = Pre FX, 1 = Post FX
//   "mute_src <0|1>"   — whether to mute the source group after capture
//   "length <bars>"    — manual length override (0 = auto-detect)

include("alfred-liveapi.js");

autowatch = 1;
inlets = 1;
outlets = 2;

var state = {
    sourceTrackId: -1,
    destTrackId: -1,
    tap: 1,             // 0 Pre FX, 1 Post FX
    muteSrc: false,
    lengthBars: 0,      // 0 = auto
    capturing: false,
    plannedEndBeats: 0
};

var captureWatchdog = new Task(function () {
    if (state.capturing) _finishCapture();
});

// ---------------------------------------------------------------------
// PREP
// ---------------------------------------------------------------------

function prep() {
    var srcId = getSelectedTrackId();
    if (srcId < 0) {
        _emitStatus("err", "No track selected.");
        return;
    }
    if (!isGroupTrack(srcId)) {
        _emitStatus("warn",
            "Selected track is not a Group. Resampling its raw output anyway.");
    }

    var src = new LiveAPI("id " + srcId);
    var srcName = src.get("name")[0];
    state.sourceTrackId = srcId;

    var destName = String(srcName).replace(/"/g, "") + " [Resample]";
    var destId = createAudioTrack(destName);
    if (destId < 0) {
        _emitStatus("err", "Failed to create destination track.");
        return;
    }
    state.destTrackId = destId;

    // Route input from the source track. Live exposes the source as an
    // input routing *type* (track) and then a *channel* (Pre FX / Post FX).
    var dest = new LiveAPI("id " + destId);
    var avail = dest.get("available_input_routing_types");
    var raw = avail && avail[0];
    var match = null;
    try {
        var parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        var types = parsed.available_input_routing_types || [];
        for (var i = 0; i < types.length; i++) {
            if (types[i].display_name === srcName) { match = types[i]; break; }
        }
    } catch (e) {
        _log("route type parse: " + e);
    }
    if (match) {
        dest.set("input_routing_type",
                 '{"identifier": ' + match.identifier + '}');
        // Pre FX vs Post FX are identified by display_name on the
        // channels endpoint; "Pre FX" / "Post FX" are stable across Live
        // 11/12.
        var channelName = state.tap === 0 ? "Pre FX" : "Post FX";
        setInputRoutingChannelByName(destId, channelName);
    } else {
        _emitStatus("warn",
            "Couldn't auto-route from source. Set input on the new track manually.");
    }

    setMonitoring(destId, 0);   // In
    armTrack(destId, true);

    // Compute planned length.
    var beats = state.lengthBars > 0
        ? state.lengthBars * 4
        : groupBarLength(srcId);
    if (beats <= 0) beats = 16;   // sensible default = 4 bars
    state.plannedEndBeats = beats;

    outlet(1, "prepped", state.destTrackId, beats);
    _emitStatus("ok",
        "Prepped. Will capture " + (beats / 4).toFixed(1) + " bars.");
}

// ---------------------------------------------------------------------
// CAPTURE
// ---------------------------------------------------------------------

function capture() {
    if (state.destTrackId < 0) {
        _emitStatus("err", "Call PREP first.");
        return;
    }

    var song = new LiveAPI("live_set");
    song.set("current_song_time", 0);
    startArrangementRecord();
    state.capturing = true;
    _emitStatus("ok", "Capturing…");

    // Schedule auto-stop based on tempo: beats * (60000 / bpm) ms.
    var bpm = song.get("tempo")[0];
    var ms = (state.plannedEndBeats * (60000 / bpm)) + 250;  // 250ms tail
    captureWatchdog.cancel();
    captureWatchdog.schedule(ms);
}

function _finishCapture() {
    stopArrangementRecord();
    stopTransport();
    if (state.destTrackId >= 0) {
        armTrack(state.destTrackId, false);
        setMonitoring(state.destTrackId, 1);   // Auto
    }
    if (state.muteSrc && state.sourceTrackId >= 0) {
        var src = new LiveAPI("id " + state.sourceTrackId);
        src.set("mute", 1);
    }
    state.capturing = false;
    outlet(1, "captured", state.destTrackId);
    _emitStatus("ok", "Done. Source " +
        (state.muteSrc ? "muted." : "left as-is."));
}

// ---------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------

function abort() {
    captureWatchdog.cancel();
    if (state.capturing) {
        stopArrangementRecord();
        stopTransport();
        state.capturing = false;
    }
    _emitStatus("warn", "Aborted. Destination track left in place.");
}

function tap(v) {
    state.tap = (parseInt(v, 10) === 0) ? 0 : 1;
    _emitStatus("ok", "Tap: " + (state.tap === 0 ? "Pre FX" : "Post FX"));
}

function mute_src(v) {
    state.muteSrc = (parseInt(v, 10) === 1);
    _emitStatus("ok", "Mute source after: " + state.muteSrc);
}

function length(v) {
    state.lengthBars = Math.max(0, parseInt(v, 10) || 0);
    _emitStatus("ok", "Length: " +
        (state.lengthBars === 0 ? "auto" : (state.lengthBars + " bars")));
}
