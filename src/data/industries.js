// Industries — 5 detail pages + overview. Maps to a Webflow "Industries"
// CMS collection.

export const industries = [
  {
    slug: "brand-activation",
    name: "Brand Activation",
    cardLine: "Your brand. Any city. Fully produced.",
    h1: "Your brand. Any city. Fully produced.",
    sub: "From plug-and-play kits to full production — we deploy brand experiences anywhere.",
    pain: "Brand activations live or die on reliability and timing. A failed screen at a launch isn't a glitch — it's the story. And running the same activation across cities means re-solving the same AV problem in every market.",
    offer: [
      "Plug-and-play kits for repeatable activations",
      "Full production for flagship launches & roadshows",
      "Single point of contact across every market",
      "We own the gear — no chasing local sub-rentals",
    ],
    scope: ["Pop-up display", "Launch event", "Multi-city roadshow"],
    cases: "SFO pop-up, McCann-led activations",
    ledNote: true,
  },
  {
    slug: "retail-popup",
    name: "Retail Pop-up",
    cardLine: "Open anywhere. Look like you belong there.",
    h1: "Open anywhere. Look like you belong there.",
    sub: "Fast, polished, reliable AV for retail pop-ups — nationally and globally.",
    pain: "Pop-ups have to look permanent on a temporary timeline. Quick deployment, high finish, and zero-failure reliability in a space you've never worked in before.",
    offer: [
      "Standard pop-up AV packages — pre-built, repeatable",
      "Rapid install & strike windows",
      "National & global deployment capability",
      "Finish that reads as a permanent flagship",
    ],
    scope: ["Window display", "In-store experience", "Traveling pop-up"],
    cases: "Retail activations across multiple markets",
  },
  {
    slug: "museums-galleries",
    name: "Museums & Galleries",
    cardLine: "Technology in service of the story.",
    h1: "Technology in service of the story.",
    sub: "Permanent installs and exhibition-grade AV for cultural institutions.",
    pain: "Cultural spaces need technology that disappears into the experience — reliable for years, quiet in sensitive galleries, and serviceable by your team.",
    offer: [
      "Permanent AV infrastructure & exhibition systems",
      "Audio-tour support & zoned, low-noise audio",
      "Interactive labels & sensor-driven exhibits",
      "Projection art & network infrastructure",
    ],
    scope: ["Permanent install", "Touring exhibition", "Interactive gallery"],
    cases: "New Museum, Mercer Labs",
  },
  {
    slug: "corporate-events",
    name: "Corporate Events",
    cardLine: "Every meeting. Every presentation. Zero failures.",
    h1: "Every meeting. Every presentation. Zero failures.",
    sub: "Conferences, product launches, and all-hands — produced to run flawlessly.",
    pain: "Corporate AV has no margin for error. The CEO is on stage, the room is full, and the slides have to come up the first time, every time.",
    offer: [
      "Fast deployment & on-site technical support",
      "Confidence monitors, redundancy, show control",
      "Scales from a single boardroom to a 1,000-seat general session",
      "A tech in the room for the whole show",
    ],
    scope: ["Conference", "Product launch", "All-hands / town hall"],
    cases: "Corporate general sessions & launches",
  },
  {
    slug: "trade-shows",
    name: "Trade Shows",
    cardLine: "Stand out on the floor.",
    h1: "Stand out on the floor.",
    sub: "Booth AV integration built for the realities of the show floor.",
    pain: "Trade show floors punish anything fragile — tight install windows, brutal teardown, and a sea of competing screens fighting for attention.",
    offer: [
      "Booth AV integration — displays, audio, interactive",
      "Fast build and strike on show schedules",
      "Eye-catching content + hardware that survives the floor",
      "On-site coverage for the run of show",
    ],
    scope: ["Booth display", "Demo station", "Show-floor activation"],
    cases: "Javits Center & major trade shows",
    ledNote: true,
  },
];

export const industriesOverview = {
  h1: "Built for the spaces where it actually matters.",
  sub: "We tailor AV to the realities of each environment — not a one-size template.",
};

export const getIndustry = (slug) => industries.find((i) => i.slug === slug);
