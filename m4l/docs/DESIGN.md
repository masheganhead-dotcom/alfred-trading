# Alfred M4L Suite — Design

Three devices, one shared mental model: **"the boring producer chores
that AI tools made more frequent."** Each device is small enough to
ship, focused enough to be useful, and built only on LiveAPI primitives
that actually exist.

## Shared conventions

All three devices follow the same layout and behaviour rules so the
suite feels coherent on a track strip.

- **Status LED** (`live.text` styled as button, non-interactive) —
  green when ready, red when a precondition is missing (e.g. BlackHole
  not installed, no internet, no Suno URL pasted).
- **One primary action button** — the verb of the device, in large
  text. `live.text` in button mode, fires the JS entry point.
- **Compact secondary controls** — `live.dial` for numeric params,
  `live.menu` for enums. All wrapped in `live.numbox` companions so
  Live's automation lane shows real values.
- **Presentation mode** is on; the editing canvas holds the wiring and
  is not visible to the end user.
- **Parameter naming** follows the Ableton M4L Production Guidelines:
  no spaces in the long name, Title Case for the short name.

A small shared JS helper module lives in `devices/_lib/alfred-liveapi.js`
and contains the routines every device needs:

- `getSelectedTrack()` — current `selected_track` id.
- `createAudioTrack(name)` — adds a new audio track at the end, returns
  its id.
- `setInputRouting(trackId, channelType, channel)` — sets a track's
  `available_input_routing_channels` by channel name.
- `armTrack(trackId, armed)` / `setMonitoring(trackId, mode)`.
- `triggerSessionRecord(on)` / `triggerArrangementRecord(on)`.
- `findInputChannel(predicate)` — locates a channel by partial name
  match (used to auto-find BlackHole / Loopback / VB-Cable).

This is the only piece of code shared across devices; everything else
is per-device.

---

## Device 1: System Audio Capture

**Purpose.** One click to record whatever your computer is playing —
Suno previews, YouTube, browser radio, ChatGPT voice — onto a fresh
audio track in Live.

**Why it exists.** Producers using AI tools constantly need to capture
the output of a web service. The status quo is: install BlackHole, open
Live's preferences, create a track, set its input to BlackHole, arm it,
press record, stop, name the clip, rename the track. Eight steps. This
device collapses that to one button.

### Flow
1. On device load, scan input channels. If a BlackHole-/Loopback-/
   VB-Cable-looking channel is present, store its id and turn the
   status LED green. Otherwise red.
2. Big **REC** button:
   - Create a new audio track named `Capture YYYY-MM-DD HH:MM`.
   - Set its input routing to the detected virtual driver.
   - Set monitoring to `In`.
   - Arm the track.
   - Trigger session record (or arrangement record, depending on a
     toggle exposed on the device).
3. Pressing **REC** again stops record, disarms the track, and (if a
   clip was created) renames the clip to the same timestamp.
4. **Hold modifier** (an `Auto-stop after` dial, in seconds) lets you
   set a max length — the JS uses a `[delay]` driven from Live's
   transport so it survives transport stop/start cleanly.

### UI map
```
[ ● status ]  [        REC        ]   Auto-stop: [ dial ] s
                                       Mode:      [ Session ▾ ]
```

### LiveAPI calls used
- `live_app.get_document` → `tracks`, `create_audio_track`
- `Track.available_input_routing_channels`, `input_routing_channel`
- `Track.arm`, `Track.current_monitoring_state`
- `Song.session_record`, `Song.record_mode`
- `Track.clip_slots[].clip.name`

All Live 11.1+ ; verified Live 12.

---

## Device 2: Smart Group Resample

**Purpose.** Render a Group track (or any selection of tracks routed
to a return / group) down to a single audio clip on a new track, to
free up CPU. Effectively a *manual* freeze with no plugin offload
trade-offs.

**Why it exists.** LiveAPI has no `freeze` / `flatten` function.
Bouncing a group by hand is six steps. This device automates the
LiveAPI-reachable parts and leaves a one-bar pause where the user
hits Play/Stop themselves.

### Flow
1. User selects the group track to bounce.
2. Press **PREP**:
   - Find the selected track via `Song.view.selected_track`.
   - If it's a group, capture its bar length (longest contained
     non-empty clip).
   - Create a new audio track named `<group name> [Resample]`.
   - Route its input from the group track's output (`input_routing_type`
     → the group, `input_routing_channel` → Pre FX / Post FX selectable
     on the device).
   - Set monitoring `In`, arm it.
   - Position the play-head at the start of the bounce range.
3. Press **CAPTURE** to trigger Arrangement record from bar 1 to the
   detected end. Auto-stop at the calculated end position.
4. After capture: disarm, set monitoring `Auto`, **optionally mute
   the original group** (toggle).

### UI map
```
[ ● status ]  [ PREP ] → [ CAPTURE ]   Tap:  [ Pre FX ▾ ]
                                       Mute original: [ ☐ ]
                                       Length: [ auto / 4 / 8 / 16 bars ]
```

### Why this is a "resample" not a "freeze"
A true freeze keeps plugins instantiated; a resample commits a single
audio file and the user can delete the source. We can do the latter
fully through LiveAPI; we can't do the former. The device is named
honestly.

---

## Device 3: Suno Bridge

**Purpose.** Paste a Suno URL (or any direct audio URL — Suno's CDN,
SoundCloud's direct, anywhere `maxurl` can reach) into the device; it
downloads the file and drops it onto a new audio track at the
play-head.

**Why it exists.** The current Suno → Ableton workflow is: open Suno,
download the WAV, find the file in Downloads, drag it into the
session, name the track. This device makes it one paste-and-press
click.

### Flow
1. User pastes URL into the `live.text` text-entry field (or uses an
   `umenu` history of the last 8 URLs).
2. Press **PULL**:
   - JS extracts a sensible filename from the URL.
   - `[maxurl] @writefile` saves the response to
     `~/Music/AlfredM4L/<filename>` (configurable path on the device).
   - On completion, JS creates a new audio track, names it after the
     filename, and inserts the file as a clip at the current play-head
     in the Arrangement view (or in the first empty slot of the
     selected scene in Session view).
3. Progress bar / status text shows `Downloading… 0%` → `Imported`.
4. **History menu** retains last 8 URLs for re-import.

### UI map
```
[ ● status ]  URL: [______________________]      [ PULL ]
                History: [ last-8 ▾ ]            View: [ Arr ▾ / Sess ]
              Progress: [▓▓▓▓▓▓░░░░] 60%
```

### LiveAPI calls used
- `Song.create_audio_track`
- `Track.clip_slots[].create_clip(length)` and `Clip.set_path` (Session)
- `Track.create_audio_clip(file_path, position)` (Arrangement, Live 11.2+)
- `Song.current_song_time` to position the clip
- `Song.view.selected_scene`

### Risks acknowledged
- Suno's URLs may be auth-gated; this device works on the public
  direct-download URL Suno exposes after you've signed in and opened
  the share link. We don't try to scrape or auth-spoof.
- Files are saved unencrypted to `~/Music/AlfredM4L/`. That's a feature
  (the user can re-use them) but is documented in the README so it
  isn't a surprise.

---

## What was considered and dropped

- **Full Suno API integration with prompt → render → import.** Suno
  doesn't currently publish a stable public API for prompt-driven
  generation; building on the leaked endpoints would break on a
  monthly basis. Dropped.
- **Direct freeze/flatten via OS key simulation.** Possible with
  `[shell]` or `[ofelia]` externals but flaky cross-platform, and the
  user has to grant accessibility permissions on macOS. Dropped in
  favour of the Resample design.
- **A fourth device for "system audio + auto-trim silence".** The
  trim could be a feature flag on System Audio Capture instead of a
  whole new device. Deferred.
