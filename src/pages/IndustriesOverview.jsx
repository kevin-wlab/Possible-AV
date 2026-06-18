import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { CtaBand } from "../components/Blocks.jsx";
import { industries, industriesOverview } from "../data/industries";

export default function IndustriesOverview() {
  return (
    <>
      <Seo title="Industries" description={industriesOverview.sub} />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Industries</p>
          <h1 className="pa-h1">{industriesOverview.h1}</h1>
          <p className="pa-lede pa-hero-sub">{industriesOverview.sub}</p>
        </div>
      </section>

      <section className="pa-sec">
        <div className="pa-wrap">
          <div className="pa-grid pa-grid-3">
            {industries.map((i) => (
              <Link key={i.slug} to={`/industries/${i.slug}`} className="pa-card pa-card--link">
                <h3 className="pa-h3">{i.name}</h3>
                <p className="pa-card-p">{i.cardLine}</p>
                <span className="pa-arrow-link">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand heading="Your space isn't on the list? We've probably done it." />
    </>
  );
}
