// Blog — SEO-driven. Stubs with intros; full bodies to be written out.
// Maps to a Webflow "Blog Posts" CMS collection (item route /blog/[slug]).

export const posts = [
  {
    slug: "how-to-plan-av-for-a-popup-event",
    title: "How to plan AV for a pop-up event",
    category: "Guide",
    readTime: "6 min",
    date: "2026",
    excerpt:
      "A practical checklist for planning audio, video, and power at a temporary retail or brand pop-up — before you sign the venue.",
    relatedService: "av-systems",
    body: [
      { type: "p", text: "Pop-ups give you the least time and the least information of any AV job. You often don't see the space until load-in, the timeline is brutal, and the brand still expects it to look like a permanent flagship. Planning ahead is the only thing that saves you." },
      { type: "h2", text: "Start with the space, not the gear" },
      { type: "p", text: "Before you spec a single display, get answers on power, ceiling height, wall construction, and load-in access. Most pop-up AV problems are really building problems discovered too late." },
      { type: "h2", text: "Build a power budget early" },
      { type: "p", text: "Add up the draw of every device and compare it against the circuits the venue actually has. Temporary spaces are routinely under-powered for AV." },
      { type: "h2", text: "Plan for fast install and strike" },
      { type: "p", text: "Pre-build and pre-test as much as possible off-site. The fewer decisions you make on the floor, the more reliable the result." },
    ],
  },
  {
    slug: "projector-vs-led-wall-which-is-right",
    title: "Projector vs LED wall: which is right for your event",
    category: "Comparison",
    readTime: "7 min",
    date: "2026",
    excerpt:
      "Brightness, ambient light, budget, and surface — how to choose between projection and an LED wall for your space.",
    relatedService: "projection",
    ledNote: true,
    body: [
      { type: "p", text: "Projection and LED walls solve overlapping problems in very different ways. The right call comes down to ambient light, surface, budget, and how permanent the install needs to be." },
      { type: "h2", text: "Ambient light is the deciding factor" },
      { type: "p", text: "Bright rooms and daylight punish projection. LED walls hold up in high ambient light where a projector would wash out." },
      { type: "h2", text: "Surface and shape" },
      { type: "p", text: "Projection can transform almost any surface — curved architecture, objects, floors. LED walls excel at flat, high-impact, high-brightness imagery." },
      { type: "h2", text: "When to call ledwall.nyc" },
      { type: "p", text: "For full-scale LED video walls and LED production, we partner with our sister studio ledwall.nyc. If your project is clearly an LED build, that's where to start." },
    ],
  },
  {
    slug: "what-is-ndi-and-why-it-matters",
    title: "What is NDI and why does it matter for live events",
    category: "Technical",
    readTime: "5 min",
    date: "2026",
    excerpt:
      "NDI moves video over standard networks. Here's what that unlocks for live events — and where its limits are.",
    relatedService: "network",
    body: [
      { type: "p", text: "NDI (Network Device Interface) carries video and audio over a standard IP network instead of dedicated cabling. For live events, that flexibility changes how you design a show." },
      { type: "h2", text: "Video over the network you already have" },
      { type: "p", text: "Instead of running SDI everywhere, NDI lets sources and destinations share an Ethernet backbone — fewer cables, faster changes." },
      { type: "h2", text: "Where NDI fits — and where it doesn't" },
      { type: "p", text: "NDI is excellent for flexible, multi-source workflows. For the highest-bandwidth, lowest-latency paths you'll still mix in SDI or dedicated AVoIP. The network design is what makes or breaks it." },
    ],
  },
  {
    slug: "av-checklist-for-trade-show-exhibitors",
    title: "AV checklist for trade show exhibitors",
    category: "Checklist",
    readTime: "6 min",
    date: "2026",
    excerpt:
      "Everything to confirm before the show floor opens — power orders, rigging rules, internet, and on-site support.",
    relatedService: "av-systems",
    body: [
      { type: "p", text: "Trade show floors have their own rules, and missing one can cost you the whole activation. This is the short list we run before any show." },
      { type: "h2", text: "Order power early and over-spec it" },
      { type: "p", text: "Show power is ordered in advance and expensive to change on-site. Calculate your real draw and add headroom." },
      { type: "h2", text: "Confirm rigging and hanging rules" },
      { type: "p", text: "Every venue has different rules about what can be hung and who can hang it. Confirm before you design the booth." },
      { type: "h2", text: "Don't trust show-floor WiFi" },
      { type: "p", text: "Shared show WiFi is unreliable for anything that matters. Plan your own connectivity for demos and interactive elements." },
    ],
  },
  {
    slug: "how-museums-use-interactive-av-in-2026",
    title: "How museums are using interactive AV in 2026",
    category: "Industry",
    readTime: "7 min",
    date: "2026",
    excerpt:
      "Sensor-driven exhibits, synchronized screens, and quiet zoned audio — the interactive techniques shaping galleries now.",
    relatedService: "interactive-experience",
    body: [
      { type: "p", text: "Interactive AV in cultural spaces has moved from novelty to infrastructure. The best examples are invisible — technology in service of the story, not on top of it." },
      { type: "h2", text: "Sensors over touchscreens" },
      { type: "p", text: "Motion, proximity, and gesture sensing let exhibits respond without a screen to smudge or break. They also handle crowds better." },
      { type: "h2", text: "Built to run for years" },
      { type: "p", text: "Permanent installs need to be maintainable by in-house staff and reliable long after install day. Show control and solid networking matter more than any single effect." },
    ],
  },
  {
    slug: "temporary-event-network-setup-guide",
    title: "Temporary event network setup guide",
    category: "Guide",
    readTime: "6 min",
    date: "2026",
    excerpt:
      "How to design a reliable temporary network for an event — VLANs, high-density WiFi, and keeping show traffic off guest WiFi.",
    relatedService: "network",
    body: [
      { type: "p", text: "A flaky network takes down everything that depends on it — playback, interactives, payment, check-in. A temporary event network deserves the same rigor as a permanent one." },
      { type: "h2", text: "Segment everything" },
      { type: "p", text: "Keep show-critical traffic on its own VLAN, isolated from guest WiFi. The guest network should never be able to take down the show." },
      { type: "h2", text: "Plan WiFi for density, not coverage" },
      { type: "p", text: "Hundreds of phones in one room is a density problem, not a range problem. Design access points accordingly." },
    ],
  },
];

export const getPost = (slug) => posts.find((p) => p.slug === slug);
