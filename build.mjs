// Builds docs.replybek.uz into dist/: one HTML page per content/*.md, plus search index, sitemap
// and llms.txt. Page order and groups come from nav.mjs.
//
// Markdown extras (one per line):
//   @clip name | Caption        a looping clip from clips/name.mp4 (poster clips/name.jpg)
//   @shot name | Caption        a still from clips/name.png
//   :::note / :::tip / :::warning … :::     a callout
//   :::steps … :::              an ordered list shown as numbered steps
//   :::cards … :::              a list of [Title](slug): text links shown as a grid
import fs from "fs";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { Marked } from "marked";
import { NAV, SITE } from "./nav.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, "dist");
const landing = path.join(dir, "../replybek-landing/site");

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
const href = (slug) => (slug === "index" ? "/" : `/${slug}/`);

// ───── Read pages ─────
const pages = NAV.flatMap((g) => g.pages.map((slug) => ({ slug, group: g.group })));
for (const p of pages) {
  const file = path.join(dir, "content", `${p.slug}.md`);
  const raw = fs.existsSync(file)
    ? fs.readFileSync(file, "utf8")
    : (console.warn(`! content/${p.slug}.md isn't written yet`), `---\ntitle: ${p.slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase())}\n---\n:::note\nThis page is being written.\n:::\n`);
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`content/${p.slug}.md needs a --- title/description --- header`);
  for (const line of m[1].split("\n")) {
    const [, k, v] = line.match(/^(\w+):\s*(.*)$/) || [];
    if (k) p[k] = v.trim();
  }
  p.body = raw.slice(m[0].length);
}
const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
for (const f of fs.readdirSync(path.join(dir, "content"))) {
  if (!bySlug[f.replace(/\.md$/, "")]) console.warn(`! content/${f} isn't in nav.mjs, so it isn't built`);
}

// ───── Markdown ─────
const missingClips = [];
function blocks(md) {
  const lines = md.split("\n");
  const outLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const media = line.match(/^@(clip|shot)\s+([\w-]+)\s*(?:\|\s*(.*))?$/);
    if (media) {
      outLines.push(figure(media[1], media[2], media[3] || ""), "");
      continue;
    }
    const open = line.match(/^:::(note|tip|warning|steps|cards)\s*(.*)$/);
    if (open) {
      const inner = [];
      while (++i < lines.length && lines[i] !== ":::") inner.push(lines[i]);
      outLines.push(container(open[1], open[2], inner.join("\n")), "");
      continue;
    }
    outLines.push(line);
  }
  return outLines.join("\n");
}
function figure(kind, name, caption) {
  const ext = kind === "clip" ? "mp4" : "png";
  const file = path.join(dir, "clips", `${name}.${ext}`);
  const cap = caption ? `<figcaption>${inline(caption)}</figcaption>` : "";
  if (!fs.existsSync(file)) {
    missingClips.push(name);
    return `<figure class="media pending"><div class="media-missing">Clip “${esc(name)}” isn't recorded yet</div>${cap}</figure>`;
  }
  if (kind === "shot") return `<figure class="media"><img src="/clips/${name}.png" alt="${esc(caption)}" loading="lazy">${cap}</figure>`;
  const poster = fs.existsSync(path.join(dir, "clips", `${name}.jpg`)) ? ` poster="/clips/${name}.jpg"` : "";
  // Tall clips (the chat widget) would fill the screen at full width.
  const [w, h] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]).toString().trim().split(",").map(Number);
  const tall = h > w * 0.9 ? " tall" : "";
  return `<figure class="media${tall}"><video width="${w}" height="${h}" src="/clips/${name}.mp4"${poster} autoplay muted loop playsinline preload="metadata" aria-label="${esc(caption)}"></video>${cap}</figure>`;
}
function container(kind, arg, inner) {
  if (kind === "steps") return `<div class="steps">${md.parse(blocks(inner))}</div>`;
  if (kind === "cards") {
    const items = inner.split("\n").map((l) => l.match(/^-\s*\[([^\]]+)\]\(([\w/-]+)\):?\s*(.*)$/)).filter(Boolean);
    return `<div class="cards">${items.map(([, t, s, d]) => `<a class="card" href="${href(s)}"><b>${esc(t)}</b><span>${inline(d)}</span></a>`).join("")}</div>`;
  }
  const label = arg || { note: "Note", tip: "Tip", warning: "Careful" }[kind];
  return `<div class="callout ${kind}"><b>${esc(label)}</b>${md.parse(blocks(inner))}</div>`;
}
const inline = (s) => md.parseInline(s);

const md = new Marked({
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      if (depth === 1) return ""; // the page title comes from the header
      const id = slugify(text);
      return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${text}</h${depth}>\n`;
    },
    link({ href: to, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      // Internal links are written as [text](slug) or [text](slug#part).
      const internal = to.match(/^([\w-]+)(#[\w-]+)?$/);
      const url = internal && bySlug[internal[1]] ? href(internal[1]) + (internal[2] || "") : to;
      if (internal && !bySlug[internal[1]]) console.warn(`! link to unknown page "${to}"`);
      const ext = /^https?:/.test(url) ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${esc(url)}"${title ? ` title="${esc(title)}"` : ""}${ext}>${text}</a>`;
    },
    code({ text, lang }) {
      return `<div class="code"><button class="copy" type="button" aria-label="Copy code">Copy</button><pre><code${lang ? ` data-lang="${esc(lang)}"` : ""}>${esc(text)}</code></pre></div>\n`;
    },
  },
  hooks: {
    // Wide tables scroll inside their own box instead of the page.
    postprocess: (html) => html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>"),
  },
});

// ───── Page template ─────
const LOGO = `<svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><rect width="48" height="48" rx="11" fill="var(--logo-bg)"/><path fill="var(--logo-fg)" fill-rule="evenodd" transform="translate(10.6 10.6) scale(0.56)" d="M8 13 Q8 6 15 6 H27 Q41 6 41 17.5 Q41 27.5 31 28.8 L41 42 H29.5 L20.5 29 H17 V42 H8 Z M17 13.5 H27 Q32.5 13.5 32.5 17.5 Q32.5 21.5 27 21.5 H17 Z"/></svg>`;

function sidebar(current) {
  return NAV.map(
    (g) => `<div class="nav-group"><div class="nav-label">${esc(g.group)}</div>${g.pages
      .map((s) => `<a href="${href(s)}"${s === current ? ' aria-current="page"' : ""}>${esc(bySlug[s].nav || bySlug[s].title)}</a>`)
      .join("")}</div>`
  ).join("");
}

function render(p, i) {
  const html = md.parse(blocks(p.body));
  const toc = [...html.matchAll(/<h([23]) id="([^"]+)"><a[^>]*>#<\/a>(.*?)<\/h\1>/g)].map(([, d, id, t]) => ({ d, id, t: t.replace(/<[^>]+>/g, "") }));
  const prev = pages[i - 1];
  const next = pages[i + 1];
  const title = p.slug === "index" ? `${SITE.name} Docs` : `${p.title} · ${SITE.name} Docs`;
  const url = SITE.origin + href(p.slug);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.description || "")}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description || "")}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://replybek.uz/og.png">
<meta property="og:site_name" content="Replybek Docs">
<meta name="theme-color" content="#fcfcfb" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0d0e10" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/docs.css?v=${SITE.version}">
<script>try{var t=localStorage.getItem("replybek.docs.theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<header class="top">
  <button class="menu" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="sidebar"><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
  <a class="brand" href="/" aria-label="Replybek Docs home">${LOGO}<span class="wordmark">replybek<i>.</i></span><span class="brand-docs">Docs</span></a>
  <button class="search-open" type="button" aria-label="Search the docs"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m13.2 13.2 3.3 3.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>Search</span><kbd>⌘K</kbd></button>
  <nav class="top-links" aria-label="Replybek">
    <a href="https://replybek.uz/">replybek.uz</a>
    <button class="theme" type="button" aria-label="Switch theme"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M10 3.2a6.8 6.8 0 1 0 6.8 7.6A5.3 5.3 0 0 1 10 3.2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button>
    <a class="btn" href="${SITE.app}">Open<span class="long">&nbsp;Replybek</span></a>
  </nav>
</header>
<div class="layout">
  <aside class="sidebar" id="sidebar" aria-label="Documentation">${sidebar(p.slug)}</aside>
  <main id="content" class="content">
    <article>
      <p class="eyebrow">${esc(p.group)}</p>
      <h1>${esc(p.title.replace(/\.$/, ""))}<span class="dot">.</span></h1>
      ${p.description ? `<p class="lead">${inline(p.description)}</p>` : ""}
      ${html}
    </article>
    <nav class="pager" aria-label="Previous and next pages">
      ${prev ? `<a class="prev" href="${href(prev.slug)}"><span>Previous</span><b>${esc(prev.title)}</b></a>` : "<span></span>"}
      ${next ? `<a class="next" href="${href(next.slug)}"><span>Next</span><b>${esc(next.title)}</b></a>` : "<span></span>"}
    </nav>
    <footer class="foot">Questions? Write to <a href="mailto:admin@replybek.uz">admin@replybek.uz</a> or <a href="https://t.me/replybek_support" target="_blank" rel="noopener">@replybek_support</a> on Telegram.</footer>
  </main>
  ${toc.length > 1 ? `<nav class="toc" aria-label="On this page"><div class="toc-label">On this page</div>${toc.map((h) => `<a class="d${h.d}" href="#${h.id}">${esc(h.t)}</a>`).join("")}</nav>` : ""}
</div>
<div class="search" hidden role="dialog" aria-modal="true" aria-label="Search the docs">
  <div class="search-box">
    <input type="search" placeholder="Search the docs" aria-label="Search the docs" autocomplete="off" spellcheck="false">
    <div class="search-results" role="listbox"></div>
  </div>
</div>
<script src="/assets/docs.js?v=${SITE.version}" defer></script>
</body>
</html>
`;
}

// ───── Write ─────
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
pages.forEach((p, i) => {
  const target = path.join(out, p.slug === "index" ? "index.html" : `${p.slug}/index.html`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, render(p, i));
});
fs.cpSync(path.join(dir, "assets"), path.join(out, "assets"), { recursive: true });
if (fs.existsSync(path.join(dir, "clips"))) fs.cpSync(path.join(dir, "clips"), path.join(out, "clips"), { recursive: true, filter: (f) => !/\.(webm|json)$/.test(f) });
for (const f of ["favicon.ico", "favicon.svg", "apple-touch-icon.png"]) fs.copyFileSync(path.join(landing, f), path.join(out, f));
fs.mkdirSync(path.join(out, "fonts"), { recursive: true });
for (const f of ["inter-latin.woff2", "inter-latin-ext.woff2", "inter-cyrillic.woff2", "bricolage-grotesque-latin.woff2", "jetbrains-mono-latin.woff2"]) {
  fs.copyFileSync(path.join(landing, "fonts", f), path.join(out, "fonts", f));
}

// Search: each page and each of its sections, plain text.
const plain = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
const index = [];
for (const p of pages) {
  const html = md.parse(blocks(p.body));
  index.push({ t: p.title, g: p.group, u: href(p.slug), x: plain(`${p.description || ""} ${html}`).slice(0, 600) });
  for (const [, , id, head, body] of html.matchAll(/<h([23]) id="([^"]+)"><a[^>]*>#<\/a>(.*?)<\/h\1>([\s\S]*?)(?=<h[23] |$)/g)) {
    index.push({ t: plain(head), p: p.title, g: p.group, u: `${href(p.slug)}#${id}`, x: plain(body).slice(0, 300) });
  }
}
fs.writeFileSync(path.join(out, "search.json"), JSON.stringify(index));
fs.writeFileSync(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${SITE.origin}${href(p.slug)}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE.origin}/sitemap.xml\n`);
fs.writeFileSync(
  path.join(out, "llms.txt"),
  `# Replybek Docs\n\n> How to set up and run Replybek: AI agents that answer customers from your knowledge, act in your systems with the customer's confirmation, and hand off to your team.\n\n${NAV.map((g) => `## ${g.group}\n\n${g.pages.map((s) => `- [${bySlug[s].title}](${SITE.origin}${href(s)}): ${bySlug[s].description || ""}`).join("\n")}`).join("\n\n")}\n`
);
fs.writeFileSync(path.join(out, "404.html"), render({ slug: "404", group: "Not found", title: "Page not found", description: "This page doesn't exist. Try the search, or start from the [welcome page](/).", body: "" }, -1).replace(/<nav class="pager"[\s\S]*?<\/nav>/, ""));

console.log(`Built ${pages.length} pages into dist/.${missingClips.length ? ` ${missingClips.length} clips not recorded yet: ${[...new Set(missingClips)].join(", ")}` : ""}`);
