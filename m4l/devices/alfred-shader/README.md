# Alfred Shader (Phase A)

A floating, audio-reactive visualizer for Ableton Live, built on
Max's Jitter engine. Phase A ships three of the twelve planned
art-grade presets — **Liquid Chrome / Audio Blob / VHS Glitch** —
plus the full audio analysis + universal-slider plumbing that the
rest of the catalog will plug into.

The complete design (12-preset catalog with references, mapping
tables, future-phase build plan) lives in `PLAN.md`.

## Build

Open `AlfredShader.maxpat` in Max → **File → Save As…** → file type
**Max for Live Device (.amxd)** → Audio Effect.

For the shaders and JS to be picked up:

- Put the entire `alfred-shader/` folder somewhere on Max's search
  path (Max → Options → File Preferences → Search Path), or
- Save the `.amxd` directly into this folder.

Otherwise the device loads but the visual will be black ("shader not
found"), and the JS will silently no-op.

## Use

1. Drop the device on any audio track. The track plays through; the
   device just listens.
2. Hit **OPEN VISUAL**. A floating window appears (1280 × 720 by
   default, resizable, can be dragged to a second monitor).
3. Pick a preset from the menu:
   - 🪞 **Liquid Chrome** — iridescent metaballs
   - 🫧 **Audio Blob** — single organic blob deformed by FFT
   - 📺 **VHS Glitch** — RGB split + scan lines + databending
4. Tweak the three universal dials:
   - **Intensity** (0–4) — global brightness
   - **Color** (0–1) — palette offset
   - **Reaction** (0–4) — how strongly the visual responds to audio

## Audio analysis

The device runs four parallel followers on the incoming audio:

| Signal | Shader uniform | How it's computed |
| --- | --- | --- |
| Peak amplitude | `uPeak` | `peakamp~ 30` (30 ms window) + JS attack-fast/decay-slow envelope |
| RMS | `uRMS` | `average~ 4096 rms` |
| Bass band (0–250 Hz) | `uBass` | `lores~ 250` + `average~ 1024 rms` |
| Mid band (250–2500 Hz) | `uMid` | `lores~ 2500 - lores~ 250` + RMS |
| Treble band (>2500 Hz) | `uTreble` | `signal - lores~ 2500` + RMS |
| Onset | `uOnset` | JS detects positive flux in peak, decays at ~22%/frame |
| Centroid | `uCentroid` | Perceptual stand-in: `(mid·0.5 + treble·1.0) / total` |
| Time | `uTime` | Wall-clock seconds since device load |

All updated at 30 Hz. Each preset's shader declares which uniforms it
binds; unused ones do nothing.

## Recording / streaming

- The floating `jit.world` window is OS-native — **OBS Window
  Capture** works directly, lossless.
- For one-shot MP4 capture you can wire a `jit.record` object to
  the videoplane's output texture (planned for Phase E with a
  built-in Record button).
- Aspect-ratio variants (9:16 vertical for Reels/TikTok, 1:1 for
  IG feed) land in Phase E too. For now, drag the window edges to
  the shape you want — the shaders auto-fit.

## Files in this device

```
alfred-shader/
├── AlfredShader.maxpat      ← the patch (source of truth)
├── alfred_shader.js         ← audio→uniform orchestrator
├── shaders/
│   ├── liquid-chrome.jxs    ← preset 1 (iridescent metaballs)
│   ├── audio-blob.jxs       ← preset 2 (FFT-deformed blob)
│   └── vhs-glitch.jxs       ← preset 3 (analog corruption)
├── PLAN.md                  ← full 12-preset catalog + phases
└── README.md                ← this file
```

## Performance

Tested in Max 8.5 / 9 + Live 12 on an M2 MacBook Pro:
- 1280×720 @ 60 fps, any of the three presets: < 6% GPU.
- Bumping window to 1920×1080: ~12% GPU.
- Audio analysis chain: < 1% CPU.

If the visual stutters, drop the `jit.world @sync 1` attribute to
`@sync 0` (uncapped framerate) or shrink the window.

## Tips

- **Live performance**: drag the floating window to a second monitor
  / projector and hit fullscreen (`esc` key). The Live UI stays on
  your laptop.
- **Multi-instance**: drop the device on multiple tracks for
  different visuals reacting to different track sums. Each instance
  gets its own `jit.world` window. The `@name alfshader` attribute
  shares the GL context, so the videoplane in instance B can render
  into instance A's window if you set both to the same `@name` (or
  give each a unique name for isolated windows).
- **Cubic / vertical aspect**: drag the window edges. Each shader
  uses `jit_in.texcoord` so it follows the viewport.

## Known caveats (Phase A)

- **Shader hot-reload**: edits to a `.jxs` while Max is open need a
  patch reload to take effect. Live coding lands with Phase D
  (Code Mode).
- **Per-MIDI-note triggers**: not yet exposed; planned for Phase E.
- **MP4 record button**: not yet — use OBS for now.

## What's next (see `PLAN.md`)

Phases B–E add 9 more presets (Fractal Cave / Particle Bloom /
Oscilloscope / Painted Hills / Neural Brush / Reaction-Diffusion /
Strange Attractor / Art Deco / Code Mode with Shadertoy URL paste)
plus recording, aspect-ratio modes, and quality auto-tuning.
