import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { CtaBand } from "../components/Blocks.jsx";
import { work, getProject } from "../data/work";
import NotFound from "./NotFound.jsx";

export default function WorkDetail() {
  const { slug } = useParams();
  const p = getProject(slug);
  if (!p) return <NotFound />;

  const idx = work.findIndex((w) => w.slug === slug);
  const next = work[(idx + 1) % work.length];

  return (
    <>
      <Seo title={`${p.title} — Work`} description={p.summary} />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">
            <Link to="/work" style={{ color: "inherit" }}>Work</Link> / {p.city}
          </p>
          <h1 className="pa-h1">{p.title}</h1>
          <p className="pa-lede pa-hero-sub">{p.summary}</p>
          <div className="pa-chip-row" style={{ marginTop: 26 }}>
            <span className="pa-chip">{p.clientType}</span>
            <span className="pa-chip">{p.city}</span>
            <span className="pa-chip">{p.date}</span>
          </div>
        </div>
      </section>

      {/* cover */}
      <section className="pa-sec--tight">
        <div className="pa-wrap">
          <div className="pa-work-thumb" style={{ aspectRatio: "16 / 7", borderRadius: "var(--radius)" }}>
            COVER IMAGE / VIDEO
          </div>
        </div>
      </section>

      {/* body */}
      <section className="pa-sec" style={{ paddingTop: 0 }}>
        <div className="pa-wrap">
          <div className="pa-split">
            <div className="pa-sec-head">
              <p className="pa-eyebrow">Background</p>
              <p className="pa-h3" style={{ fontWeight: 380 }}>{p.background}</p>
            </div>
            <div>
              <p className="pa-eyebrow">What we did</p>
              <ul className="pa-list" style={{ marginTop: 12 }}>
                {p.didList.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* facts */}
      <section className="pa-sec pa-sec--dark">
        <div className="pa-wrap">
          <div className="pa-stats">
            {p.facts.map((f) => (
              <div key={f.k}>
                <div className="pa-stat-num">{f.v}</div>
                <div className="pa-stat-label">{f.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* gallery placeholder */}
      <section className="pa-sec pa-sec--band">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Gallery</p>
          <div className="pa-grid pa-grid-3 pa-mt-row">
            {[1, 2, 3].map((n) => (
              <div key={n} className="pa-work-thumb" style={{ borderRadius: "var(--radius)" }}>
                IMAGE {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* services + next */}
      <section className="pa-sec">
        <div className="pa-wrap" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <p className="pa-eyebrow">Services used</p>
            <div className="pa-chip-row" style={{ marginTop: 6 }}>
              {p.services.map((s) => <span key={s} className="pa-chip">{s}</span>)}
            </div>
          </div>
          <Link to={`/work/${next.slug}`} className="pa-arrow-link" style={{ alignSelf: "end" }}>
            Next project →
          </Link>
        </div>
      </section>

      <CtaBand heading="Have a project like this?" button="Start a Project" />
    </>
  );
}
