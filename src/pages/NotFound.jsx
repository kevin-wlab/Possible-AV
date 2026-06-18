import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function NotFound() {
  return (
    <>
      <Seo title="Not found" description="Page not found." />
      <section className="pa-phero" style={{ minHeight: "60vh", display: "grid", alignItems: "center" }}>
        <div className="pa-wrap">
          <p className="pa-eyebrow">404</p>
          <h1 className="pa-h1">No signal here.</h1>
          <p className="pa-lede pa-hero-sub">That page doesn't exist — let's get you back on track.</p>
          <div className="pa-btn-row">
            <Link to="/" className="pa-btn pa-btn--signal">Back home</Link>
            <Link to="/services" className="pa-btn pa-btn--line">See services</Link>
          </div>
        </div>
      </section>
    </>
  );
}
