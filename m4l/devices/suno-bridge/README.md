# Suno Bridge

Paste a URL (Suno share-CDN, SoundCloud direct, any reachable .mp3 or
.wav) → device downloads the file → drops it onto a fresh audio track
at the play-head.

## Build

Open `SunoBridge.maxpat` in Max → File → Save As… → **Max for Live
Device (.amxd)** → Audio Effect. See `../../docs/BUILD_GUIDE.md`.

`suno_bridge.js` and `alfred-liveapi.js` must be on Max's search path.

## Use

1. Drop the device on any audio track.
2. On **Suno**, open the song page, click *Share / Download*, copy the
   audio URL (right-click → Copy Audio Address on the player, or the
   direct .mp3 link from the download menu).
3. Paste into the URL text box on the device.
4. Press **PULL**. The file is fetched into
   `~/Music/AlfredM4L/<filename>`, then imported.

By default the clip is dropped at the current Arrangement play-head.
Switch **View → Session** for session-slot import (note: session-slot
audio import has a Live-API gap on some 12.x builds — fall back to
Arrangement mode if it errors).

## Parameters

| Name | Type | Notes |
| --- | --- | --- |
| `pull_btn` | momentary | Kick off the download → import flow. |
| `view_menu` | enum | `Arrangement` (default) or `Session`. |

## Known limits

- **Auth-gated URLs are out of scope.** We make an unauthenticated GET
  via Max's `[maxurl]`. Suno's share URLs work because their CDN
  returns the audio to anonymous clients with a signed URL; if Suno
  rotates the URL or expires it, copy a fresh one.
- **No streaming protocols.** HLS / DASH won't work; you need a direct
  file URL.
- **Download path is global** — `~/Music/AlfredM4L/`. Bring your own
  cleanup. (We deliberately don't auto-delete: the files are useful for
  re-import and stem-separation passes.)
- **Session view import gap.** Live's `ClipSlot.create_clip()` doesn't
  accept a file path on audio slots in some Live 12.x builds; the JS
  surfaces a warning telling the user to switch to Arrangement.
