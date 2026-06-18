import Seo from "../components/Seo.jsx";
import { LedCallout, CtaBand } from "../components/Blocks.jsx";
import { site } from "../data/site";

const diff = [
  {
    t: "We own the gear",
    d: "We're not a broker. We carry our own inventory — projectors, audio, network — so we're accountable for every box on site.",
  },
  {
    t: "A team that actually knows AV + IT",
    d: "Signal, sound, and the network it all runs on — handled by people who understand how the pieces fit together.",
  },
  {
    t: "Brief to strike, fully handled",
    d: "From the first brief through install, show, and teardown, you have one team and one point of contact.",
  },
];

const team = [
  { name: "Kevin", role: "Founder / Technical Direction" },
  { name: "Tommy", role: "Founder / Production" },
];

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="Possible AV is a Brooklyn-based AV studio deploying globally — part of the WLAB ecosystem, sister studio to ledwall.nyc."
      />

      {/* Who we are */}
      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">About</p>
          <h1 className="pa-h1">AV that shows up — anywhere.</h1>
          <p className="pa-lede pa-hero-sub">
            Possible AV is a Brooklyn Navy Yard–based studio that designs, packs, and deploys
            professional AV worldwide. We're part of the WLAB ecosystem, sister studio to {site.sister.name}.
          </p>
        </div>
      </section>

      {/* What makes us different */}
      <section className="pa-sec">
        <div className="pa-wrap">
          <p className="pa-eyebrow">What makes us different</p>
          <h2 className="pa-h2">We carry the gear. We carry the responsibility.</h2>
          <div className="pa-grid pa-grid-3 pa-mt-row">
            {diff.map((d) => (
              <div key={d.t} className="pa-card">
                <h3 className="pa-h3">{d.t}</h3>
                <p className="pa-card-p">{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our studio */}
      <section className="pa-sec pa-sec--band">
        <div className="pa-wrap">
          <div className="pa-split">
            <div className="pa-sec-head">
              <p className="pa-eyebrow">Our studio</p>
              <h2 className="pa-h2">Based in the Brooklyn Navy Yard.</h2>
              <p className="pa-lede">
                Our shop holds working inventory — projection, audio, and network gear —
                prepped and tested before it ships to your site.
              </p>
            </div>
            <div className="pa-work-thumb" style={{ borderRadius: "var(--radius)", aspectRatio: "4 / 3" }}>
              STUDIO / INVENTORY IMAGE
            </div>
          </div>
        </div>
      </section>

      {/* Sister studio */}
      <section className="pa-sec pa-sec--dark">
        <div className="pa-wrap"><LedCallout /></div>
      </section>

      {/* Team */}
      <section className="pa-sec">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Team</p>
          <h2 className="pa-h2">The people on the job.</h2>
          <div className="pa-grid pa-grid-3 pa-mt-row">
            {team.map((m) => (
              <div key={m.name} className="pa-card">
                <div className="pa-work-thumb" style={{ aspectRatio: "1 / 1", borderRadius: 12, marginBottom: 18 }}>
                  PHOTO
                </div>
                <h3 className="pa-h3">{m.name}</h3>
                <p className="pa-mono-meta" style={{ marginTop: 6 }}>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand heading="Based in Brooklyn. Available everywhere." />
    </>
  );
}
