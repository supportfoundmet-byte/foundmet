import { useEffect } from "react";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://foundmet.com").replace(/\/$/, "");
export const SITE_NAME = "FoundMet";
export const DEFAULT_DESCRIPTION =
  "FoundMet helps founders find co-founders nearby, connect privately, and build startups with geo-aware matching across India and globally.";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(attributes.property?.startsWith("og:") || attributes.name?.startsWith("og:") ? "meta" : "meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (value) element.setAttribute(key, value);
  });
}

export default function Seo({
  title = `${SITE_NAME} | Find your co-founder nearby`,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  type = "website",
  jsonLd,
}) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    const scriptId = "foundmet-jsonld";
    let script = document.getElementById(scriptId);
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, type, jsonLd]);

  return null;
}
