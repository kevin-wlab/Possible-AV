import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { CtaBand } from "../components/Blocks.jsx";
import { services, servicesOverview } from "../data/services";
import { site } from "../data/site";

export default function ServicesOverview() {
  return (
    <>
      <Seo
        title="Services"
        description={servicesOverview.sub}
      />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Services</p>
          <h1 className="pa-h1">{servicesOverview.h1}</h1>
          <p className="pa-lede pa-hero-sub">{servicesOverview.sub}</p>
        </div>
      </section>

      <section className="pa-sec">
        <div className="pa-wrap">
          <div className="pa-grid pa-grid-3">
            {services.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="pa-card pa-card--link">
                <span className="pa-card-ico">{s.icon}</span>
                <h3 className="pa-h3">{s.name}</h3>
                <p className="pa-card-p">{s.cardLine}</p>
                <span className="pa-arrow-link">Learn more →</span>
              </Link>
            ))}
          </div>

          <div className="pa-callout" style={{ marginTop: "var(--gap)" }}>
            <div>
              <p className="pa-tag">LED video walls</p>
              <p className="pa-h3" style={{ marginTop: 10, color: "var(--on-dark)" }}>
                For LED video walls, visit our sister studio {site.sister.name}.
              </p>
            </div>
            <a href={site.sister.url} target="_blank" rel="noreferrer" className="pa-btn pa-btn--line">
              Visit {site.sister.name} ↗
            </a>
          </div>
        </div>
      </section>

      <CtaBand heading="Not sure what you need? Start with the brief." button="Start a Project" />
    </>
  );
}
