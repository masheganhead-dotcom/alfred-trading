// float_mixer.js — Alfred M4L Suite: Float Mixer
//
// Drives a floating mixer window: a second Max patcher window that lives
// alongside Ableton Live's main window, Logic / Cubase style. Reflects
// every regular (non-group) track in the set with a vol / pan / mute /
// solo / arm / send strip, all wired through the LiveAPI.
//
// The window is brought up by the patch sending the following messages
// to a [thispatcher] (or a subpatcher's thispatcher):
//
//   window flags nofloat       ; reset
//   window flags float         ; mark as floating
//   window exec                ; apply
//   window size 600 400
//   front
//
// This JS handles the LiveAPI side: enumerate tracks on load and on
// changes, expose getters/setters for each strip, and observe Live
// state changes so the floating UI stays in sync.
//
// Recognised messages:
//   "rebuild"               — re-scan tracks, emit list to the UI
//   "vol <idx> <0..1>"      — set track idx volume
//   "pan <idx> <-1..1>"
//   "mute <idx> <0|1>"
//   "solo <idx> <0|1>"
//   "arm  <idx> <0|1>"
//   "send <idx> <send> <0..1>"
//   "name <idx>"            — request the name of track idx (emits)
//
// Outlets:
//   0: status text
//   1: structured updates for the UI ("strip <idx> <prop> <val>" ...)

include("alfred-liveapi.js");

autowatch = 1;
inlets = 1;
outlets = 2;

var trackIds = [];   // [trackId, ...] for non-group regular tracks
var observers = [];  // LiveAPI observer handles, released on rebuild

// ---------------------------------------------------------------------
// Rebuild
// ---------------------------------------------------------------------

function bang() { rebuild(); }

function rebuild() {
    _releaseObservers();
    trackIds = [];

    var song = new LiveAPI("live_set");
    var raw = song.get("tracks");
    for (var i = 0; i < raw.length; i += 2) {
        if (raw[i] !== "id") continue;
        var id = parseInt(raw[i + 1], 10);
        var t = new LiveAPI("id " + id);
        if (t.get("is_foldable")[0] === 1) continue;   // skip group tracks
        trackIds.push(id);
    }

    outlet(1, "clear");
    for (var n = 0; n < trackIds.length; n++) _emitStrip(n);

    // Observe the song's track list so we rebuild when tracks are added/removed.
    var songObserver = new LiveAPI(function (args) {
        if (args[0] === "tracks") rebuild();
    }, "live_set");
    songObserver.property = "tracks";
    observers.push(songObserver);

    _emitStatus("ok", trackIds.length + " tracks loaded.");
}

function _emitStrip(idx) {
    var t = new LiveAPI("id " + trackIds[idx]);
    outlet(1, "strip", idx, "name",  String(t.get("name")[0]));
    outlet(1, "strip", idx, "color", t.get("color")[0]);
    outlet(1, "strip", idx, "vol",   _mixerValue(t, "volume"));
    outlet(1, "strip", idx, "pan",   _mixerValue(t, "panning"));
    outlet(1, "strip", idx, "mute",  t.get("mute")[0]);
    outlet(1, "strip", idx, "solo",  t.get("solo")[0]);
    outlet(1, "strip", idx, "arm",   t.get("can_be_armed")[0] === 1
                                       ? t.get("arm")[0] : -1);
    _emitDevices(idx);
}

// ---------------------------------------------------------------------
// Plugin slots (the Logic-mixer headline feature)
// ---------------------------------------------------------------------

function _emitDevices(idx) {
    var t = new LiveAPI("id " + trackIds[idx]);
    var devs = t.get("devices");
    var slot = 0;
    for (var i = 0; i < devs.length && slot < 4; i += 2) {
        if (devs[i] !== "id") continue;
        var did = parseInt(devs[i + 1], 10);
        var dv = new LiveAPI("id " + did);
        outlet(1, "strip", idx, "fx", slot,
            String(dv.get("name")[0]),
            dv.get("is_active")[0]);
        slot++;
    }
    // Pad the rest of the visible slots with empty markers.
    while (slot < 4) {
        outlet(1, "strip", idx, "fx", slot, "—", 0);
        slot++;
    }
}

function fx_active(stripIdx, slotIdx, on) {
    var dev = _deviceAtSlot(stripIdx, slotIdx);
    if (!dev) return;
    dev.set("is_active", parseInt(on, 10) === 1 ? 1 : 0);
}

function fx_open(stripIdx, slotIdx) {
    var i = parseInt(stripIdx, 10);
    if (i < 0 || i >= trackIds.length) return;
    var trackId = trackIds[i];

    // 1. Select the track in Live.
    var songView = new LiveAPI("live_set view");
    songView.set("selected_track", "id " + trackId);

    // 2. Un-collapse the chosen device so its UI is visible.
    var dev = _deviceAtSlot(stripIdx, slotIdx);
    if (dev) {
        var dvView = new LiveAPI(dev.unquotedpath + " view");
        try { dvView.set("is_collapsed", 0); } catch (e) { /* older Live */ }
    }

    // 3. Open Live's device-chain detail view.
    var appView = new LiveAPI("live_app view");
    try { appView.call("show_view", "Detail/DeviceChain"); }
    catch (e) { _log("show_view failed: " + e); }
}

function fx_delete(stripIdx, slotIdx) {
    var i = parseInt(stripIdx, 10);
    if (i < 0 || i >= trackIds.length) return;
    var t = new LiveAPI("id " + trackIds[i]);
    try {
        t.call("delete_device", parseInt(slotIdx, 10));
        _emitDevices(i);
    } catch (e) { _log("delete_device failed: " + e); }
}

function _deviceAtSlot(stripIdx, slotIdx) {
    var i = parseInt(stripIdx, 10);
    var s = parseInt(slotIdx, 10);
    if (i < 0 || i >= trackIds.length) return null;
    var t = new LiveAPI("id " + trackIds[i]);
    var devs = t.get("devices");
    var count = 0;
    for (var k = 0; k < devs.length; k += 2) {
        if (devs[k] !== "id") continue;
        if (count === s) return new LiveAPI("id " + parseInt(devs[k + 1], 10));
        count++;
    }
    return null;
}

function _mixerValue(track, paramName) {
    // mixer_device.<paramName>.value
    var mixerPath = track.unquotedpath + " mixer_device " + paramName;
    var p = new LiveAPI(mixerPath);
    return p.get("value")[0];
}

// ---------------------------------------------------------------------
// Setters
// ---------------------------------------------------------------------

function vol(idx, v) { _setMixer(idx, "volume", parseFloat(v)); }
function pan(idx, v) { _setMixer(idx, "panning", parseFloat(v)); }

function mute(idx, v) {
    var t = _byIndex(idx); if (!t) return;
    t.set("mute", parseInt(v, 10) === 1 ? 1 : 0);
}
function solo(idx, v) {
    var t = _byIndex(idx); if (!t) return;
    t.set("solo", parseInt(v, 10) === 1 ? 1 : 0);
}
function arm(idx, v) {
    var t = _byIndex(idx); if (!t) return;
    if (t.get("can_be_armed")[0] !== 1) return;
    t.set("arm", parseInt(v, 10) === 1 ? 1 : 0);
}
function send(idx, sendIdx, v) {
    var t = _byIndex(idx); if (!t) return;
    var p = new LiveAPI(t.unquotedpath +
        " mixer_device sends " + parseInt(sendIdx, 10));
    p.set("value", parseFloat(v));
}

function _setMixer(idx, paramName, v) {
    var t = _byIndex(idx); if (!t) return;
    var p = new LiveAPI(t.unquotedpath + " mixer_device " + paramName);
    p.set("value", v);
}

function _byIndex(idx) {
    var i = parseInt(idx, 10);
    if (i < 0 || i >= trackIds.length) return null;
    return new LiveAPI("id " + trackIds[i]);
}

// ---------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------

function _releaseObservers() {
    for (var i = 0; i < observers.length; i++) {
        try { observers[i].id = 0; } catch (e) { /* ignore */ }
    }
    observers = [];
}

// Live's "freeing" event hook on device-removal.
function unloadbang() { _releaseObservers(); }
