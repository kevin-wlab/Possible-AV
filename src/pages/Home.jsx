import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { LedCallout, CtaBand } from "../components/Blocks.jsx";
import { site, stats, clients } from "../data/site";
import { services } from "../data/services";
import { industries } from "../data/industries";
import { work } from "../data/work";

const steps = [
  { n: "01", t: "Brief", d: "Tell us what you need and where it's happening." },
  { n: "02", t: "Design & Pack", d: "We design the system and prep the gear." },
  { n: "03", t: "Deploy", d: "We show up and execute — anywhere." },
];

export default function Home() {
  return (
    <>
      <Seo
        title="AV Systems, Projection, Audio & Network"
        description={site.blurb}
      />

      {/* 1 — Hero */}
      <section className="pa-hero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Possible AV — Brooklyn, deployed globally</p>
          <h1 className="pa-display">We show up anywhere.<br />We make it work.</h1>
          <p className="pa-lede pa-hero-sub">{site.blurb}</p>
          <div className="pa-btn-row">
            <Link to="/contact" className="pa-btn pa-btn--signal">Start a Project</Link>
            <Link to="/work" className="pa-btn pa-btn--line">See Our Work</Link>
          </div>
        </div>
      </section>

      {/* 2 — What We Do */}
      <section className="pa-sec">
        <div className="pa-wrap">
          <p className="pa-eyebrow">What we do</p>
          <h2 className="pa-h2">Six disciplines. One team that owns the gear.</h2>
          <div className="pa-grid pa-grid-3 pa-mt-row">
            {services.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="pa-card pa-card--link">
                <span className="pa-card-ico">{s.icon}</span>
                <h3 className="pa-h3">{s.name}</h3>
                <p className="pa-card-p">{s.cardLine}</p>
                <span className="pa-arrow-link">Learn more →</span>
              </Link>
            ))}
            {/* LED Video Walls → ledwall.nyc */}
            <a href={site.sister.url} target="_blank" rel="noreferrer" className="pa-card pa-card--link">
              <span className="pa-card-ico">▦</span>
              <h3 className="pa-h3">LED Video Walls</h3>
              <p className="pa-card-p">Full-scale LED production via our sister studio {site.sister.name}.</p>
              <span className="pa-arrow-link">Visit {site.sister.name} ↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3 — How We Work */}
      <section className="pa-sec pa-sec--band">
        <div className="pa-wrap">
          <p className="pa-eyebrow">How we work</p>
          <h2 className="pa-h2">Three steps, from brief to deployed.</h2>
          <div className="pa-steps">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="pa-step-num">{s.n}</span>
                <div className="pa-step-line" />
                <h3 className="pa-h3">{s.t}</h3>
                <p className="pa-p">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Industries */}
      <section className="pa-sec">
        <div className="pa-wrap">
          <div className="pa-split">
            <div className="pa-sec-head">
              <p className="pa-eyebrow">Industries</p>
              <h2 className="pa-h2">Built for the spaces where it matters.</h2>
            </div>
            <p className="pa-lede">
              We tailor AV to the realities of each environment — from a traveling pop-up
              to a permanent gallery install.
            </p>
          </div>
          <div className="pa-chip-row pa-mt-row">
            {industries.map((i) => (
              <Link key={i.slug} to={`/industries/${i.slug}`} className="pa-chip">
                {i.name}
              </Link>
            ))}
            <span className="pa-chip">Experiential Installations</span>
          </div>
        </div>
      </section>

      {/* 5 — Featured work */}
      <section className="pa-sec pa-sec--band">
        <div className="pa-wrap">
          <div className="pa-split">
            <div className="pa-sec-head">
              <p className="pa-eyebrow">Selected work</p>
              <h2 className="pa-h2">Recently deployed.</h2>
            </div>
            <div style={{ alignSelf: "end" }}>
              <Link to="/work" className="pa-arrow-link">All work →</Link>
            </div>
          </div>
          <div className="pa-grid pa-grid-3 pa-mt-row">
            {work.map((p) => (
              <Link key={p.slug} to={`/work/${p.slug}`} className="pa-work-card">
                <div className="pa-work-thumb">IMAGE</div>
                <div className="pa-work-body">
                  <div className="pa-work-tags">
                    <span className="pa-tag">{p.city}</span>
                  </div>
                  <h3 className="pa-h3" style={{ color: "var(--on-dark)" }}>{p.title}</h3>
                  <p className="pa-mono-meta" style={{ marginTop: 10, color: "var(--on-dark-dim)" }}>
                    {p.services.join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — Stats */}
      <section className="pa-sec pa-sec--dark">
        <div className="pa-wrap">
          <div className="pa-stats">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="pa-stat-num">{s.num}</div>
                <div className="pa-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Client logo bar */}
      <section className="pa-sec--tight pa-sec--dark" style={{ paddingTop: 0 }}>
        <div className="pa-marq">
          <div className="pa-marq-track">
            {[...clients, ...clients].map((c, i) => (
              <span className="pa-marq-item" key={i}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 8 — LED Wall callout */}
      <section className="pa-sec pa-sec--dark" style={{ paddingTop: 0 }}>
        <div className="pa-wrap">
          <LedCallout />
        </div>
      </section>

      {/* 9 — CTA banner */}
      <CtaBand
        sub="Tell us what you're building. We'll handle the signal, sound, and everything in between."
      />
    </>
  );
}
