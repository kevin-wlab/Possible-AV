import { useEffect } from "react";

// Lightweight SEO: sets <title> and <meta name="description">.
// Real per-page SEO will be set in Webflow; this keeps the source site correct.
export default function Seo({ title, description }) {
  useEffect(() => {
    const full = title ? `${title} — Possible AV` : "Possible AV";
    document.title = full;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [title, description]);
  return null;
}
