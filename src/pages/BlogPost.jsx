import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { getPost } from "../data/posts";
import { getService } from "../data/services";
import { LedCallout } from "../components/Blocks.jsx";
import NotFound from "./NotFound.jsx";

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);
  if (!post) return <NotFound />;

  const related = post.relatedService ? getService(post.relatedService) : null;

  return (
    <>
      <Seo title={post.title} description={post.excerpt} />

      <section className="pa-phero">
        <div className="pa-wrap">
          <p className="pa-eyebrow">
            <Link to="/blog" style={{ color: "inherit" }}>Blog</Link> / {post.category}
          </p>
          <h1 className="pa-h1" style={{ maxWidth: "20ch" }}>{post.title}</h1>
          <p className="pa-mono-meta" style={{ marginTop: 20, color: "var(--on-dark-dim)" }}>
            {post.category} · {post.readTime} · {post.date}
          </p>
        </div>
      </section>

      <article className="pa-sec">
        <div className="pa-wrap">
          <div className="pa-prose">
            <p className="pa-lede" style={{ color: "var(--text)", margin: "0 0 8px" }}>
              {post.excerpt}
            </p>
            {post.body.map((block, n) =>
              block.type === "h2" ? (
                <h2 key={n}>{block.text}</h2>
              ) : (
                <p key={n}>{block.text}</p>
              )
            )}
          </div>

          {post.ledNote && (
            <div style={{ maxWidth: "68ch", marginTop: 36 }}>
              <div className="pa-sec--dark" style={{ borderRadius: "var(--radius)", padding: 4 }}>
                <LedCallout />
              </div>
            </div>
          )}

          {/* related service CTA */}
          {related && (
            <div className="pa-callout" style={{ marginTop: 44 }}>
              <div>
                <p className="pa-tag">Related service</p>
                <p className="pa-h3" style={{ marginTop: 10, color: "var(--on-dark)" }}>{related.name}</p>
              </div>
              <Link to={`/services/${related.slug}`} className="pa-btn pa-btn--signal">
                {related.cta || "Learn more"}
              </Link>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
