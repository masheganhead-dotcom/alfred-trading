# Smart Group Resample

Bounce a Group track to a single audio clip on a new audio track.
Effectively a manual freeze without the plugin-offload trade-off —
because the LiveAPI doesn't expose `freeze`/`flatten`, this device
takes the resample path instead, but automates every step.

## Build

Open `SmartGroupResample.maxpat` in Max → File → Save As… → **Max for
Live Device (.amxd)** → Audio Effect. See `../../docs/BUILD_GUIDE.md`.

`smart_group_resample.js` and `alfred-liveapi.js` must be on Max's
search path.

## Use

1. Drop the device on **any audio track** (it's a controller, the
   track is just a host).
2. In Live's mixer, **click the Group track** you want to bounce.
3. Press **PREP**:
   - A new audio track is created next to the group, named
     `<group> [Resample]`.
   - Its input is routed from the group's output (Pre FX / Post FX
     selectable on the device).
   - Monitoring → In, arm on.
   - Length is auto-detected from the longest arrangement clip in the
     group, or you can override via the **Bars** numbox (0 = auto).
4. Press **CAPTURE**:
   - Transport jumps to position 0, Arrangement record turns on,
     play starts.
   - After the planned bar length (+ 250 ms tail) the device stops
     transport, disarms the new track, sets monitoring to Auto.
   - If **MuteSrc** is on, the source group gets muted so you can
     A/B the result.

## Parameters

| Name | Type | Notes |
| --- | --- | --- |
| `prep_btn` | momentary | Create destination track + route. |
| `capture_btn` | momentary | Start the timed capture. |
| `tap_menu` | enum | `Pre FX` / `Post FX`. Default Post FX. |
| `mute_src` | toggle | Mute the source group after capture. |
| `length_bars` | int | 0 = auto-detect, otherwise N bars. |

## Why "resample" and not "freeze"

- LiveAPI exposes `Track.is_frozen` and `Track.can_be_frozen` as
  **read-only**. There is no `freeze()` method.
- All third-party "freeze" devices in the wild simulate keyboard
  shortcuts; this is flaky cross-platform and needs macOS
  Accessibility permissions.
- A resample produces a single committed audio file you can keep or
  delete. CPU benefit identical to a flatten; nothing about plugin
  state is preserved (this is documented intentionally).

## Known limits

- Auto-detected length only inspects **arrangement** clips. Session-view
  clips: use the manual `length_bars` override.
- The 250 ms tail is hard-coded; long reverb tails on the group may
  get truncated. Bounce a couple of extra bars by setting
  `length_bars` manually.
