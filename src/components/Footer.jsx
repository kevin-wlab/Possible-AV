import { Link } from "react-router-dom";
import { site } from "../data/site";
import { services } from "../data/services";
import { industries } from "../data/industries";

export default function Footer() {
  return (
    <footer className="pa-footer">
      <div className="pa-wrap">
        <div className="pa-footer-top">
          <div className="pa-footer-col">
            <p className="pa-footer-tagline">{site.tagline}</p>
            <p className="pa-mono-meta" style={{ marginTop: 18, color: "var(--on-dark-dim)" }}>
              {site.base} — {site.available}
            </p>
          </div>

          <div className="pa-footer-col">
            <h4>Services</h4>
            {services.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`}>
                {s.name}
              </Link>
            ))}
          </div>

          <div className="pa-footer-col">
            <h4>Industries</h4>
            {industries.map((i) => (
              <Link key={i.slug} to={`/industries/${i.slug}`}>
                {i.name}
              </Link>
            ))}
          </div>

          <div className="pa-footer-col">
            <h4>Company</h4>
            <Link to="/work">Work</Link>
            <Link to="/about">About</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
            <a href={site.sister.url} target="_blank" rel="noreferrer">
              {site.sister.name} ↗
            </a>
          </div>
        </div>

        <div className="pa-footer-bottom">
          <span>© {site.name}. {site.base}.</span>
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
        </div>
      </div>
    </footer>
  );
}
