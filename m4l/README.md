# Alfred M4L Suite — Utilities for the AI-era Producer

Five Max for Live utility devices designed around modern producer
workflows (Suno, ChatGPT-music, browser radio, CPU-heavy projects,
mixing in a Logic / Cubase style window). Built on the back of a
survey of popular and innovative M4L releases from 2025–2026.

## Devices

| Device | Type | Purpose |
| --- | --- | --- |
| **System Audio Capture** | Audio Effect | One-click record of any system audio (Suno, YouTube, browser radio) into a fresh audio track, with auto-routing for BlackHole / Loopback. |
| **Smart Group Resample** | Audio Effect | Bounce a group (or selection) into a single resampled audio clip, freeing up CPU when LiveAPI's `freeze`/`flatten` is unavailable. |
| **Suno Bridge** | Audio Effect | Paste a Suno (or any direct CDN) URL → device downloads the audio → drops it onto a fresh track at the play-head. |
| **Session Cleaner** | Audio Effect | Scan + clean a Live set: empty tracks, muted clips, inactive devices, empty returns. SCAN previews, CLEAN commits; Cmd-Z undoes. |
| **Float Mixer** | Audio Effect | Floating mixer window (Logic / Cubase style) with vol/pan/mute/solo/arm/sends per non-group track. |

All five devices share the same UI vocabulary and a small helper
module (`devices/_lib/alfred-liveapi.js`) so they feel like one suite.

Float Mixer is the largest of the bunch and has a dedicated
`devices/float-mixer/PLAN.md` describing the staged build-out toward
a full Logic-Pro-style mixer (insert plugin slots, sends, routing,
meters).

## Files in this folder

```
m4l/
├── README.md                  ← you are here
├── docs/
│   ├── RESEARCH.md            ← survey of the M4L scene 2025–2026
│   ├── DESIGN.md              ← architecture & UX of the three devices
│   └── BUILD_GUIDE.md         ← how to turn the .maxpat into .amxd
└── devices/
    ├── system-audio-capture/
    ├── smart-group-resample/
    ├── suno-bridge/
    ├── session-cleaner/
    └── float-mixer/
```

## Quick start

1. Install **Max 8.5+** (bundled with Live 12 Suite, or standalone Max 9).
2. Open `devices/<device>/<Device>.maxpat` in Max.
3. From Max: **File → Save As…** → file type **Max for Live Device
   (.amxd)** → choose Audio Effect.
4. Drag the saved `.amxd` onto any audio track in Live 12.

See `docs/BUILD_GUIDE.md` for the full procedure (and why we can't ship
.amxd files straight out of git).

## Why this stack

The 2025–2026 M4L scene is dominated by **generative / AI MIDI devices**
(PinkAI, Patter, Bassik AI, ChatDSP, TechnoGAN). What's missing is the
plumbing producers need *around* those AI tools: getting audio out of an
AI service and into a Live session is still a copy-paste-import chore.
This suite fills that gap.

The reference list and trend write-up live in `docs/RESEARCH.md`.
