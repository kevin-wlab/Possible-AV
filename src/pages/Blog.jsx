import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { CtaBand } from "../components/Blocks.jsx";
import { posts } from "../data/posts";

export default function Blog() {
  return (
    <>
      <Seo
        title="Blog"
        description="Guides and field notes on AV for events, pop-ups, museums, and trade shows."
      />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">Blog</p>
          <h1 className="pa-h1">Field notes & guides.</h1>
          <p className="pa-lede pa-hero-sub">
            Practical AV know-how for events, pop-ups, museums, and the show floor.
          </p>
        </div>
      </section>

      <section className="pa-sec">
        <div className="pa-wrap">
          <div className="pa-grid pa-grid-3">
            {posts.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="pa-card pa-card--link">
                <div className="pa-work-tags" style={{ marginBottom: 14 }}>
                  <span className="pa-tag">{p.category}</span>
                  <span className="pa-mono-meta">{p.readTime}</span>
                </div>
                <h3 className="pa-h3">{p.title}</h3>
                <p className="pa-card-p">{p.excerpt}</p>
                <span className="pa-arrow-link">Read →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand heading="Have a question we haven't answered?" button="Talk to us" />
    </>
  );
}
