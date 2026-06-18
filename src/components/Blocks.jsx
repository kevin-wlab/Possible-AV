import { Link } from "react-router-dom";
import { site } from "../data/site";

// LED Wall cross-sell callout → ledwall.nyc
export function LedCallout() {
  return (
    <div className="pa-callout">
      <div>
        <p className="pa-tag">Sister studio</p>
        <p className="pa-h3" style={{ marginTop: 10, maxWidth: "24ch", color: "var(--on-dark)" }}>
          Need an LED wall? We partner with {site.sister.name} for full-scale LED production.
        </p>
      </div>
      <a href={site.sister.url} target="_blank" rel="noreferrer" className="pa-btn pa-btn--line">
        Visit {site.sister.name} ↗
      </a>
    </div>
  );
}

// Dark CTA banner used to close most pages.
export function CtaBand({
  eyebrow = "Get in touch",
  heading = "Based in Brooklyn. Available everywhere.",
  sub,
  button = "Start a Project",
}) {
  return (
    <section className="pa-sec pa-sec--dark">
      <div className="pa-wrap pa-center">
        <p className="pa-eyebrow" style={{ justifyContent: "center" }}>{eyebrow}</p>
        <h2 className="pa-h1" style={{ maxWidth: "16ch", marginInline: "auto" }}>
          {heading}
        </h2>
        {sub && <p className="pa-lede" style={{ marginInline: "auto" }}>{sub}</p>}
        <div className="pa-btn-row" style={{ justifyContent: "center" }}>
          <Link to="/contact" className="pa-btn pa-btn--signal">{button}</Link>
          <Link to="/work" className="pa-btn pa-btn--line">See Our Work</Link>
        </div>
      </div>
    </section>
  );
}
