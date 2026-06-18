import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { LedCallout, CtaBand } from "../components/Blocks.jsx";
import { getIndustry } from "../data/industries";
import NotFound from "./NotFound.jsx";

export default function IndustryDetail() {
  const { slug } = useParams();
  const i = getIndustry(slug);
  if (!i) return <NotFound />;

  return (
    <>
      <Seo title={`${i.name} — Industries`} description={i.sub} />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">
            <Link to="/industries" style={{ color: "inherit" }}>Industries</Link> / {i.name}
          </p>
          <h1 className="pa-h1">{i.h1}</h1>
          <p className="pa-lede pa-hero-sub">{i.sub}</p>
        </div>
      </section>

      {/* The challenge + what we provide */}
      <section className="pa-sec">
        <div className="pa-wrap">
          <div className="pa-split">
            <div className="pa-sec-head">
              <p className="pa-eyebrow">The challenge</p>
              <p className="pa-h3" style={{ fontWeight: 380 }}>{i.pain}</p>
            </div>
            <div>
              <p className="pa-eyebrow">What we provide</p>
              <ul className="pa-list" style={{ marginTop: 12 }}>
                {i.offer.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Typical scope */}
      <section className="pa-sec pa-sec--band">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Typical scope</p>
          <h2 className="pa-h2">How projects usually come in.</h2>
          <div className="pa-chip-row pa-mt-row">
            {i.scope.map((sc) => <span key={sc} className="pa-chip">{sc}</span>)}
          </div>
          {i.cases && (
            <p className="pa-mono-meta" style={{ marginTop: 28 }}>
              Reference: {i.cases}
            </p>
          )}
        </div>
      </section>

      {i.ledNote && (
        <section className="pa-sec pa-sec--dark">
          <div className="pa-wrap"><LedCallout /></div>
        </section>
      )}

      <CtaBand
        eyebrow={i.name}
        heading="Tell us about your build."
        button="Start a Project"
      />
    </>
  );
}
