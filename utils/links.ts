import type { Link } from "./api/links";

export function normalizeLinkSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function getPublicLinkUrl(
  username: string | null | undefined,
  slug: string,
) {
  return `https://cally.cermuel.dev/${username || "username"}/${slug}`;
}

export function getPublicLinkLabel(
  username: string | null | undefined,
  slug: string,
) {
  return `cally.cermuel.dev/${username || "username"}/${slug}`;
}

export function getDuplicateSlug(link: Link, links: Link[]) {
  const slugs = new Set(links.map((item) => item.slug));
  const base = `${link.slug}-copy`;

  if (!slugs.has(base)) return base;

  let suffix = 2;
  while (slugs.has(`${base}-${suffix}`)) suffix += 1;

  return `${base}-${suffix}`;
}

export function getDuplicateName(name: string) {
  const suffix = " copy";
  return `${name.slice(0, 20 - suffix.length).trimEnd()}${suffix}`;
}
