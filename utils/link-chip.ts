import { InputRule, Node, PasteRule } from "@tiptap/core";

const TLDS =
  "com|org|net|io|dev|app|co|me|ai|xyz|gg|so|sh|tv|to|ly|fm|uk|us|ca|de|fr|in|ng|edu|gov|info|site|page|link";

const URL_BODY = `(?:https?:\\/\\/[^\\s]+|(?:[a-z0-9-]+\\.)+(?:${TLDS})(?![a-z0-9-])(?:[/?#][^\\s]*)?)`;
const TYPED = new RegExp(`(?:^|\\s)(${URL_BODY})\\s$`, "i");
const PASTED = new RegExp(URL_BODY, "gi");
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

const parse = (raw: string) => {
  const cleaned = raw.replace(TRAILING_PUNCTUATION, "");
  const href = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;

  try {
    const url = new URL(href);
    if (!url.hostname.includes(".")) return null;
    return { url, cleaned, trailing: raw.slice(cleaned.length) };
  } catch {
    return null;
  }
};

const labelFor = (url: URL) => {
  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
  const text = host + path;
  return text.length > 32 ? `${text.slice(0, 31)}…` : text;
};

const faviconFor = (href: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(href).hostname}&sz=32`;
  } catch {
    return "";
  }
};

export const LinkChip = Node.create({
  name: "linkChip",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  priority: 1000,

  addAttributes() {
    return {
      href: { default: null },
      label: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a[data-link-chip]",
        priority: 1000,
        getAttrs: (el) =>
          el instanceof HTMLElement
            ? { href: el.getAttribute("href"), label: el.textContent ?? "" }
            : false,
      },
    ];
  },

  renderHTML({ node }) {
    const href = node.attrs.href as string;
    return [
      "a",
      {
        "data-link-chip": "",
        href,
        title: href,
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      },
      [
        "img",
        {
          src: faviconFor(href),
          alt: "",
          width: "14",
          height: "14",
          loading: "lazy",
          referrerpolicy: "no-referrer",
        },
      ],
      ["span", node.attrs.label as string],
    ];
  },

  renderText({ node }) {
    return node.attrs.href as string;
  },

  addInputRules() {
    const type = this.type;

    return [
      new InputRule({
        find: TYPED,
        handler: ({ state, range, match }) => {
          const raw = match[1];
          const parsed = parse(raw);
          if (!parsed) return null;

          const from = range.from + match[0].indexOf(raw);
          const chip = type.create({
            href: parsed.url.href,
            label: labelFor(parsed.url),
          });
          state.tr.replaceWith(from, range.to, [
            chip,
            state.schema.text(`${parsed.trailing} `),
          ]);
        },
      }),
    ];
  },

  addPasteRules() {
    const type = this.type;

    return [
      new PasteRule({
        find: PASTED,
        handler: ({ state, range, match }) => {
          const parsed = parse(match[0]);
          if (!parsed) return null;
          if (
            state.doc.textBetween(Math.max(0, range.from - 1), range.from) ===
            "@"
          )
            return null;

          const chip = type.create({
            href: parsed.url.href,
            label: labelFor(parsed.url),
          });
          state.tr.replaceWith(
            range.from,
            range.from + parsed.cleaned.length,
            chip,
          );
        },
      }),
    ];
  },
});
