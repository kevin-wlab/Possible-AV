# Brief: build a service page ("product film") for the Possible AV website prototype

## Background
Possible AV is an AV rental / installation / production company in Brooklyn, New York. Its site prototype has:
a homepage, a Services page (nine services as tabs), and **one page per service**. Each service page is a
scroll-driven "product film": the service's equipment stands alone on a seamless light backdrop (no room, no
people), the camera travels from one piece to the next as the visitor scrolls, and scrolling opens things up
(an exploded view, a beam narrowing, a lid lifting). After the film comes a still, Apple-style "at a glance"
section that lists everything again with small pictures.

The Audio page is finished and is the reference for structure and for quality. You are building the pages for
the services assigned to you.

## The owner's taste (read this twice)
The owner has rejected a lot of work on this project. What he rejected, in his words: models "like stick
figures", "basic geometry", "an empty shell", "toys", "not refined enough"; text boxes covering the picture;
anything that "pushes customers away". What finally passed on the Audio page:

- **Real proportions and real construction.** A speaker cabinet is a moulded trapezoid with a bowed steel
  grille, handles, feet, a badge, a pole socket; not a box with a texture. Look up nothing online (no network),
  but build from how the real object is put together: what are its parts, where are the seams, what holds it up,
  where do the cables go.
- **Fine surface detail at true scale.** Perforation at 5 mm pitch, not polka dots. Fabric weave, textured
  paint, printed legends, screws, vents, LEDs, displays with something on them.
- **Rounded edges everywhere** (`rbox`, bevelled extrusions, lathes). No bare `BoxGeometry` for anything the
  camera gets close to.
- **Dark, premium materials read well on the light backdrop** when they catch the rim light: near-black shells,
  satin metal, brushed aluminium, one amber accent (#E8892D). Flat mid-grey looks like clay.
- **Small first.** The opening shot of each page must show the most approachable thing a small customer would
  rent (one TV on a stand, not a video wall; one projector, not a mapping rig). The biggest kit comes later as
  the top of a range. The owner's worry: big gear in the first frame scares small customers away.
- **He checks close up.** After you build a model, take a close-up of it and look at it critically. If it
  would not pass as a product render, add construction detail until it does. Expect two or three rounds per
  model.

## Files
Working folder `/home/claude/pav-hero`. Read these first, completely:

- `src/film/core.head.js` — shared setup and helpers. Everything in it is in scope in your files: `THREE`,
  `scene`, `S` (34 m, the spacing between "islands"), `V lerp clamp sstep`, `std mesh box rbox cyl sph lathe at
  rot grp tube rod2 ctex`, materials `M.*`, `glow`, `speckT weaveF weaveT`, `grilleMat curved screws`, `lcd`,
  `driver` + `movers`, `updaters`, `spinners`, `HERO`, `PAGE`, `RoundedBoxGeometry`.
- `src/film/models/audio.js` — the audio models. Study how `pointSource`, `handheld`, `receiver`, `consoleRig`
  and the road case inside it are built: that is the level of detail expected.
- `src/film/pages/audio.js` — how a page places islands, drives its scroll animations and declares camera stops.
- `src/film/pages/audio.body.html` — the page markup: captions, rail, at-a-glance cards, and the sections below.
- `src/film/core.tail.js` — the scroll/camera engine (read to understand `x`, stops, `K` and `R`).
- `src/film/film.css` — styles for the above (shared; do not edit).
- `mk2.py` — the builder; its `SVC` table lists every service with its third-level items and one-liners.

**You create exactly these files per assigned service `<key>`, and edit nothing else:**

- `src/film/models/<key>.js` — model-building functions only. Nothing may be added to `scene` at load here,
  because the homepage loads every service's models file. It must also define `HERO['<key>']=(G)=>{...}`.
- `src/film/pages/<key>.js` — islands, scroll animation, `PAGE.keys`.
- `src/film/pages/<key>.body.html` — markup. Start from a copy of the audio one.
- `img/<key>-<name>.jpg` — stills for the at-a-glance cards, produced by the `thumb` tool below.

Three other people are building other services in the same folder right now. Shared files are read-only. If
shared code has a bug or lacks something you need, work around it in your own files and say so in your report.
Function and constant names in your models file share one global scope with every other service's models on
the homepage, so **prefix or name them specifically** (`oledTv`, `projectorBody`, not `stand`, `panel`, `W`).
Top-level `const` names already taken by audio: `CW CH CD CB`, and functions `cabinet lineArray sub pointSource
tripod handheld bodypack headset receiver monitor directionalRig spatialRig consoleRig`. You may call those
(for example a speaker in a home-theater scene) by adding a first line `// @models: audio` to your page file.

## How a page works
- World: a seamless backdrop (shadow-catching ground at y = 0, fog from 26 m to 60 m). Put each product family
  on an "island": `grp(scene, k*S, 0, 0)` for k = 0, 1, 2 … so neighbours are lost in the fog. Keep an island
  within roughly ±6 m of its centre. The key light and its shadow follow the camera's look-at point along x.
- Stops: `PAGE.keys=(narrow,K,R)=>[ ...one entry per stop... ]`. Stop 0 is the opening, the last stop is the
  closing call to action. `K([camera xyz],[look-at xyz],fov)` frames for desktop with the subject right of the
  text (the left ~38% of the screen carries the caption) and automatically backs off on phones; use
  `narrow ? R([cam],[look],fov) : K(...)` when a phone needs its own framing. Between 6 and 9 stops.
- Scroll position `x` is in stop units (x = 2.0 means resting at stop 2). Animations register
  `updaters.push((t,x)=>{...})` with `t` in seconds. Tie each "opening up" to the approach to its stop, e.g.
  `const u=sstep(k-.45,k+.05,x)`.
- Captions: one `<div class="cap" data-s="N">` per stop in the body file; the hero is `class="cap hero on"`
  with the `<h1>`; the last is `class="cap close"`. Rail links `<a data-i="N">` jump to stops. If you use a
  different number of stops than audio, set the film length on the section:
  `<section class="floor film" id="floor" style="height:[stops x 115]vh">`.
- `HERO['<key>'](G)`: add to group `G` the one compact arrangement that will stand for this service on the
  homepage: the approachable hero piece, footprint within x ±1.6 m and z ±1.2 m, standing on y = 0, facing +z,
  no taller than about 2.6 m. It may animate through `updaters`.

## Page plan to follow
1. **Opening (stop 0):** the small, approachable item, close and handsome. H1 of three to five words, one
   sentence underneath that names the range from small to large, "Get a quote" and "See the range".
2. **The range (stop 1):** small, medium and large side by side where the service has sizes; otherwise the
   whole family in one frame.
3. **One stop per third-level item** in `SVC` (see `mk2.py`), each with a caption: mono eyebrow `0N · item
   name`, an `<h2>` of a few words, one sentence, two or three bullets. At least two stops should have a
   scroll-driven reveal that explains something (what is inside, how it goes together, what it does).
4. **Closing stop:** "Tell us about the room." style call to action.
5. **Below the film,** as in audio: `#glance` (one card per item with a still, a line, two or three ticks, and
   Rent / Buy / Install tags; then the four "included" items), `#ways` (rent / buy / install for this
   service), `#with` (chips to the other services: `services.html#<key>`, or `<key>.html` for audio), `#faq`
   (three to five questions).

## Copy rules (the owner enforces these)
- **Never say what Possible AV does not do.** No "we don't", no exclusions, no "unfortunately". If something is
  outside the list, the line is "we source it".
- Only claim what is in the facts list below. No numbers (sizes, lumens, watts, counts, years, response
  times), no prices, no awards, no client names, no testimonials, no "leading" / "best".
- Allowed product names: UniFi, Aputure, Resolume, TouchDesigner, Android, Windows, OLED. No other brands,
  on screens or in text. Fictional labels on equipment are fine if generic ("CH 04", "INPUT 1").
- Never write: WLAB, virtual production, VP, XR, LED volume, Navy Yard, or any street address. The company is
  in "Brooklyn, New York" and "the same crew travels" for other cities.
- LED video walls are handled by a sister site: link `https://ledwall.nyc`. 3D printing has its own site:
  link `https://ctrlp.studio`.
- No people. There are no human models; do not build figures from primitives. Footprints on the floor, an empty
  chair, a pair of headphones are acceptable ways to imply a person.
- Do not call the client's location "the room" (the owner finds it unprofessional). Say venue, space, event or project: "Tell us about your project.", "sized to the space", "immersive spaces". "Conference room" as a product term is fine.
- Links: never `href="#"`. Link to a real target (`services.html#<key>`, `index.html#quote`, another page) or use a non-link element.
- Tone: short, plain, concrete, like the audio page. No exclamation marks, no rhetorical questions in body copy.
- Keep a list of any sentence you wrote that goes beyond the facts list; it goes in your report so the owner
  can confirm it.

## Facts you may rely on
- All services: equipment is delivered, set up, run and struck by Possible AV's own crew with its own truck;
  crew-only hire is available; work outside New York is done by the same crew travelling; things not carried
  are sourced and integrated.
- **displays** (Rent · Buy · Install): OLED TVs on floor stands or mounts; touch screens with Android or
  Windows built in, on a stand or as a kiosk, running the client's app or one Possible AV builds; transparent
  displays (motion graphics in front of a real product); playback stations (several screens on truss or
  stands with media players and a control position, looping content); LED walls through ledwall.nyc.
- **projection** (Rent · Buy · Install): projectors, lenses and screens for events, trade shows and immersive
  rooms, hung and aligned by the crew; projection mapping on walls, objects, sets and architecture including
  irregular and sculptural surfaces; home theater, rented for a night or installed permanently.
- **lighting** (Rent · Install): Aputure lighting fixtures; stage decks built and levelled; truss and rigging,
  ground-supported and flown; a lighting desk with an operator.
- **live-video** (Rent · Install): live streaming with cameras, encoding and crew; video switchers and
  portable production kits with or without an operator; VJ and live visuals in Resolume, audio-reactive
  visuals, playback and show control ("If Resolume does it, we do it"); hybrid events with remote speakers
  and audiences; PTZ cameras.
- **networks** (Rent · Buy · Install): UniFi networks brought in for events (access points, switching, someone
  monitoring); permanent UniFi installs designed, installed and handed over; workstation and show-computer
  rental; custom PCs and workstations built to order for sale.
- **interactive** (Rent · Install): interactive rooms, floors and walls built in TouchDesigner; sensors and
  camera-based body tracking with nothing worn; motion tracking systems rented, installed and run; RFID and
  NFC triggers; 3D modeling and real-time content; touch-screen apps.
- **fabrication** (Design · Build · Install): custom one-off pieces (housings, plinths, props, mounts); pop-up
  shops and branded retail units that arrive finished with display, light and sound built in; large-format 3D
  printing (furniture-scale pieces) and small-batch runs on a farm of small printers, via ctrlp.studio.
- **logistics** (Deliver · Tour): own box truck with "Possible AV" on it, own flight cases, own crew loading in
  and striking; a loading dock at the studio; touring and multi-city work with the same system and crew.

## Technical limits
- No network, no new libraries, no model files. Canvas textures up to 1024 px.
- Keep a page under roughly 450 meshes; use `THREE.InstancedMesh` for repeated small parts (keys, LEDs,
  pixels, bolts). Share materials. Shadows are on for everything built with `mesh/box/rbox/cyl/sph/lathe`.
- Avoid two faces in one plane (it flickers): offset by 1 mm or more, or 1 cm for large faces.
- Emissive screens: `new THREE.MeshBasicMaterial({map:tex,toneMapped:false})`; animate a canvas texture at
  most every few frames and set `needsUpdate`.
- Transparent things (glass, beams): `transparent:true, depthWrite:false`.

## Testing
The page renders in software on a two-core machine that three other people are also using, so every
screenshot takes 20-60 seconds. Batch them, and **never pipe the command into `tail`, `head` or `grep`** (it
hangs); if you want less output, redirect to a file and read the file.

```bash
cd /home/claude/pav-hero
bash ft.sh <slot> <key> stops 1280 720 0 1 2        # whole page at stops 0, 1, 2  (at most 3 per call)
bash ft.sh <slot> <key> stops 390 780 0 3           # phone
bash ft.sh <slot> <key> cam 2 tv:1.2,1.5,3.0,0,1.1,0,30 back:-2,1.6,-3,0,1.1,0,30
                                                    # free camera at stop 2: name:camX,camY,camZ,lookX,lookY,lookZ,fov
bash ft.sh <slot> <key> thumb 3 kiosk:36,1.6,4.2,34,1.1,0,30
                                                    # same, 960x720, also saved as img/<key>-kiosk.jpg for a glance card
bash ft.sh <slot> <key> glance                      # the at-a-glance section as laid out (add 390 for phone)
```

Output goes to `/tmp/pvt-<slot>/`; the command prints each file name and any page error. Open the PNGs with
the Read tool and look at them. A Bash call is limited to 120 s in the foreground: three screenshots per call
is the practical maximum; for more, run it with `run_in_background` and wait for the notification.
Use only your own slot letter. A JavaScript error anywhere in your files leaves the canvas blank: the printed
page error tells you where.

## Done means, per service
- every stop frames its subject clearly to the right of the caption on desktop, and above the caption on a
  phone; nothing important is cut off or hidden;
- every model has been looked at in close-up and would pass as a product render;
- the opening shows the small, approachable item;
- the at-a-glance section has a still for every card and reads cleanly at 1280 and 390 wide;
- no page errors; copy follows the rules above; `HERO['<key>']` exists and looks right (check it by placing it
  temporarily on an island, or with a `cam` shot if it is the same arrangement as your opening).

## Report back (short, no code)
Per service: the stops in order (one line each); what the scroll reveals are; anything not finished or not
verified; every sentence that goes beyond the facts list; any problem with shared code. If you run out of time
or budget, say exactly which files are complete and usable and which are not.
