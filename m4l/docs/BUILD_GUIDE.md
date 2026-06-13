# Build Guide — turning the source into `.amxd`

The `.amxd` Max for Live device format is `[binary header] + [patcher
JSON] + [binary footer]`. The binary sections are written by Max itself
and cannot be reliably hand-rolled. Source control therefore holds
`.maxpat` files (plain JSON) and JS modules; turning them into `.amxd`
is a one-time, manual step in Max.

## Prerequisites

- **Ableton Live 12** (any edition; Suite includes Max).
- **Max 8.5 or later**. Comes bundled with Live 12 Suite; Standard /
  Intro need a Max licence.
- **macOS:** install [BlackHole 2ch](https://existential.audio/blackhole/)
  for System Audio Capture.
- **Windows:** install [VB-Audio CABLE](https://vb-audio.com/Cable/) or
  similar.

## Build steps (per device)

1. Clone or pull this repo.
2. Open Max (standalone, or from inside Live via *Edit* on a Max
   device).
3. **File → Open…** → navigate to
   `m4l/devices/<device-name>/<DeviceName>.maxpat`.
4. The patcher opens in a normal Max window. Verify there are no
   missing-object boxes (red dashed outline). If there are, the most
   common cause is a Max-version mismatch; update Max.
5. **File → Save As…** — in the dialog, set the file type to **Max for
   Live Device (.amxd)** and pick the device kind that matches the
   table below.
6. Save to your User Library:
   `~/Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect/`
   (macOS) — or wherever your `User Library` is. Live will pick it up
   on next refresh.

| Device | Save As → Device Type |
| --- | --- |
| System Audio Capture | Max Audio Effect |
| Smart Group Resample | Max Audio Effect |
| Suno Bridge | Max Audio Effect |

All three are Audio Effects because they need to live on an audio
track and (System Audio Capture / Smart Group Resample) need
`plugin~` / `plugout~` for input monitoring; Suno Bridge is an audio
effect for consistency only.

## After saving

Each device folder contains:
- `<DeviceName>.maxpat` — the patch (source of truth).
- `<device_name>.js` — the JS module loaded via the patch's `[js]`
  object.
- `README.md` — per-device usage docs.

The `[js]` object loads its script by **filename relative to the patch
search path**. Either:
- Save your `.amxd` *into the same folder* as the `.js`, or
- Add the device folder to *Max → File Preferences → Search Path*.

Without one of these, the device will appear to load but the primary
action button will silently do nothing.

## Freezing the device for distribution

Once a device works:

1. **View → Show Project Inspector** (Max).
2. Add the `.js` file to the project's dependencies.
3. **File → Freeze Device**. This embeds the `.js` (and any other
   assets) into the `.amxd`, so the user only needs the single file.

## Verifying it works

For each device, the minimum smoke test:

- **System Audio Capture:** load on an audio track. Status LED green ⇒
  driver found. Hit REC, play any system audio for 3s, hit REC again.
  A new track should exist with a clip of that audio.
- **Smart Group Resample:** select a group with at least one clip,
  drop the device on a *different* audio track, press PREP then
  CAPTURE. A new track should appear with a render of the group.
- **Suno Bridge:** paste a direct WAV/MP3 URL (any public one works
  for testing), press PULL. After a few seconds you should see the
  file imported.

## Troubleshooting

- **"Object js script.js does not respond."** — the `.js` file is not
  on the search path. See *After saving* above.
- **System Audio Capture status LED stays red.** — no virtual audio
  driver detected. Install BlackHole / Loopback / VB-CABLE and
  reload the device.
- **Suno Bridge: maxurl fails with a 403.** — Suno's CDN is rotating
  signed URLs; copy a fresh URL from the share dialog.
- **Smart Group Resample creates a silent clip.** — Live's *In/Auto/Off*
  monitoring state is `Off`; check the new track's monitor toggle.
