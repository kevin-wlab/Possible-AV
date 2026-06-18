// Global site config — single source of truth for nav, contact, stats, partners.
// Mirrors how this will live in Webflow (site settings + a small "globals" set).

export const site = {
  name: "Possible AV",
  tagline: "We show up anywhere. We make it work.",
  blurb:
    "Professional AV systems, projection, audio, and network infrastructure — deployed globally for brands, events, and experiences.",
  base: "Brooklyn, NY",
  available: "Available everywhere.",
  contactEmail: "hello@possibleav.com", // TODO: confirm real address
  phone: "", // TODO: add phone
  responsePromise: "We respond within 24 hours.",
  sister: {
    name: "ledwall.nyc",
    url: "https://ledwall.nyc",
    note: "For LED video walls and full-scale LED production, we partner with our sister studio.",
  },
};

export const nav = [
  { label: "Services", to: "/services" },
  { label: "Industries", to: "/industries" },
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
];

export const stats = [
  { num: "50+", label: "Projects" },
  { num: "15+", label: "Cities" },
  { num: "Worldwide", label: "Deployments" },
];

// Client logo bar — display names only (swap for real logos in build).
export const clients = [
  "McCann",
  "Mercer Labs",
  "New Museum",
  "L'Oréal",
  "Xfinity",
  "Mercedes-Benz",
];
