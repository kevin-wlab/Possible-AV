# Possible AV — site architecture (draft v3, 2026-11-13)

Owner gave the full business scope on 2026-11-13 (+ playback stations, irregular-surface projection mapping,
art exhibitions & galleries, VJ / Resolume live visuals). v3 changes after owner feedback:
- "Screens" → **Displays**.
- No "Gear" section: our equipment always goes out as a **service** (delivered, set up, run by our crew),
  so every equipment page is a service page — "rental & installation", never a bare product listing.
- Repeating an item under more than one heading is fine. The SEO rule is **one URL per search intent**:
  menus and hubs may link the same page from several places, but two pages never target the same query.

Visual direction is decided separately (owner: no pure-black background).

## SEO logic (same approach as ledwall.nyc)
1. **Money pages, one per search intent.** People search by equipment ("oled tv rental nyc",
   "projector rental nyc", "wireless microphone rental nyc") or by outcome ("conference room av
   installation nyc", "projection mapping nyc", "av technicians nyc"). Each intent gets one page.
2. **Hub → spoke.** Each service hub links its spokes and the spokes link back and sideways
   (projector rental ↔ projection mapping ↔ home theater). This is where the duplication lives.
3. **No thin location pages.** One NYC page per intent; other cities go to /touring-av.
4. **Blog carries the volume.** Commercial NYC terms are small; informational guides
   (costs, comparisons, how-tos) bring traffic and link into the money pages.
5. **Every money page:** title = "<Thing> Rental (& Installation) in NYC | Possible AV", real specs,
   what's in the kit, who runs it, FAQ block with FAQPage schema, quote CTA.
6. Keyword volumes still to be pulled before build order is final.

## Nav
`Services` · `Solutions` · `Industries` · `Work` · `About` + button `Get a quote`

## Services — equipment, deployed by our crew (rent · buy · install shown as tags)
| Hub | Spokes (one page each) |
|---|---|
| **Displays** `/service/displays` NEW | OLED TV rental · touch screen rental (Android / Windows) · transparent display rental · **playback stations** (screens on truss / stands running looped content, plus interactive computer stations; also linked from Networks & computers) · LED walls (short page → ledwall.nyc) |
| **Projection** `/service/projection` existing | projector rental (events & trade shows) · projection mapping* · home theater* |
| **Audio** `/service/audio` existing | sound system rental · wireless microphone rental · directional speakers (rent & buy) · spatial audio & haptic seating |
| **Lighting & staging** `/service/lighting-staging` NEW | event lighting rental (Aputure) · stage deck rental · rigging |
| **Live video & visuals** `/service/live-streaming` NEW | live streaming services · video switcher / production kit rental · **VJ & live visuals (Resolume)** · media server operation · hybrid events (existing post) |
| **Networks & computers** `/service/network` existing | event Wi-Fi (UniFi) · permanent network installs · computer & workstation rental · custom PCs & workstations (sale) |
| **Interactive & motion tracking** `/service/interactive-experience` existing | interactive installations (TouchDesigner) · touch-screen apps & kiosks · sensors, LiDAR & camera body tracking · RFID / NFC triggers · motion tracking system rental · motion capture for events & installs · 3D & real-time content |

\* also listed under Solutions — same URL.

## Solutions — outcomes (deliberately overlap with Services)
| Page | Notes |
|---|---|
| **Event AV production** `/service/av-systems` existing, retitled | the "AV company NYC" money page: full-service, everything above under one crew |
| **AV crew & technicians** NEW | crew-only hire: A1 / V1 / L1, techs, technical direction |
| **Interactive installations** `/service/interactive-experience` existing (same URL as the Interactive hub) | TouchDesigner, sensors, RFID, motion tracking |
| **Immersive experiences** `/service/experiential` existing | immersive exhibitions, concept → build → run |
| **Projection mapping** NEW | spoke of Projection too; covers **irregular / sculptural surfaces** (objects, sets, architecture) as well as flat walls |
| **3D & real-time content** NEW | 3D modeling, real-time content for screens and projection |
| **VJ & live visuals** NEW (same URL as the Live video spoke) | anything Resolume does: live / audio-reactive visuals, VJ sets, LED and projection mapping from Resolume, playback and show control |
| **Conference room AV** NEW | displays, audio, cameras, control, network |
| **Home theater** NEW | projector, screen, audio install; spoke of Projection too |
| **Equipment sales & sourcing** NEW `/buy` | what we sell and integrate; we find what we don't carry |

## Industries
Existing `/industry/*` pages stay (brand activations, corporate events, trade shows, retail pop-ups, …).
`/industry/museums-galleries` broadens to **museums, galleries & art exhibitions** (artist installs, gallery
shows, art fairs) and links Projection mapping, Immersive experiences and Interactive installations.

## Supporting pages
`/work`, `/project/*` (no client names), `/touring-av`, `/pricing`, `/faq`, `/blog`, `/about`, `/contact`.
Existing URLs are kept, so no redirects.

## Blog cluster (informational, links into money pages)
Examples: OLED vs LED for events · what it costs to rent a projector in NYC · touch screen kiosks for
events · how much Wi-Fi an event needs · what a directional speaker is · motion tracking for interactive
installs · conference room AV checklist · home theater projector vs TV. Existing posts stay.

## Homepage (owner direction 2026-11-13/14, prototype in `ops-log/prototypes/home-studio.html`)
Light warm palette (#ECE9E3, ink #1A1A18, amber #E8892D; Geist + Geist Mono), no dark theme.
One 3D studio room (three.js), pinned while you scroll:
1. Top: cut-away view of the whole studio with every piece of hardware labelled.
2. Scroll: the camera drops into the room and moves from area to area (Displays → Projection → Audio →
   Lighting & staging → Live video & visuals → Networks & computers → Interactive & tracking). Each stop
   shows a card with the service's spokes and a link to its hub page.
3. Pull back out to the whole studio, then the services grid, the rest of the page and the footer.
Owner notes on the scene (2026-11-14): no orange rings (bays are marked in floor tape instead), models
detailed rather than blocky, and the room dressed like a working studio (industrial steel windows with a
river / bridge / waterfront view, brick wall, columns, slat wall, racking, workbench, lounge). The setting
is carried by the visuals only; copy still says just "Brooklyn, New York".
Round 3 (2026-11-14): LED walls are shown in the room (Displays bay + stage backdrop); no name tags on
the picture (a numbered index along the bottom highlights each bay on hover, and bays are clickable);
the directional speaker shows a tight column of sound over one listener; projection mapping uses a
faceted sculpture with content that follows the facets; more furniture (meeting table, coffee bar,
lounge, bench).
`home-studio.html` loads a few stand-in models (sofa, chairs, plants, lamp, two human figures) from
`models/*.js`. Those files are NOT in this repo: they are sample assets (Khronos glTF samples, Mixamo
figures from the three.js examples) used only to judge the look. Before anything goes on the live site
they must be replaced with models we own or have licensed.
Round 4 (2026-11-14): red-brick shell with modern fit-out (black steel windows, oak slats, white plaster);
window view is the East River with a stone-towered suspension bridge and the Manhattan skyline; walls
carry work-related dressing (signal-flow drawing, touring-city clocks, on-air light, cable wall, halo-lit
sign); the LED wall is shown mid-build, at an angle, by crew in black Possible AV uniform; cards are
frosted glass; the bottom index is a row of pills; each bay's name is painted large on the floor where the
camera can read it; the overview camera uses a tighter depth range to stop surfaces flickering.
Round 5 (2026-11-14): all four walls are red brick; the signal-flow diagram plays on a wall-mounted LED
screen; two stops were added to the walk, so the homepage now has nine:
- **08 Fabrication** — custom builds, branded pieces and pop-up shop units with AV built in; large-format and
  desktop 3D printing. Links to the sister brand at https://ctrlp.studio.
- **09 Logistics & touring** — the roll-up door beside Fabrication is the loading dock; our truck (Possible AV
  livery) is backed up to it and crew roll cases on. The camera steps outside for this stop.
Crew are shown as people in black Possible AV uniform (cap, work jacket with printed logo, work gloves). They
use a sample Ready Player Me avatar from the three.js examples with Mixamo clips retargeted onto it. The sample
is a costume character (tailcoat, waistcoat, bow tie, top hat), so the code restyles it: coat cut to a hip-length
jacket, bow tie / flower / buttons removed, shirt and waistcoat coloured as one plain top, hat hidden, cropped
hair painted on the scalp, fitted cap. The sample rests in an A-pose and the clips are T-pose, so the retarget
lines the rig up first (without this the arms stick out). The visitor under the directional speaker is the same
model in plain clothes. No person stands at the 3D printers (owner, 2026-11-14), and the Fabrication card has
no button; ctrlp.studio is linked from the "Large-format 3D printing" row only.
It is a stand-in like the furniture models: licence it or replace it before the live site, and ideally use
several different crew models so they are not all the same person.
Round 10 (2026-11-15): homepage lower half written (services grid with all nine areas, four ways to work with
us, solutions list, how a job runs, industries, LED / 3D printing / sourcing panels, FAQ, quote, footer). Phone
layout: the service card is a low sheet with the third-level links as one swipeable row.

## Services page (owner direction 2026-11-15, prototype in `ops-log/prototypes/services-studios.html`)
One page, `services.html` in the prototype. Second level = nine tabs (Displays, Projection, Audio, Lighting &
staging, Live video & visuals, Networks & computers, Interactive & tracking, Fabrication, Logistics & touring).
Third level = the list inside each tab; picking an item moves the camera to that piece of kit and swaps the
text. Each tab shows its business alone in a room of its own (different walls, light and mood per business:
daylight showroom, blackout room, oak-slat sound room, black-box stage, grey control room, white lab, dark
gallery, brick workshop; Logistics uses the dock and truck outside the main studio). Deep links:
`services.html#audio`. Both pages are built from one scene module (`scene.js` + `mk.py` in the working folder).
Not done yet: real spoke pages behind the third-level items, per-item camera angles checked one by one,
room dressing beyond walls / windows / ceiling.
Round 11 (2026-11-15, owner redirect): the per-business 3D rooms on the Services page are dropped
(`services-studios.html` kept only as a record). New structure:
- **Services** = an ordinary tabbed page, no 3D (`ops-log/prototypes/services-tabs.html`): nine tabs, each
  lists what is in the service and links to that service's own page.
- **Each service gets its own page** (third level). These do NOT reuse the studio models and are not rooms:
  a scroll-driven product film on a seamless backdrop, like the very first line-array hero, with models
  built fresh for the page. First one: Audio (`ops-log/prototypes/service-audio.html`): line-array hang
  that opens up, wireless mics, directional speaker whose sound tightens into a beam, haptic sofa in a ring
  of speakers, mixing console. The other eight pages wait for the owner's decision on next steps.
Still to add to the sitemap above: a Fabrication page and how it sits next to Services/Solutions.
Second-level pages get the same kind of animation later (owner: not now).
Earlier versions kept for reference: `home-show-floor.html` (seven booths on an open floor) and
`home-hero-line-array-v1.html` (single big-PA hero).

## Rules for this build
- No WLAB mentions or links anywhere on Possible AV. LED walls point to ledwall.nyc only.
- Contact email stays as is for now.
