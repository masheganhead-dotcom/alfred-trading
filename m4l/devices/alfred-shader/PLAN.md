# Alfred Shader — Build Plan & Preset Catalog

A floating audio-reactive visualizer for Ableton Live, built in Max's
Jitter engine. Ships with a curated catalog of **12 viral / award-
winning visual aesthetics** drawn from Shadertoy classics,
TouchDesigner viral effects, and the AV art world (Refik Anadol,
Inigo Quilez, GMUNK, Active Theory). Last slot is a **live coding
mode** for pasting any Shadertoy URL or hand-writing GLSL.

## Why presets, not just modes

The first sketch of this device had "Waves / Spectrum / Orbs" mode
buttons — generic visualizer fare. Those aren't *art*; they're
WMP-circa-2003. The preset catalog below is curated from work that
actually went viral on Twitter, TikTok, Behance, or won FITC /
Kantar / Webby awards.

## Audio analysis pipeline (shared across presets)

The device extracts these signals 30-60× per second and exposes them
to every preset as GLSL uniforms:

| Signal | Source | Used for |
| --- | --- | --- |
| `uPeak` | `peakamp~` | hits / pulses / camera shake |
| `uRMS` | `average~ snapshot~` | sustained intensity, glow |
| `uBass` | `fft~` low band (20-250 Hz) | shape size, depth, mountain height |
| `uMid` | `fft~` mid band (250-2k Hz) | rotation, surface noise |
| `uTreble` | `fft~` high band (2k-16k Hz) | shimmer, color hue |
| `uCentroid` | `zsa.centroid~` | overall brightness / mood |
| `uOnset` | onset detector | particle bursts, glitch triggers |
| `uTempo` | `live.observer Song.tempo` | traversal speed, drift rate |
| `uTime` | global timer | base animation |
| `uMidiNote[]` | optional MIDI input | per-note triggers in live performance |

Every preset declares which of these it uses. The user can re-map any
signal to any preset uniform from the device UI (drag-and-drop matrix).

---

## The preset catalog

### 1. 🪞 Liquid Chrome

**Aesthetic.** Iridescent metallic blob, holographic, slow morphing
chrome surface. Apple-WWDC-fluid-graphics vibe.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uBass` | → | blob deform / vertex displacement |
| `uOnset` | → | ripple emission from contact point |
| `uCentroid` | → | hue shift along chrome gradient |
| `uRMS` | → | reflection intensity |

**Reference.**
- [Artem Demidenko — *Liquid Metal | Iridescent Backgrounds* (Behance)](https://www.behance.net/gallery/159979947/Liquid-Metal-Iridescent-Backgrounds)
- Apple's WWDC keynote fluid-mesh aesthetic
- Shadertoy: search "liquid chrome metaball"

---

### 2. 🌀 Fractal Cave

**Aesthetic.** Path through a Menger-sponge cave, raymarched signed
distance field. Cinema-quality 3D from pure math.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uPeak` | → | camera shake on hits |
| `uRMS` | → | torch/light intensity |
| `uBass` | → | tunnel diameter |
| `uTreble` | → | wall color shift |

**Reference.**
- [Inigo Quilez — *Fractal Cave* (Shadertoy, 2016)](https://www.shadertoy.com/user/iq)
- iq's *Raymarching Distance Fields* article
- [Chris Webb — *Alien Structures* (Shadertoy)](https://www.youtube.com/watch?v=HEzZ0ireRgg)

---

### 3. ✨ Particle Bloom

**Aesthetic.** Cinematic bloom + thousands of bloomed particles
exploding on each beat. Active-Theory-installation polish.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uOnset` | → | particle burst (10k particles instantiate) |
| `uPeak` | → | bloom radius |
| `uMid` | → | particle lifetime / count |
| `uTreble` | → | particle hue, sparkle frequency |

**Reference.**
- [Active Theory installations](https://activetheory.net/)
- TouchDesigner viral bloom tutorials: "Bloom / Particle Systems / Audio Reactive Animation"
- GMUNK / Beeple — psychedelic particle work

---

### 4. 🫧 Audio Blob

**Aesthetic.** A single huge organic blob that morphs to the music —
TouchDesigner's most-shared visual on Instagram in 2024.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uBass` | → | blob radius / overall scale |
| `uFFT[]` | → | per-vertex displacement (frequency-mapped) |
| `uTreble` | → | surface noise (granular roughness) |
| `uMid` | → | rotation speed |

**Reference.**
- [AllTouchDesigner — *Create an Audio-Reactive Blob Visual*](https://alltd.org/create-an-audio-reactive-blob-visual-in-touchdesigner-full-tutorial/)
- [*How to Make the Viral Blob Tracking Effect*](https://alltd.org/how-to-make-the-viral-blob-tracking-effect-in-touchdesigner-free-version/)

---

### 5. 🌌 Neural Brush

**Aesthetic.** Latent-space brushstrokes flowing across screen,
Refik Anadol's "Machine Hallucinations" / "Wind of Boston" style.
Soft, dreamy, painterly motion.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uCentroid` | → | color palette shift |
| `uTempo` | → | brushstroke flow speed |
| `uOnset` | → | new stroke seed |
| `uRMS` | → | opacity / blur radius |

**Reference.**
- [Refik Anadol — *Machine Hallucinations* (Niio profile)](https://www.niio.com/blog/refik-anadol-art-in-a-latent-space-2/)
- [Refik Anadol — NVIDIA AI Art Gallery](https://www.nvidia.com/en-us/research/ai-art-gallery/artists/refik-anadol/)
- "Data as paint, algorithms as brush"

---

### 6. 📈 Oscilloscope

**Aesthetic.** The audio L/R channels drawn as a Lissajous curve on
a green-on-black scope. Music *becomes* the drawing.
*Jerobeam Fenderson's oscilloscope music* aesthetic.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| L channel | → | screen X |
| R channel | → | screen Y |
| `uPeak` | → | beam glow |
| decay setting | → | trail length |

**Reference.**
- [Jerobeam Fenderson — *Oscilloscope Music*](https://oscilloscopemusic.com/)
- Vectrex / Asteroids vector display aesthetic
- This one *also* doubles as a tool for the user to actually compose
  visuals through their audio — many TikTok-viral.

---

### 7. 🏔️ Painted Hills

**Aesthetic.** Raymarched landscape — mountains, drifting clouds,
volumetric light. Built entirely from math. *iq's Painting with
Math* video pushed thousands of devs to learn raymarching for this
look.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uBass` | → | mountain peak height |
| `uTreble` | → | sky tint / sunset hue |
| `uTempo` | → | cloud drift speed |
| `uMid` | → | volumetric light intensity |

**Reference.**
- [Inigo Quilez — *Painting a Landscape with Math*](https://www.youtube.com/channel/UCdmAhiG8HQDlz8uyekw4ENw)
- Shadertoy: iq's "Elevated" / "Rainforest"
- Pixar's *Wondermoss* (also by iq)

---

### 8. 📺 VHS Glitch

**Aesthetic.** Retro VHS / CRT artifacts: RGB split, scan lines,
block compression glitches, tracking noise. 80s/90s analog
nostalgia + databending. *Beeple's everydays* energy.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uOnset` | → | RGB split burst |
| `uPeak` | → | scan-line jitter |
| `uBass` | → | block-corruption size |
| `uTreble` | → | static noise density |

**Reference.**
- [Beeple — *Everydays*](https://www.beeple-crap.com/)
- TikTok hashtags: #vhsaesthetic #glitchart
- GMUNK databending experiments

---

### 9. 🦠 Reaction-Diffusion

**Aesthetic.** Gray-Scott reaction-diffusion. Organic spreading
patterns — coral, neural, viral. The "alive" look that hypnotised
the demoscene in the 2010s.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uMid` | → | reaction rate (`F`) |
| `uBass` | → | diffusion rate (`k`) |
| `uOnset` | → | seed new spawn points |
| `uCentroid` | → | output color gradient |

**Reference.**
- [Karl Sims — *Reaction-Diffusion Tutorial*](https://www.karlsims.com/rd.html)
- Shadertoy: search "reaction diffusion"
- Daniel Shiffman's *Nature of Code* videos

---

### 10. 🌪️ Strange Attractor

**Aesthetic.** A 3D point traces the path of a chaos system —
Lorenz, Aizawa, Pickover — building delicate ribbons in space.
The math is deterministic; the visual is breathtaking.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uTempo` | → | path traversal speed |
| `uFFT[]` | → | ribbon color along path |
| `uPeak` | → | camera orbit kick |
| `uBass` | → | attractor parameter `σ` / `β` / `ρ` |

**Reference.**
- Daniel Shiffman — *Strange Attractors* coding train series
- Casey Reas — generative attractor work
- Aizawa attractor especially viral on /r/generative

---

### 11. 🏛️ Generative Art Deco

**Aesthetic.** Geometric, vintage, gold-on-black art-deco patterns
that morph in time. Cleaner than the chaotic presets; aesthetic
sweet spot for elegant tracks.

**Audio mapping.**
| Audio | → | Visual |
| --- | --- | --- |
| `uTempo` | → | pattern morph beat-locked |
| `uBass` | → | symmetry order (4 / 6 / 8 / 12) |
| `uCentroid` | → | gold-to-rose-to-emerald palette cycle |

**Reference.**
- [Shadertoy — *generative art deco 4*](https://www.shadertoy.com/view/mds3DX)
- Tyler Hobbs *Fidenza* — algorithmic art-fair aesthetic
- Vera Molnar — historical generative roots

---

### 12. 💻 Code Mode

**Aesthetic.** Whatever the user writes.

**How it works.**
- Built-in GLSL fragment-shader editor (Max's text-edit object).
- "Paste Shadertoy URL" — device fetches the shader via `[maxurl]`
  and rewrites it for jit.gl.slab compatibility (the standard
  `iTime` / `iResolution` / `iChannel0` → audio FFT texture mapping
  is done automatically).
- "Paste Hydra code" — device translates a subset of Hydra's chained
  syntax into equivalent GLSL.
- Auto-recompile on save (1-second debounce).
- All `u*` audio uniforms always available.

**Reference.**
- [Shadertoy](https://www.shadertoy.com/) — 52k+ public shaders to pull from
- [Hydra (olivia jack)](https://hydra.ojack.xyz/docs/) — live-coding visual standard
- [Federico Foderaro — *How to Translate Every Shadertoy Shader into a Max Shader*](https://www.patreon.com/posts/22552384) — proves the translation pipeline works
- [ISF for Jitter (VIDVOX)](https://isf.vidvox.net/isf-for-jitter/) — 300+ open-source ISF shaders, drop-in compatible

---

## Device UI

```
┌─────────────────────────────────────────────────────────┐
│  ●  Alfred Shader                                       │
├─────────────────────────────────────────────────────────┤
│  [   OPEN VISUAL WINDOW   ]    □ Floating  □ Fullscreen │
├─────────────────────────────────────────────────────────┤
│  PRESET                                                  │
│  ┌───┬───┬───┬───┬───┬───┐                              │
│  │🪞 │🌀 │✨ │🫧 │🌌 │📈 │     ← click to switch         │
│  ├───┼───┼───┼───┼───┼───┤                              │
│  │🏔│📺 │🦠 │🌪 │🏛 │💻 │                              │
│  └───┴───┴───┴───┴───┴───┘                              │
│                                                          │
│  INTENSITY   ●─────○─────                                │
│  COLOR       ─────●─────○                                │
│  REACTION    ──○────●────                                │
│                                                          │
│  ASPECT      [16:9 ▾]    EXPORT  [□ Record MP4]         │
└─────────────────────────────────────────────────────────┘
```

Three universal sliders (`Intensity / Color / Reaction`) work on
every preset by re-mapping to its internal parameters. The user
doesn't need to know what `uBass` is mapped to.

## Performance budget

| Item | Cost |
| --- | --- |
| 1080p @ 60fps, presets 1-8, 11 | 5-15% GPU on M1/2020-era GPU |
| Presets 9 (RD) and 10 (Attractor) | 10-20% GPU (heavy iteration) |
| Preset 2 (Fractal Cave) — full quality | 20-40% GPU; auto-downscale to 720p when over budget |
| Audio analysis pipeline | < 2% CPU |
| Code Mode (arbitrary user shader) | depends on shader; same `auto-downscale` guard |

The device exposes a **Quality dropdown** (Auto / Performance /
Quality / Cinema) so users on weaker machines aren't surprised.

## Output / streaming

- The floating jit.world window is OS-level — **OBS Window Capture**
  works directly, lossless.
- Built-in **MP4 record** button (jit.record) for one-tap export to
  `~/Movies/AlfredShader/`.
- **Aspect ratio toggle**: 16:9 (YouTube/desktop), 9:16
  (TikTok/Reels/Shorts), 1:1 (IG feed), 4:5 (IG post).
- **Vertical mode** auto-recomposes presets that have asymmetric
  framing (eg. Painted Hills crops to portrait composition).

## Build phases

| Phase | What lands | Hours |
| --- | --- | --- |
| **A** | Floating window + audio analysis pipeline + presets 1, 4, 8 (one easy from each family: blob / glitch / chrome) | 10 |
| **B** | Presets 2, 3, 6, 11 (raymarching cave, particle bloom, oscilloscope, art deco) | 10 |
| **C** | Presets 5, 7, 9, 10 (the high-art tier — neural brush, painted hills, reaction-diffusion, attractor) | 12 |
| **D** | Code Mode + Shadertoy URL import + Hydra translator | 10 |
| **E** | Recording, aspect-ratio variants, quality auto-tuner | 6 |

Total ~48 hours for the full catalog. Phase A alone (10 h) ships a
device that's already better than anything free on the market.

## What this would look like next to existing tools

| Tool | Cost | What we beat them on |
| --- | --- | --- |
| T3X2R | $$ | Free, curated presets, in-Live, Shadertoy import |
| V-Module (Ableton pack) | bundled | Better aesthetics, more cinematic, vertical export |
| RokVid | $ | Built-in audio analysis, more shader variety |
| TouchDesigner | free (non-commercial) | No need to learn separate app, integrated with the track |
| Hydra | free (browser) | Native macOS/Win window, no browser, OBS-friendly |
| BeatVids / Seedance | SaaS | In-DAW, real-time, no upload |

The genuine competitive advantage is **"art-grade presets that look
like high-end installation art, in your DAW, free, with Shadertoy
escape hatch."** No other shipping tool ticks all five.
