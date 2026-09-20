import { useEffect } from "react";

/* =========================================================
   FoundMet SEO Configuration
========================================================= */

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://foundmet.com"
).replace(/\/+$/, "");

export const SITE_NAME = "FoundMet";

export const DEFAULT_DESCRIPTION =
  "FoundMet helps founders find co-founders nearby, connect privately, and build startups with geo-aware matching across India and globally.";

export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/* =========================================================
   Helpers
========================================================= */

function upsertMeta(attribute, key, value) {
  if (!value) return;

  let element = document.head.querySelector(
    `meta[${attribute}="${key}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", value);
}

function upsertLink(rel, href) {
  if (!href) return;

  let element = document.head.querySelector(
    `link[rel="${rel}"]`
  );

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function normalizePath(path = "/") {
  if (!path || path === "/") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function buildCanonicalUrl(path) {
  const normalizedPath = normalizePath(path);

  return normalizedPath === "/"
    ? SITE_URL
    : `${SITE_URL}${normalizedPath}`;
}

/* =========================================================
   JSON-LD
========================================================= */

function updateJsonLd(jsonLd) {
  const scriptId = "foundmet-jsonld";

  const existingScript = document.getElementById(scriptId);

  if (!jsonLd) {
    existingScript?.remove();
    return;
  }

  const script =
    existingScript || document.createElement("script");

  script.id = scriptId;
  script.type = "application/ld+json";

  script.textContent = JSON.stringify(jsonLd);

  if (!existingScript) {
    document.head.appendChild(script);
  }
}

/* =========================================================
   SEO Component
========================================================= */

export default function Seo({
  title = `${SITE_NAME} | Find your co-founder nearby`,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  type = "website",
  image = DEFAULT_IMAGE,
  robots = "index, follow",
  jsonLd = null,
}) {
  useEffect(() => {
    const canonicalUrl = buildCanonicalUrl(path);

    /* ---------------------------------------------
       Browser title
    --------------------------------------------- */

    document.title = title;

    /* ---------------------------------------------
       Basic SEO
    --------------------------------------------- */

    upsertMeta(
      "name",
      "description",
      description
    );

    upsertMeta(
      "name",
      "robots",
      robots
    );

    /* ---------------------------------------------
       Open Graph
    --------------------------------------------- */

    upsertMeta(
      "property",
      "og:title",
      title
    );

    upsertMeta(
      "property",
      "og:description",
      description
    );

    upsertMeta(
      "property",
      "og:url",
      canonicalUrl
    );

    upsertMeta(
      "property",
      "og:type",
      type
    );

    upsertMeta(
      "property",
      "og:site_name",
      SITE_NAME
    );

    upsertMeta(
      "property",
      "og:image",
      image
    );

    /* ---------------------------------------------
       Twitter / X
    --------------------------------------------- */

    upsertMeta(
      "name",
      "twitter:card",
      "summary_large_image"
    );

    upsertMeta(
      "name",
      "twitter:title",
      title
    );

    upsertMeta(
      "name",
      "twitter:description",
      description
    );

    upsertMeta(
      "name",
      "twitter:image",
      image
    );

    /* ---------------------------------------------
       Canonical URL
    --------------------------------------------- */

    upsertLink(
      "canonical",
      canonicalUrl
    );

    /* ---------------------------------------------
       JSON-LD
    --------------------------------------------- */

    updateJsonLd(jsonLd);

    /* ---------------------------------------------
       Cleanup
    --------------------------------------------- */

    return () => {
      // Don't remove global SEO tags here.
      // The next page will simply update them.
    };
  }, [
    title,
    description,
    path,
    type,
    image,
    robots,
    jsonLd,
  ]);

  return null;
}