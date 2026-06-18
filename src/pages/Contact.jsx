import { useState } from "react";
import Seo from "../components/Seo.jsx";
import { site } from "../data/site";

export default function Contact() {
  const [sent, setSent] = useState(false);

  // Source-site stub: real submission is wired in Webflow (native form).
  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Seo
        title="Contact"
        description={`Start an AV project with Possible AV. ${site.responsePromise}`}
      />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Contact</p>
          <h1 className="pa-h1">Start a project.</h1>
          <p className="pa-lede pa-hero-sub">
            Tell us what you're building and where. {site.responsePromise}
          </p>
        </div>
      </section>

      <section className="pa-sec">
        <div className="pa-wrap">
          <div className="pa-split" style={{ alignItems: "start" }}>
            {/* form */}
            <div>
              {sent ? (
                <div className="pa-card" style={{ borderColor: "var(--signal)" }}>
                  <h3 className="pa-h3">Thanks — we've got it.</h3>
                  <p className="pa-card-p">{site.responsePromise}</p>
                </div>
              ) : (
                <form className="pa-form" onSubmit={onSubmit}>
                  <div className="pa-field">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" required />
                  </div>
                  <div className="pa-field">
                    <label htmlFor="company">Company</label>
                    <input id="company" name="company" />
                  </div>
                  <div className="pa-field">
                    <label htmlFor="eventType">Event type</label>
                    <input id="eventType" name="eventType" placeholder="Pop-up, conference, install…" />
                  </div>
                  <div className="pa-field">
                    <label htmlFor="location">Location</label>
                    <input id="location" name="location" placeholder="City / venue" />
                  </div>
                  <div className="pa-field">
                    <label htmlFor="date">Date</label>
                    <input id="date" name="date" type="text" placeholder="MM/DD/YYYY or range" />
                  </div>
                  <div className="pa-field">
                    <label htmlFor="budget">Budget range</label>
                    <select id="budget" name="budget" defaultValue="">
                      <option value="" disabled>Select…</option>
                      <option>Under $10k</option>
                      <option>$10k – $25k</option>
                      <option>$25k – $50k</option>
                      <option>$50k+</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>
                  <div className="pa-field pa-field--full">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" placeholder="What are you building?" />
                  </div>
                  <div className="pa-field--full">
                    <button type="submit" className="pa-btn pa-btn--signal">
                      Send it — we'll reply fast →
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* info rail */}
            <div>
              <div className="pa-card pa-sec--dark" style={{ background: "var(--ink-2)" }}>
                <p className="pa-tag">Prefer email?</p>
                <h3 className="pa-h3" style={{ color: "var(--on-dark)", marginTop: 10 }}>Reach us directly</h3>
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="pa-btn pa-btn--line"
                  style={{ marginTop: 16 }}
                >
                  {site.contactEmail}
                </a>
              </div>

              <div className="pa-card" style={{ marginTop: "var(--gap)" }}>
                <p className="pa-tag">Where we are</p>
                <h3 className="pa-h3" style={{ marginTop: 10 }}>{site.base}</h3>
                <p className="pa-card-p">Citywide, national, and global deployments.</p>
              </div>

              <div className="pa-card" style={{ marginTop: "var(--gap)" }}>
                <p className="pa-tag">LED walls</p>
                <p className="pa-card-p" style={{ marginTop: 10 }}>
                  For LED wall inquiries, head to our sister studio.
                </p>
                <a href={site.sister.url} target="_blank" rel="noreferrer" className="pa-arrow-link">
                  {site.sister.name} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
