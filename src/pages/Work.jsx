import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { CtaBand } from "../components/Blocks.jsx";
import { work } from "../data/work";
import { services } from "../data/services";

export default function Work() {
  const [filter, setFilter] = useState("All");

  const filters = useMemo(
    () => ["All", ...services.map((s) => s.name)],
    []
  );

  const shown = useMemo(
    () => (filter === "All" ? work : work.filter((p) => p.services.includes(filter))),
    [filter]
  );

  return (
    <>
      <Seo
        title="Work"
        description="Selected AV deployments — brand activations, museum installs, corporate events, and more."
      />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Work</p>
          <h1 className="pa-h1">Recently deployed.</h1>
          <p className="pa-lede pa-hero-sub">
            A selection of projects across services, industries, and cities.
          </p>
        </div>
      </section>

      <section className="pa-sec">
        <div className="pa-wrap">
          {/* filter */}
          <div className="pa-chip-row" style={{ marginBottom: "var(--gap)" }}>
            {filters.map((f) => (
              <button
                key={f}
                className="pa-chip"
                onClick={() => setFilter(f)}
                style={{
                  cursor: "pointer",
                  background: filter === f ? "var(--signal)" : "transparent",
                  color: filter === f ? "#fff" : undefined,
                  borderColor: filter === f ? "var(--signal)" : undefined,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="pa-grid pa-grid-3">
            {shown.map((p) => (
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
          {shown.length === 0 && (
            <p className="pa-p">No projects tagged “{filter}” yet.</p>
          )}
        </div>
      </section>

      <CtaBand heading="Want to be the next one?" button="Start a Project" />
    </>
  );
}
