// The fictional business the docs clips use: Northstar Outfitters, an outdoor gear shop.
// Served locally; recordings show it at https://northstar.example.com.
import http from "node:http";

export const SITE_HOST = "northstar.example.com";
export const SITE_URL = `https://${SITE_HOST}`;

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1f3d36"/><path d="M14 46 28 20l8 14 5-8 9 20z" fill="#e9f1ec"/><circle cx="45" cy="17" r="4" fill="#f2c14e"/></svg>`;

export const PAGES = {
  "/": {
    title: "Northstar Outfitters · Outdoor gear for Uzbekistan's mountains",
    h1: "Gear for Chimgan, Beldersay and beyond",
    body: `<p>Northstar Outfitters sells tents, jackets, boots and backpacks for hiking and skiing in Uzbekistan. We have stores in Tashkent and Samarkand and deliver across the country.</p>
<p>Every product comes with our 1-year warranty, and you can return unworn items within 30 days.</p>`,
  },
  "/delivery/": {
    title: "Delivery · Northstar Outfitters",
    h1: "Delivery",
    body: `<h2>Delivery times</h2><p>We deliver across Uzbekistan in 2 to 4 working days. Orders placed before 14:00 in Tashkent arrive the next day.</p>
<h2>Delivery cost</h2><p>Delivery in Tashkent is free for orders over 500,000 so'm. Below that, Tashkent delivery costs 25,000 so'm. Delivery to other regions costs 45,000 so'm.</p>
<h2>Tracking</h2><p>You get a tracking link by SMS as soon as your order leaves our warehouse.</p>`,
  },
  "/returns/": {
    title: "Returns and exchanges · Northstar Outfitters",
    h1: "Returns and exchanges",
    body: `<p>You can return unworn items with their tags within 30 days of delivery.</p>
<h2>How to return</h2><p>Bring the item and your receipt to any Northstar store, or request a courier pickup from your order page. Courier pickup costs 20,000 so'm.</p>
<h2>Refunds</h2><p>Refunds go back to the card you paid with within 5 working days. Cash payments are refunded in store.</p>
<h2>Exchanges</h2><p>Exchanging for another size is free. If the new size is out of stock, we refund you instead.</p>`,
  },
  "/sizes/": {
    title: "Size guide · Northstar Outfitters",
    h1: "Size guide",
    body: `<p>Our jackets run small. If you are between sizes, choose the larger one.</p><p>Boots are true to size. For thick winter socks, go half a size up.</p><p>Backpacks are sized by back length: S fits 40 to 45 cm, M fits 45 to 50 cm, L fits 50 cm and up.</p>`,
  },
  "/payment/": {
    title: "Payment · Northstar Outfitters",
    h1: "Payment",
    body: `<p>We accept Uzcard, Humo, Visa and Mastercard online, and Payme and Click in the app. You can also pay in cash on delivery in Tashkent.</p><p>Installments of 3 or 6 months are available on orders over 2,000,000 so'm through Uzum Nasiya.</p>`,
  },
  "/warranty/": {
    title: "Warranty · Northstar Outfitters",
    h1: "Warranty",
    body: `<p>All products have a 1-year warranty against manufacturing defects. Tents and backpacks from our own Northstar line have 3 years.</p><p>The warranty doesn't cover normal wear, cuts or damage from misuse. Bring the item to a store with your receipt and we repair or replace it within 14 days.</p>`,
  },
  "/stores/": {
    title: "Stores · Northstar Outfitters",
    h1: "Our stores",
    body: `<h2>Tashkent</h2><p>Amir Temur street 15, open every day 10:00 to 21:00.</p><h2>Samarkand</h2><p>Registan street 4, open Monday to Saturday 10:00 to 20:00.</p>`,
  },
  "/contact/": {
    title: "Contact · Northstar Outfitters",
    h1: "Contact us",
    body: `<p>Call +998 71 200 40 40 from 9:00 to 21:00, or write to help@northstar.example.com. We reply to emails within one working day.</p>`,
  },
  "/rentals/": {
    title: "Gear rental · Northstar Outfitters",
    h1: "Gear rental",
    body: `<p>Rent tents, sleeping bags and ski equipment at our Tashkent store. A 2-person tent costs 60,000 so'm per day; skis with boots cost 150,000 so'm per day.</p><p>Rentals need a passport and a deposit of 500,000 so'm, returned when the gear comes back.</p>`,
  },
};

const PRODUCTS = [
  ["Alpine 2 tent", "1,890,000", "#3f6212"],
  ["Chimgan down jacket", "1,250,000", "#a63d17"],
  ["Trail boots", "980,000", "#334155"],
  ["Pamir 45 backpack", "740,000", "#0f766e"],
];

function page(path, widget, lang = "en") {
  const p = PAGES[path];
  const nav = Object.entries(PAGES).filter(([u]) => u !== "/" && u !== "/rentals/").map(([u, x]) => `<a href="${u}">${x.h1.replace("Our stores", "Stores").replace("Contact us", "Contact")}</a>`).join("");
  const shop =
    path === "/"
      ? `<section class="shop">${PRODUCTS.map(([n, price, c]) => `<div class="item"><div class="pic" style="background:${c}"></div><b>${n}</b><span>${price} so'm</span></div>`).join("")}</section>`
      : "";
  const embed = widget ? `<script src="${widget.api}/widget.js" data-key="${widget.key}" data-api="${widget.api}"${widget.language ? ` data-language="${widget.language}"` : ""} defer></script>` : "";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${p.title}</title><meta name="description" content="Outdoor gear for hiking and skiing in Uzbekistan. Stores in Tashkent and Samarkand, delivery across the country.">
<meta property="og:site_name" content="Northstar Outfitters"><meta name="theme-color" content="#1f3d36">
<link rel="icon" type="image/svg+xml" href="/logo.svg"><link rel="apple-touch-icon" href="/logo.svg">
<style>
*{box-sizing:border-box}body{margin:0;font:16px/1.6 Georgia,"Times New Roman",serif;color:#1d2622;background:#f6f3ec}
header{display:flex;align-items:center;gap:28px;padding:18px 48px;background:#1f3d36;color:#e9f1ec}
header a{color:#e9f1ec;text-decoration:none;font:500 14px system-ui,sans-serif;opacity:.85}
.logo{display:flex;align-items:center;gap:10px;font:700 19px system-ui,sans-serif;opacity:1!important;margin-right:auto}
.logo img{width:30px;height:30px}
main{max-width:980px;margin:0 auto;padding:48px}
h1{font-size:40px;line-height:1.15;margin:0 0 16px;font-weight:600}h2{font-size:22px;margin:28px 0 8px}
.shop{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:36px}
.item{font:14px system-ui,sans-serif}.pic{aspect-ratio:1;border-radius:10px;margin-bottom:10px;opacity:.85}.item b{display:block}.item span{color:#5b665f}
footer{padding:32px 48px;color:#5b665f;font:13px system-ui,sans-serif}
</style></head><body>
<header><a class="logo" href="/"><img src="/logo.svg" alt="">Northstar Outfitters</a>${nav}</header>
<main><h1>${p.h1}</h1>${p.body}${shop}</main>
<footer>© Northstar Outfitters · Tashkent and Samarkand</footer>${embed}</body></html>`;
}

/** Starts the site on `port`. `?widget=<key>&api=<url>` on any page embeds that agent's chat widget. */
export function startSite(port) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, SITE_URL);
    if (url.pathname === "/robots.txt") return res.writeHead(200, { "content-type": "text/plain" }).end(`User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    if (url.pathname === "/sitemap.xml") {
      return res.writeHead(200, { "content-type": "application/xml" }).end(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(PAGES).map((p) => `<url><loc>${SITE_URL}${p}</loc></url>`).join("")}</urlset>`);
    }
    if (url.pathname === "/logo.svg" || url.pathname === "/favicon.ico") return res.writeHead(200, { "content-type": "image/svg+xml" }).end(LOGO);
    if (!PAGES[url.pathname]) return res.writeHead(404, { "content-type": "text/html" }).end("<h1>Not found</h1>");
    // ?widget=<key>&api=<url> embeds that agent's chat; &language= sets data-language, &lang= the page's language.
    const key = url.searchParams.get("widget");
    const widget = key ? { key, api: url.searchParams.get("api"), language: url.searchParams.get("language") } : null;
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(page(url.pathname, widget, url.searchParams.get("lang") || "en"));
  });
  return new Promise((done) => server.listen(port, "127.0.0.1", () => done(server)));
}
