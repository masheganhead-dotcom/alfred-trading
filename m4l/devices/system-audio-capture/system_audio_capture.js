// system_audio_capture.js — Alfred M4L Suite: System Audio Capture
//
// Captures whatever your computer is playing (via a virtual audio
// driver — BlackHole / Loopback / VB-CABLE) onto a fresh audio track
// in one click.
//
// Loaded by SystemAudioCapture.maxpat via [js system_audio_capture.js].
//
// Inlets:
//   0: bang / control messages from the patch
//
// Recognised messages (sent from the patch buttons / dials):
//   "scan"                 — re-run driver detection, emit status
//   "rec"                  — toggle record (creates track on first press)
//   "auto_stop <seconds>"  — set the auto-stop length (0 = disabled)
//   "mode <0|1>"           — 0 = session, 1 = arrangement
//
// Outlets:
//   0: status messages → [route status] in the patch
//   1: structured events (track id, clip name) for the patch to display

include("alfred-liveapi.js");   // pulls helpers into this script's scope

autowatch = 1;
inlets = 1;
outlets = 2;

// ---------------------------------------------------------------------
// State
// ---------------------------------------------------------------------

var state = {
    driverChannel: null,
    recording: false,
    trackId: -1,
    autoStopSec: 0,
    mode: 0,                  // 0 session, 1 arrangement
    startedAt: 0
};

// Single Task instance for the auto-stop timer (Max's Task class
// schedules JS callbacks in milliseconds; we reuse a long-lived one).
var autoStopTask = new Task(function () {
    if (state.recording) {
        _log("auto-stop fired");
        rec();
    }
});

// ---------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------

function bang() {
    scan();
}

function scan() {
    state.driverChannel = detectVirtualAudioDriver();
    if (state.driverChannel) {
        _emitStatus("ok", "Driver found: " + state.driverChannel);
        outlet(1, "driver", state.driverChannel);
    } else {
        _emitStatus("warn",
            "No virtual driver detected. Install BlackHole / Loopback / VB-CABLE.");
        outlet(1, "driver", "(none)");
    }
}

function auto_stop(seconds) {
    state.autoStopSec = Math.max(0, parseFloat(seconds) || 0);
    _emitStatus("ok", "Auto-stop: " + state.autoStopSec + "s");
}

function mode(m) {
    state.mode = (parseInt(m, 10) === 1) ? 1 : 0;
    _emitStatus("ok", "Mode: " + (state.mode ? "Arrangement" : "Session"));
}

// ---------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------

function rec() {
    if (!state.recording) _startRec();
    else _stopRec();
}

function _timestampName() {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return "Capture " + d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" +
           pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

function _startRec() {
    if (!state.driverChannel) {
        _emitStatus("err", "Cannot record: no virtual audio driver.");
        return;
    }

    var name = _timestampName();
    var tid = createAudioTrack(name);
    if (tid < 0) {
        _emitStatus("err", "Failed to create capture track.");
        return;
    }
    state.trackId = tid;

    if (!setInputRoutingChannelByName(tid, state.driverChannel)) {
        _emitStatus("warn",
            "Track created but routing to " + state.driverChannel + " failed.");
        // Continue anyway — user can route manually.
    }

    setMonitoring(tid, 0);   // In
    armTrack(tid, true);

    if (state.mode === 0) setSessionRecord(true);
    else startArrangementRecord();

    state.recording = true;
    state.startedAt = Date.now();
    outlet(1, "rec_started", tid, name);
    _emitStatus("ok", "Recording → " + name);

    if (state.autoStopSec > 0) {
        autoStopTask.cancel();
        autoStopTask.schedule(state.autoStopSec * 1000);
    }
}

function _stopRec() {
    autoStopTask.cancel();

    if (state.mode === 0) setSessionRecord(false);
    else stopArrangementRecord();

    if (state.trackId >= 0) {
        armTrack(state.trackId, false);
        setMonitoring(state.trackId, 1);  // Auto
    }

    state.recording = false;
    var dur = ((Date.now() - state.startedAt) / 1000).toFixed(1);
    outlet(1, "rec_stopped", state.trackId, dur);
    _emitStatus("ok", "Stopped (" + dur + "s).");
}
