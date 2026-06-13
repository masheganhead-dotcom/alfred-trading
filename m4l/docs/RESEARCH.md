# Max for Live — 2025/2026 Landscape Survey

A snapshot of the most influential, popular, and technically interesting
Max for Live devices and open-source projects from the last twelve
months, used to inform the design of the Alfred M4L Suite.

## 1. The dominant trend: generative / AI MIDI

Across the major release calendars (Ableton blog, maxforlive.com,
Isotonik, Gearnews) the conspicuous theme of 2025 was **AI-driven MIDI
generation**. These are the bellwethers.

### PinkAI — 4 Chamber Sound (Aug 2025)
A three-module ecosystem:

- **Conductor** — picks harmonies (chord progressions / mode shifts).
- **Performer** — interprets those chords with pitch / range / rhythm /
  probability controls.
- **HarmonAIzer** — up to nine voices, each with its own chord tone,
  timing offset, probability, and a per-voice MIDI delay line.

What makes it interesting: the *decoupling of harmony and performance*
across separate devices that talk over a virtual bus. The
Conductor/Performer split is a clean architectural pattern that you
could reuse for other generative tools.

### ChatDSP — Dillon Bastan
Describe the device you want in plain English; ChatDSP synthesises a
Max for Live device on the fly by routing the description through
OpenAI / Anthropic and assembling the resulting patch. Pioneering — but
also a reminder that the *Claude API itself* is a viable component of a
M4L workflow.

### Patter — Adam Florin (Ableton-hosted)
A "freeform generative MIDI" device. Less rule-based than the
PinkAI/Bassik camp; more about wild, exploratory pattern generation
with deep randomisation controls.

### Bassik AI [Acid Model] — 510k Arts / Isotonik
An 8-step sequencer trained on hundreds of authentic 303 patterns.
Notable because it's one of the first publicly shipping M4L devices to
embed a *trained model* rather than a rule engine.

### TechnoGAN
Neural-net sampler that generates looping quarter-note techno samples.
Same playbook as Bassik AI but at the audio (not MIDI) level.

**Takeaway for our suite:** AI/generative is already crowded. The
*plumbing around AI workflows* — getting AI-generated audio into a Live
session — is not.

### Adjacent: session-housekeeping devices

A second cluster that emerged from the same surveys is **session
hygiene** — devices that clean up Live sets by removing muted clips,
empty tracks, inactive plugins, etc. References used while building
the Alfred Session Cleaner device:

- [Liveset Cleaner — Live Workflow Tools](https://liveworkflowtools.gumroad.com/l/livesetcleaner) ($14) — the most polished commercial entry; empty tracks, muted clips, inactive devices, unused sends.
- [Delete All Disabled Clips — ElisabethHomeland](https://www.elisabethhomeland.com/products/delete-all-disabled-clips-by-elisabethhomeland-maxforlive-device-for-ableton-live) — free, Arrangement / Session / Both scope.
- [Delete Muted Clips — Dennis DeSantis](https://maxforlive.com/library/device/8364/delete-muted-clips) — Ableton's own designer; free, both views.

The Alfred Session Cleaner differs in three ways: (1) a **SCAN → CLEAN
two-step workflow** so destructive ops can be previewed, (2) per-category
toggles for *which* kinds of things to remove, (3) an explicit
"never delete groups" invariant.

### Adjacent: floating-window mixer concepts

A long-running M4L request is a Logic / Cubase-style **always-visible
mixer window**. Existing reference:

- [synnack — Float Mixer](https://synnack.com/blog/post/128/new-max-for-live-device-float-mixer) — proves the `[thispatcher] window flags float` technique works in M4L on macOS and Windows.
- [Cycling '74 forum — Floating window discussion](https://cycling74.com/forums/floating-window-2/replies/1) — the canonical thread on `topmost`/`floating` flag behaviour and its OS-specific quirks.

The Alfred Float Mixer reuses that floating-window technique and adds
the **plugin-slot row** Logic users specifically expect; the
implementation plan is in `devices/float-mixer/PLAN.md`.

## 2. Community-favourite free utilities

These keep showing up on every "best free M4L" list (Production Music
Live, Cymatics, Transition Studio, elphnt.io).

| Device | Why people love it |
| --- | --- |
| **Hocket II** | Distributes a melody across multiple instruments, one note at a time. Sender + multiple receivers. Tiny idea, massive payoff. |
| **Tintinnabulator** | Real-time MIDI implementation of Arvo Pärt's tintinnabuli technique. Niche, but the best of its kind. |
| **Flechtwerk** | Software clone of the Mutable Instruments Plaits Eurorack module. |
| **Visage** | FM drum synth with built-in X0X-style sequencer and effects. |
| **Fors Opal** | Four-voice rhythm machine with parameter locks, probability, conditionals, ratcheting, per-track length / division / traversal. The Elektron-in-Live people. |
| **Divisions** — Dillon Bastan | Polyrhythm sequencer. |

The pattern across these: **strong single idea, deep parameterisation,
visible UI feedback.** Devices that try to do too much tend not to make
the lists.

## 3. Open-source reference projects (GitHub)

Used as code reference while building the suite.

| Repo | Why it's a useful reference |
| --- | --- |
| [`EnvelopSound/EnvelopForLive`](https://github.com/EnvelopSound/EnvelopForLive) | Largest, cleanest open-source M4L project. Ambisonic 3D panning toolkit. Good source for multi-device coordination patterns and `live.*` UI conventions. |
| [`Ableton/maxdevtools`](https://github.com/Ableton/maxdevtools) | First-party. Includes the official **M4L Production Guidelines** (CPU, freezing, parameter naming, etc.). Anything you ship should pass these. |
| [`little-scale/littlescale-max-for-live`](https://github.com/little-scale/littlescale-max-for-live) | Compact, idiomatic devices by a prolific author. Great for studying minimal patches. |
| [`cvolm/maxforlive`](https://github.com/cvolm/maxforlive) | MIDI effects + utilities. Comparable in scope to what we're building. |
| [`aspitarl/PerforM4L`](https://github.com/aspitarl/PerforM4L) | Performance/jam-oriented devices. |
| [`akokai/granolatech-M4L`](https://github.com/akokai/granolatech-M4L) | Granular and audio effects. |
| [`robjac/MaxForLiveDevices`](https://github.com/robjac/MaxForLiveDevices) | Mixed bag, useful for UI patterns. |

Also: the [maxforlive.com](https://maxforlive.com/) library hosts
10,000+ devices; the comments are an underrated source of bug reports
and feature requests for any niche.

## 4. Technical constraints worth knowing up front

These shaped the suite's design more than anything else.

### LiveAPI cannot freeze / flatten a track
The Live Object Model exposes `is_frozen` and `can_be_frozen` as
read-only attributes — there is no function call to *cause* a freeze.
Workarounds in the wild rely on OS-level key simulation, which is
fragile and platform-specific. This is why our "Smart Group Resample"
device is a *resampling* helper rather than a freeze helper: it does
the same job (free up CPU by rendering a group to audio) using only
LiveAPI primitives that actually exist.

### `.amxd` cannot be authored outside Max
The file format is `[binary header] + [Max patcher JSON] + [binary
footer]`. Tools that strip the binary and edit the JSON work for trivial
patches but break on most non-trivial ones. The reliable path is: ship
`.maxpat` from source control, open in Max, "Save As → Max for Live
Device (.amxd)". The `BUILD_GUIDE.md` documents this.

### `maxurl` is good enough for HTTP, but not for streaming
`maxurl` (libcurl wrapper) handles GET/POST/PUT/DELETE and can save the
response to disk. That's sufficient for our Suno Bridge use case (fetch
a finished MP3/WAV). It is not sufficient for streaming protocols
(HLS/DASH); those need a JS-level workaround or an external tool.

### System audio capture is an OS problem, not a Max problem
On macOS you need **BlackHole** or **Loopback**; on Windows you need
**VB-Audio Cable** or similar. No M4L device can magically capture
system audio without a virtual driver. Our "System Audio Capture"
device assumes one of these is installed and concentrates on the
*ergonomics around it*: auto-creating tracks, setting input routing,
arming, naming clips.

## 5. UX patterns we're copying

From the survey:

- **Big primary action button.** Hocket II, Patter, Bassik AI all front
  one obvious "do the thing" affordance.
- **`live.dial` + `live.numbox`** pair for any numeric parameter so it
  shows up properly in clip automation lanes.
- **Presence indicator.** Devices that need an external dependency
  (BlackHole, internet) check on load and surface a clear "ready /
  not ready" light.
- **Compact info text** in the device strip explaining the current
  state. No modal dialogs — Live's chrome doesn't support them.

These show up consistently in the design of all three devices in this
suite.

## Sources

- [Best Max for Live Devices — elphnt.io](https://elphnt.io/max-for-live-curated-collection/)
- [Top 10 Free Max for Live Devices — Production Music Live](https://www.productionmusiclive.com/blogs/news/top-10-free-max-for-live-devices-game-changer-tools)
- [Ultimate Free Max for Live Devices — Cymatics](https://cymatics.fm/blogs/production/ultimate-list-free-max-live-devices)
- [Game-Changing Max for Live Devices — Transition Studio](https://www.transition.studio/blog/Ten-game-changing-max-for-live-devices-every-ableton-producer-needs)
- [maxforlive.com library](https://maxforlive.com/library/)
- [PinkAI: A Max for Live Ecosystem for Generative Music — WaveInformer](https://waveinformer.com/2025/08/17/pinkai-a-max-for-live-ecosystem-for-generative-music-creation/)
- [PinkAI – 4 Chamber Sound](https://4chambersound.com/pinkai/)
- [Dillon Bastan ChatDSP — Gearnews](https://www.gearnews.com/dillon-bastan-chatdsp-tech/)
- [Patter by Adam Florin — Ableton](https://www.ableton.com/en/blog/patter-by-adam-florin/)
- [Bassik AI Acid Model — Isotonik Studios](https://isotonikstudios.com/product/bassik-ai-acid-model/)
- [Way to freeze + flatten tracks via Live API? — Cycling '74 Forums](https://cycling74.com/forums/way-to-freeze-flatten-tracks-via-live-api)
- [Creating Devices that use the Live API — Max 8 Docs](https://docs.cycling74.com/max8/vignettes/live_api)
- [Max for Live Production Guidelines — Ableton/maxdevtools](https://github.com/Ableton/maxdevtools/blob/main/m4l-production-guidelines/m4l-production-guidelines.md)
- [maxurl Reference — Max 8 Docs](https://docs.cycling74.com/max8/refpages/maxurl)
- [Max for Live Device File Format thread](https://cycling74.com/forums/max-for-live-device-file-format)
- [Sampling the World — Loopback Audio + Live 12.3](https://medium.com/@flood.circuit/sampling-the-world-how-loopback-audio-and-ableton-live-12-3-transform-radio-into-art-5f0e91e0e77e)
- [How to route audio between applications — Ableton Help](https://help.ableton.com/hc/en-us/articles/360010526359-How-to-route-audio-between-applications)
