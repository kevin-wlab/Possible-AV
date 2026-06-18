// Work / case studies. PLACEHOLDER entries — structure is real, copy & images
// are stand-ins for Tommy to replace with actual projects later.
// Maps to a Webflow "Work" CMS collection (item route /work/[slug]).

export const work = [
  {
    slug: "brand-launch-popup",
    title: "Multi-city brand launch pop-up",
    clientType: "Global beauty brand",
    city: "New York · Miami · LA",
    date: "2026",
    services: ["AV Systems", "Projection", "Audio Engineering"],
    summary:
      "A repeatable activation deployed across three cities in six weeks — identical finish, zero downtime.",
    background:
      "The brand needed a flagship-quality pop-up that could travel between markets without re-engineering the AV in each city. The goal: one kit, one playbook, every city looking the same.",
    didList: [
      "Designed a repeatable AV package with pre-built signal & playback",
      "Projection-mapped the product wall in each venue",
      "Deployed zoned audio tuned to each room",
      "Provided on-site techs for every install and strike",
    ],
    facts: [
      { k: "Cities", v: "3" },
      { k: "Install window", v: "36 hrs" },
      { k: "Downtime", v: "0" },
    ],
    placeholder: true,
  },
  {
    slug: "museum-interactive-gallery",
    title: "Interactive permanent gallery",
    clientType: "Cultural institution",
    city: "New York, NY",
    date: "2026",
    services: ["Interactive Experience", "Network & IT", "Audio Engineering"],
    summary:
      "A sensor-driven gallery with synchronized screens and zoned audio, built to run unattended for years.",
    background:
      "The institution wanted exhibits that respond to visitors while staying maintainable by in-house staff and quiet enough for adjacent galleries.",
    didList: [
      "Built motion- and proximity-driven interactive exhibits",
      "Synchronized multi-screen playback via show control",
      "Installed structured cabling and a UniFi network backbone",
      "Tuned zoned, low-noise audio for a sensitive space",
    ],
    facts: [
      { k: "Screens", v: "12" },
      { k: "Uptime", v: "99.9%" },
      { k: "Run", v: "Permanent" },
    ],
    placeholder: true,
  },
  {
    slug: "corporate-general-session",
    title: "1,000-seat general session",
    clientType: "Fortune 500 company",
    city: "Brooklyn, NY",
    date: "2026",
    services: ["AV Systems", "Audio Engineering", "Network & IT"],
    summary:
      "A full-day corporate general session with redundant signal, live mix, and a dedicated show network.",
    background:
      "Leadership keynotes and live demos meant zero tolerance for failure across a full day of programming in a large room.",
    didList: [
      "Built a redundant signal chain with confidence monitoring",
      "Ran live sound for keynotes, panels, and video playback",
      "Stood up a segmented show network isolated from guest WiFi",
      "Staffed the room with techs for the full run of show",
    ],
    facts: [
      { k: "Seats", v: "1,000" },
      { k: "Program", v: "Full day" },
      { k: "Failures", v: "0" },
    ],
    placeholder: true,
  },
];

export const getProject = (slug) => work.find((p) => p.slug === slug);
