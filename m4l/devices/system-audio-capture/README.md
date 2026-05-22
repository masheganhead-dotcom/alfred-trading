# System Audio Capture

One click → record whatever your computer is playing onto a fresh Live
audio track. Auto-detects BlackHole / Loopback / VB-CABLE.

## Requires

- Ableton Live 12
- Max 8.5+
- A virtual audio driver:
  - **macOS:** [BlackHole 2ch](https://existential.audio/blackhole/) (free) or [Loopback](https://rogueamoeba.com/loopback/) (paid).
  - **Windows:** [VB-Audio CABLE](https://vb-audio.com/Cable/) (donationware).
- The driver set as a **system output** (or piped into one via an
  aggregate device) and exposed as an **input** in Live → Preferences →
  Audio → Input Config.

## Build

Open `SystemAudioCapture.maxpat` in Max → File → Save As… → file type
**Max for Live Device (.amxd)** → Audio Effect. See
`../../docs/BUILD_GUIDE.md`.

Make sure `system_audio_capture.js` and `alfred-liveapi.js` are on
Max's search path (Options → File Preferences → Search Path).

## Use

1. Drop the device on **any audio track** in Live (it just needs a host).
2. Press **Scan** once to confirm the driver is detected (status text
   should turn green).
3. Press **REC**. A new audio track named `Capture YYYY-MM-DD HH:MM`
   appears, gets routed to the driver, armed, and starts recording.
4. Press **REC** again to stop.
5. Optional: dial in **Auto-stop** seconds for a hard cap, or switch
   **Mode** between Session and Arrangement.

## Parameters

| Name | Type | Notes |
| --- | --- | --- |
| `rec_btn` | toggle | Primary action. Toggling = start/stop. |
| `scan_btn` | momentary | Re-runs driver detection. |
| `mode_menu` | enum | `Session` (default) or `Arrangement`. |
| `auto_stop_sec` | float | 0 = disabled; otherwise seconds. |

## Known limits

- Live's input routing for newly-created tracks defaults to *Ext. In
  1/2*. We override it via LiveAPI; if the driver name has changed
  since the last load, hit **Scan** first.
- If you have multiple BlackHole-like devices, the first one matched
  wins. Rename the channels in Live's preferences to disambiguate.
