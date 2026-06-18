import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { LedCallout } from "../components/Blocks.jsx";
import { getService } from "../data/services";
import NotFound from "./NotFound.jsx";

export default function ServiceDetail() {
  const { slug } = useParams();
  const s = getService(slug);
  if (!s) return <NotFound />;

  return (
    <>
      <Seo title={`${s.name} — Services`} description={s.sub} />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">
            <Link to="/services" style={{ color: "inherit" }}>Services</Link> / {s.name}
          </p>
          <h1 className="pa-h1">{s.h1}</h1>
          <p className="pa-lede pa-hero-sub">{s.sub}</p>
        </div>
      </section>

      {/* What we do */}
      <section className="pa-sec">
        <div className="pa-wrap">
          <p className="pa-eyebrow">What we do</p>
          {s.capabilities && (
            <ul className="pa-list" style={{ maxWidth: 720, marginTop: 12 }}>
              {s.capabilities.map((c) => <li key={c}>{c}</li>)}
            </ul>
          )}
          {s.groups && (
            <div className="pa-grid pa-grid-3 pa-mt-row">
              {s.groups.map((g) => (
                <div className="pa-card" key={g.title}>
                  <h3 className="pa-h3">{g.title}</h3>
                  <ul className="pa-list" style={{ marginTop: 12 }}>
                    {g.items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Where it fits */}
      <section className="pa-sec pa-sec--band">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Where it fits</p>
          <h2 className="pa-h2">Common deployments</h2>
          <div className="pa-chip-row pa-mt-row">
            {s.useCases.map((u) => <span key={u} className="pa-chip">{u}</span>)}
          </div>
        </div>
      </section>

      {/* Tech highlight */}
      {s.tech && (
        <section className="pa-sec pa-sec--dark">
          <div className="pa-wrap">
            <div className="pa-split">
              <div className="pa-sec-head">
                <p className="pa-eyebrow">Capability highlight</p>
                <h2 className="pa-h2">The stack behind it.</h2>
              </div>
              <ul className="pa-list" style={{ alignSelf: "center" }}>
                {s.tech.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* LED cross-sell (only some services) */}
      {s.ledNote && (
        <section className="pa-sec pa-sec--dark" style={{ paddingTop: 0 }}>
          <div className="pa-wrap"><LedCallout /></div>
        </section>
      )}

      {/* CTA */}
      <section className="pa-sec pa-sec--dark" style={{ paddingTop: s.ledNote ? 0 : undefined }}>
        <div className="pa-wrap pa-center">
          <h2 className="pa-h1" style={{ maxWidth: "20ch", marginInline: "auto" }}>{s.cta}</h2>
          <div className="pa-btn-row" style={{ justifyContent: "center" }}>
            <Link to="/contact" className="pa-btn pa-btn--signal">{s.cta}</Link>
            <Link to="/work" className="pa-btn pa-btn--line">See related work</Link>
          </div>
        </div>
      </section>
    </>
  );
}
