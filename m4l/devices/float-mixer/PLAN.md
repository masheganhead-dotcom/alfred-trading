# Float Mixer Pro — Logic-style Mixer Build Plan

A staged plan for turning the current Float Mixer skeleton into a
Logic-Pro-style mixer for Ableton Live. The shipped V1 already opens a
floating window with vol/pan/mute/solo/arm per track; this document
maps Logic's mixer feature set onto LiveAPI primitives and lays out the
order to build them in, with the honest-limits column at the end.

## 1. Reference: Logic Mixer's per-strip anatomy

Top → bottom on a Logic channel strip:

1. **EQ thumbnail / mini display** (read-only mini-graph)
2. **Insert slots** (FX/instrument plugins, one per row)
3. **Sends slots** (send destinations + level)
4. **Input routing** (source: instrument, audio in, bus)
5. **Output routing** (destination: out 1-2, bus, master)
6. **Pan / balance**
7. **Group assignment**
8. **Automation mode** (Read/Latch/Touch/Write)
9. **R / S / M** (record-arm, solo, mute) + level meter
10. **Volume fader + dB readout**
11. **Track name / colour band / icon**

Of these, the ones that map cleanly onto LiveAPI:

| Logic feature | LiveAPI surface | Implementable? |
| --- | --- | --- |
| Insert plugin list (names) | `Track.devices[i].name` | ✅ |
| Plugin on/off | `Device.is_active` | ✅ |
| Plugin click → open in detail view | `Device.view.is_collapsed = 0` + `Song.view.selected_track` + `Application.View.show_view("Detail/DeviceChain")` | ✅ |
| Plugin reorder (same track) | `Track.move_device(src, dst)` (Live 11.1+) | ✅ |
| Plugin delete | `Track.delete_device(index)` | ✅ |
| Plugin copy/move **across tracks** | — not exposed by LiveAPI — | ❌ (workarounds below) |
| Sends | `Track.mixer_device.sends[i].value` | ✅ |
| Input routing | `Track.input_routing_type` / `input_routing_channel` | ✅ |
| Output routing | `Track.output_routing_type` / `output_routing_channel` | ✅ |
| Pan | `Track.mixer_device.panning.value` | ✅ |
| Mute / Solo / Arm | `Track.mute` / `Track.solo` / `Track.arm` | ✅ |
| Volume fader + dB | `Track.mixer_device.volume.value` | ✅ |
| VU meter | `Track.output_meter_left` / `output_meter_right` | ✅ (observe at ~30 Hz) |
| Track name / colour | `Track.name` / `Track.color_index` | ✅ |
| Automation mode | `Song.session_automation_record` (set-wide), per-param automation state | ⚠️ partial (set-wide only) |
| EQ mini-display | — Live doesn't expose audio data to JS — | ❌ (skip or fake with a static curve) |
| Group assignment | `Track.group_track` (read), no API for *creating* groups | ⚠️ display only |

## 2. Strip layout (what a single strip will look like)

```
┌──────────────────┐  ← strip bg = track.color
│ ▣ EQ Eight       │  insert slot 1 (on/off + name)
│ ▣ Saturator      │  insert slot 2
│ ▣ Compressor     │  insert slot 3
│ + add…           │  reserved row for future "add" UI
├──────────────────┤
│ A: -∞    B: -12  │  send slots (2 visible, scroll for more)
├──────────────────┤
│ In:  Ext.In 1/2  │  routing (read-only label, click to open routing
│ Out: Master      │   menu in Live's mixer)
├──────────────────┤
│      ⊙ pan       │  pan dial (-1..1)
├──────────────────┤
│  R   S   M       │  arm / solo / mute toggles
├──────────────────┤
│  ┌─┐  ┌─┐        │  fader + stereo meter
│  │█│  │░│        │
│  │█│  │░│        │
│  │ │  │ │        │
│  └─┘  └─┘        │
├──────────────────┤
│ track name       │
└──────────────────┘
```

Built as a single `mixer-strip.maxpat` and embedded via `[bpatcher]` —
one bpatcher per visible strip in the floating window. Bpatchers
accept an `args` value, which we use to pass the strip index (0..N-1)
into each instance. The JS already exposes message handlers keyed by
that index.

## 3. Build order

### Phase A — MVP (this PR adds the scaffold)

Goal: opening the floating window shows 8 strips with **vol + pan +
mute + solo + arm + name + colour band**, all live-driven.

- [x] Floating window via `[thispatcher]` (already shipped)
- [x] LiveAPI enumeration + observer (already shipped)
- [ ] `mixer-strip.maxpat` containing exactly: name, colour band, pan
      dial, M/S/R toggles, vol slider. Lives in `devices/float-mixer/`.
- [ ] `FloatMixer.maxpat` updated: replace the placeholder text with 8
      `[bpatcher]` boxes pointing at `mixer-strip.maxpat`, each given
      a unique `args` (0..7) and a unique `varname` (`strip0`…`strip7`).
- [ ] JS `_emitStrip` emits `strip <idx> name <s>` / `strip <idx> vol <v>` …
      The patch routes `strip <idx>` into the matching bpatcher via a
      `[forward strip<idx>]` per strip (Max's `send`/`receive` is the
      standard pattern; the strip patch has matching `r strip<idx>`).
- [ ] When >8 tracks: the 9th+ tracks aren't shown in V1; status text
      says `Showing 8 of N tracks (scroll v2)`.

This is **constructive but partial** — the JS half is real, the strip
patch is a single human-built artefact you visually arrange once in
Max.

### Phase B — Plugin slots (the headline feature)

- [ ] Add to `mixer-strip.maxpat`: a 4-row insert list. Each row is a
      bpatcher (`insert-slot.maxpat`) with: `live.text` (name), `live.toggle`
      (is_active), and a `[textbutton]` "open" that emits
      `open_device <strip_idx> <slot_idx>`.
- [ ] `float_mixer.js` adds handlers:
      - `enumerateDevices(stripIdx)` — read `Track.devices`, emit names.
      - `setDeviceActive(stripIdx, slotIdx, on|off)` — set `is_active`.
      - `openDevice(stripIdx, slotIdx)` — three steps:
        1. `Song.view.selected_track = <track_id>`
        2. `Device.view.is_collapsed = 0`
        3. `Application.View.show_view("Detail/DeviceChain")`
- [ ] Observer: subscribe to `Track.devices` per track so adding/
      removing a plugin in Live's mixer auto-refreshes the strip.

This delivers **"see what plugins are loaded"** (the explicit ask) and
**"click to open"**. The 4-slot cap fits a strip; deeper chains scroll
the strip's slot list (Max `[zl group]` + a slot offset; trivial).

### Phase C — VU meters

- [ ] Add `live.meter~`–style indicator to each strip. Live doesn't
      route audio to M4L JS, but `Track.output_meter_left` /
      `output_meter_right` are observable floats (0..2-ish). Poll at
      30 Hz via a `[metro 33]` per device instance; the bpatcher emits
      the value to a `live.gain~` set to display-only.

### Phase D — Sends + routing labels

- [ ] Sends row: two send dials (`live.dial`) per strip wired to
      `Track.mixer_device.sends[i].value`. `Song.return_tracks` gives
      the names for the labels.
- [ ] Routing row: read-only `live.text` showing
      `Track.input_routing_type.display_name` and likewise for output.
      Click on the row sets `Song.view.selected_track` and shows the
      mixer detail view (where the user picks the routing) — i.e. the
      mixer is a *navigation aid*, the actual routing UI is Live's.

### Phase E — Colour / group / automation

- [ ] Colour band: read `Track.color` (0xRRGGBB integer), set the
      strip's `bgcolor` via `pattr` or by sending a `bgcolor r g b a`
      message to a `[panel]` at the top of the strip.
- [ ] Group display: read `Track.group_track`; if non-null, show the
      group name in a small badge.
- [ ] Automation mode (global only): a single `Re / Off` button on the
      floating window header, toggling `Song.session_automation_record`.

### Phase F — Honest gaps

- **Plugin copy/move across tracks.** Not in LiveAPI. Two
  approaches if it ever becomes a must-have:
  1. **OS-level key simulation.** macOS `osascript -e 'tell
     application "System Events" to keystroke "c" using command down'`
     after positioning Live's focus on the source device, then `"v"`
     on the target. Requires Accessibility permission. Fragile.
  2. **Preset round-trip.** Live API doesn't expose preset save either.
     Dead end without an external helper.
  V1 ships **without** this feature and documents it.
- **EQ mini-display.** Live's audio data isn't reachable from M4L JS.
  Either skip the row, or render a static "EQ Eight" or "EQ Three"
  icon for known device classes (`Device.class_name`) as a visual
  affordance without real spectrum data.
- **Showing all N tracks at once.** Live has unlimited tracks; the
  floating window has finite space. V2 adds horizontal scrolling
  inside the floating patch by parking strips in a scrolling
  subpatcher (`bpatcher offset`). V1 caps at 8.

## 4. File layout once V2 lands

```
devices/float-mixer/
├── FloatMixer.maxpat            ← main, hosts thispatcher + open button
├── mixer-strip.maxpat           ← 1 strip patch, embedded N times
├── insert-slot.maxpat           ← 1 insert row, embedded 4 times per strip
├── float_mixer.js
├── README.md
└── PLAN.md (this file)
```

## 5. Why bpatcher and not a single mega-patch

Building the mixer as one huge flat patch ties the visual layout to
the track count. Bpatcher gives us:

- One source of truth for a strip's look.
- Cheap duplication (N instances of the same patch).
- Per-instance parameter naming via the `args` attribute, so
  `mute_btn` becomes `mute_btn[0]`, `mute_btn[1]`, … and each one
  still appears in Live's automation lane independently.

The Ableton [patch code standard](https://github.com/Ableton/maxdevtools/blob/main/patch-code-standard/patch-code-standard.md)
explicitly recommends bpatcher composition for repeated UI elements.

## 6. Estimated effort

- Phase A: 2-4 hours visual layout + 30 min JS plumbing.
- Phase B: 2-3 hours (insert-slot patch + JS device enumeration).
- Phase C: 1-2 hours (meters + poll loop).
- Phase D: 1-2 hours (sends + routing labels).
- Phase E: ~1 hour (colour + group + automation).
- Phase F: documentation only.

Total ~8-12 hours of focused Max work to ship the full Logic-style
mixer. Phase A alone gives a usable replacement for Live's compact
mixer with the floating-window ergonomic advantage.
