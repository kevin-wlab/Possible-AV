import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { nav, site } from "../data/site";

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="pa-nav">
      <div className="pa-wrap pa-nav-inner">
        <Link to="/" className="pa-logo" onClick={() => setOpen(false)}>
          <span className="pa-logo-dot" />
          {site.name}
        </Link>

        <nav className={`pa-nav-links${open ? " is-open" : ""}`}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `pa-nav-link${isActive ? " is-active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            className="pa-btn pa-btn--signal pa-nav-cta"
            onClick={() => setOpen(false)}
          >
            Start a Project
          </Link>
        </nav>

        <button
          className="pa-nav-toggle"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
