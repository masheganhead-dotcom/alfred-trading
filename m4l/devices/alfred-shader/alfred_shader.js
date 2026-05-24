// alfred_shader.js — Alfred Shader (Phase A)
//
// Orchestrates the audio-reactive visual:
//   - Receives audio analysis values from the patch (uPeak/uRMS/uBass/
//     uMid/uTreble/uCentroid/uOnset) and global time/transport info.
//   - Maintains rolling smoothing + onset detection.
//   - Pushes every value to jit.gl.slab as named uniforms.
//   - Switches the active .jxs file when the preset menu changes.
//   - Exposes Intensity / Color / Reaction as universal post-mappings.
//
// Inlets:
//   0: messages (audio values + control)
//
// Messages this script understands:
//   "peak <float>"        — raw peak amplitude (0..1)
//   "rms  <float>"        — RMS (0..1)
//   "bass <float>"        — low-band FFT energy (0..~)
//   "mid  <float>"        — mid-band FFT energy
//   "treble <float>"      — high-band FFT energy
//   "centroid <float>"    — spectral centroid normalised to 0..1
//   "preset <int>"        — switch preset by index (0,1,2)
//   "intensity <float>"   — universal slider 0..1
//   "color <float>"       — universal slider 0..1
//   "reaction <float>"    — universal slider 0..2
//   "tick"                — emitted by the patch's metro (~30 Hz) to
//                            push the latest smoothed values out.
//
// Outlets:
//   0: status / log messages
//   1: param messages routed into jit.gl.slab
//       ("param uPeak <f>", "param uOnset <f>", "file <path>", ...)

autowatch = 1;
inlets = 1;
outlets = 2;

// ---------------------------------------------------------------------
// Presets — index → .jxs path (relative to the device's search path)
// ---------------------------------------------------------------------

var PRESETS = [
    { name: "Liquid Chrome", file: "shaders/liquid-chrome.jxs" },
    { name: "Audio Blob",    file: "shaders/audio-blob.jxs"    },
    { name: "VHS Glitch",    file: "shaders/vhs-glitch.jxs"    }
];

var state = {
    currentPreset: -1,
    intensity: 1.0,
    color:     0.5,
    reaction:  1.0,

    // Smoothed audio values
    peak:     0,
    rms:      0,
    bass:     0,
    mid:      0,
    treble:   0,
    centroid: 0.5,

    // Onset detection helpers
    prevPeak: 0,
    onsetDecay: 0,

    startMs: Date.now()
};

// Smoothing coefficients (per ~30Hz tick)
var SMOOTH_FAST = 0.5;   // attack
var SMOOTH_SLOW = 0.08;  // release / sustained values

// ---------------------------------------------------------------------
// Audio inputs (called from patch [snapshot~] / fft chain)
// ---------------------------------------------------------------------

function peak(v) {
    var x = parseFloat(v) || 0;
    // Attack-fast, decay-slow follower
    state.peak = (x > state.peak)
        ? state.peak + (x - state.peak) * SMOOTH_FAST
        : state.peak + (x - state.peak) * SMOOTH_SLOW;

    // Onset = positive flux above a threshold
    var flux = Math.max(0, x - state.prevPeak);
    state.prevPeak = x;
    if (flux > 0.08) state.onsetDecay = 1.0;
}

function rms(v)      { _smooth("rms",      parseFloat(v) || 0); }
function bass(v)     { _smooth("bass",     parseFloat(v) || 0); _updateCentroid(); }
function mid(v)      { _smooth("mid",      parseFloat(v) || 0); _updateCentroid(); }
function treble(v)   { _smooth("treble",   parseFloat(v) || 0); _updateCentroid(); }
function centroid(v) { _smooth("centroid", parseFloat(v) || 0.5); }

function _smooth(field, x) {
    state[field] += (x - state[field]) * SMOOTH_FAST;
}

function _updateCentroid() {
    // Approximate centroid as the high-end weight of the spectrum.
    // Real spectral centroid would need bin-by-bin FFT magnitude; this
    // is a perceptual stand-in built from the 3 bands we already have.
    var denom = state.bass + state.mid + state.treble + 0.001;
    var num   = state.mid * 0.5 + state.treble * 1.0;
    state.centroid = Math.max(0, Math.min(1, num / denom));
}

// ---------------------------------------------------------------------
// Control inputs
// ---------------------------------------------------------------------

function preset(idx) {
    var i = parseInt(idx, 10);
    if (isNaN(i) || i < 0 || i >= PRESETS.length) {
        _log("preset: invalid index " + idx);
        return;
    }
    if (i === state.currentPreset) return;
    state.currentPreset = i;
    outlet(1, "file", PRESETS[i].file);
    outlet(0, "status", "Preset: " + PRESETS[i].name);
}

function intensity(v) { state.intensity = _clip(parseFloat(v), 0, 4); }
function color(v)     { state.color     = _clip(parseFloat(v), 0, 1); }
function reaction(v)  { state.reaction  = _clip(parseFloat(v), 0, 4); }

function _clip(x, lo, hi) {
    if (isNaN(x)) return lo;
    return Math.max(lo, Math.min(hi, x));
}

// ---------------------------------------------------------------------
// Per-frame push — called from a [metro 33] in the patch
// ---------------------------------------------------------------------

function tick() {
    // Decay the onset trigger
    state.onsetDecay *= 0.78;

    var t = (Date.now() - state.startMs) * 0.001;

    outlet(1, "param", "uTime",      t);
    outlet(1, "param", "uPeak",      state.peak);
    outlet(1, "param", "uRMS",       state.rms);
    outlet(1, "param", "uBass",      _normalize(state.bass,   0, 1));
    outlet(1, "param", "uMid",       _normalize(state.mid,    0, 1));
    outlet(1, "param", "uTreble",    _normalize(state.treble, 0, 1));
    outlet(1, "param", "uCentroid",  state.centroid);
    outlet(1, "param", "uOnset",     state.onsetDecay);
    outlet(1, "param", "uIntensity", state.intensity);
    outlet(1, "param", "uColor",     state.color);
    outlet(1, "param", "uReaction",  state.reaction);
}

// FFT-band energy can spike beyond 1; soft-clip into a 0..1ish range so
// uniforms in the shader stay well-behaved.
function _normalize(x, _lo, _hi) {
    return x / (1.0 + Math.abs(x));   // smooth saturator
}

// ---------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------

function bang() {
    // Default preset on load
    preset(0);
    outlet(0, "status", "Alfred Shader ready.");
}

function _log(s) {
    post("[alfred-shader] " + s + "\n");
}
