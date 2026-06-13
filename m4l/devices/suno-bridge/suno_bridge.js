// suno_bridge.js — Alfred M4L Suite: Suno Bridge
//
// Downloads an audio file from a URL (Suno share CDN, SoundCloud
// direct, or any reachable .mp3/.wav) and drops it onto a fresh audio
// track at the play-head.
//
// Recognised messages:
//   "url <string>"      — set the URL to pull
//   "pull"              — start download → import
//   "view <0|1>"        — 0 = Arrangement, 1 = Session
//   "history"           — emit the last-8 URLs to outlet 1
//
// The actual HTTP request is performed by a [maxurl] object in the
// patch; this script orchestrates the LiveAPI side and parses status
// callbacks from maxurl.
//
// maxurl integration: the patch wires the [maxurl] object's output
// through a [route data] / [route done] / [route error] so callbacks
// arrive here as:
//   "download_done <local_path>"
//   "download_error <message>"
//   "download_progress <pct>"

include("alfred-liveapi.js");

autowatch = 1;
inlets = 1;
outlets = 3;
// outlet 0: status text
// outlet 1: structured events
// outlet 2: maxurl trigger (gets a "read <url> <path>" message)

var state = {
    currentUrl: "",
    currentLocalPath: "",
    view: 0,             // 0 arrangement, 1 session
    history: []          // ring buffer of last 8 URLs
};

// ---------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------

function _downloadDir() {
    // ~/Music/AlfredM4L/ — created lazily by maxurl @writefile.
    // Max's [conformpath] would normally do this; we just pass through.
    return "~/Music/AlfredM4L";
}

function _filenameFromUrl(url) {
    var clean = String(url).split("?")[0].split("#")[0];
    var parts = clean.split("/");
    var last = parts[parts.length - 1] || "";
    if (!last || last.indexOf(".") === -1) {
        // No extension — guess from suno URL shape, else default .mp3
        last = "suno-" + Date.now() + ".mp3";
    }
    return last;
}

// ---------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------

function url(s) {
    state.currentUrl = String(s || "").trim();
    _emitStatus("ok", "URL set: " + (state.currentUrl ? "✓" : "(empty)"));
}

function view(v) {
    state.view = (parseInt(v, 10) === 1) ? 1 : 0;
    _emitStatus("ok", "Drop into: " +
        (state.view === 0 ? "Arrangement" : "Session"));
}

function pull() {
    if (!state.currentUrl) {
        _emitStatus("err", "No URL set.");
        return;
    }
    var filename = _filenameFromUrl(state.currentUrl);
    var localPath = _downloadDir() + "/" + filename;
    state.currentLocalPath = localPath;

    _pushHistory(state.currentUrl);
    _emitStatus("ok", "Downloading " + filename + "…");
    outlet(1, "progress", 0);
    // Tell the [maxurl] in the patch to GET state.currentUrl and write
    // the body to localPath. The patch's maxurl is configured with
    // @method get @writefile 1; we send `read <url> <path>`.
    outlet(2, "read", state.currentUrl, localPath);
}

function download_done() {
    var path = state.currentLocalPath;
    _emitStatus("ok", "Downloaded. Importing…");
    outlet(1, "progress", 100);

    var trackName = _filenameFromUrl(state.currentUrl)
        .replace(/\.[^.]+$/, "");
    var tid = createAudioTrack(trackName);
    if (tid < 0) {
        _emitStatus("err", "Failed to create import track.");
        return;
    }

    if (state.view === 0) {
        var pos = currentSongTime();
        if (insertArrangementClip(tid, path, pos)) {
            _emitStatus("ok", "Imported at bar " +
                (pos / 4 + 1).toFixed(2) + ".");
            outlet(1, "imported", tid, path);
        } else {
            _emitStatus("err", "Track created but clip insertion failed. " +
                "Try Live 12.x and check that the file exists at: " + path);
        }
    } else {
        // Session view: target the first empty slot of the selected scene.
        var view = new LiveAPI("live_set view");
        var sceneRef = view.get("selected_scene");
        var sceneIdx = 0;
        if (sceneRef && sceneRef.length >= 2 && sceneRef[0] === "id") {
            // Find this scene's index.
            var song = new LiveAPI("live_set");
            var scenes = song.get("scenes");
            var target = parseInt(sceneRef[1], 10);
            for (var i = 0, k = 0; i < scenes.length; i += 2, k++) {
                if (scenes[i] === "id" && parseInt(scenes[i + 1], 10) === target) {
                    sceneIdx = k; break;
                }
            }
        }
        var slot = new LiveAPI("live_set tracks " +
            _trackIndex(tid) + " clip_slots " + sceneIdx);
        try {
            // Live 11+: ClipSlot.create_clip(length); to set the source
            // file we then call Clip.set("file_path"). Behaviour for
            // *audio* clip slots: create_clip is unavailable, so the
            // arrangement path is preferred. Surface this gap honestly.
            _emitStatus("warn",
                "Session import not yet supported in this build. " +
                "Switch View → Arrangement and run PULL again.");
        } catch (e) {
            _emitStatus("err", "Session import failed: " + e);
        }
    }
}

function download_error(msg) {
    _emitStatus("err", "Download failed: " + (msg || "unknown"));
    outlet(1, "progress", 0);
}

function download_progress(pct) {
    outlet(1, "progress", parseInt(pct, 10) || 0);
}

function history() {
    outlet(1, "history", state.history.slice());
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function _pushHistory(u) {
    var idx = state.history.indexOf(u);
    if (idx !== -1) state.history.splice(idx, 1);
    state.history.unshift(u);
    if (state.history.length > 8) state.history.length = 8;
}

function _trackIndex(trackId) {
    var song = new LiveAPI("live_set");
    var tracks = song.get("tracks");
    for (var i = 0, k = 0; i < tracks.length; i += 2, k++) {
        if (tracks[i] === "id" && parseInt(tracks[i + 1], 10) === trackId) {
            return k;
        }
    }
    return -1;
}
