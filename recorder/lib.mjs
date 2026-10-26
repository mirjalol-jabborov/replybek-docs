// Recording kit for the docs clips: starts the real API (real AI, its own replybek_docs database),
// the dashboard and the fictional store; drives Chrome with a visible cursor; captures crisp frames
// over the DevTools screencast and encodes them to looping MP4 clips with ffmpeg.
import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import crypto from "node:crypto";
import http from "node:http";
import net from "node:net";
import { startSite, SITE_HOST } from "./site.mjs";
import { startBusinessApi, API_HOST } from "./business-api.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(dir, "../..");
export const CLIPS = path.resolve(dir, "../clips");
const require = createRequire(path.join(ROOT, "e2e/package.json"));
const { chromium } = require("playwright-core");

export const API = "http://127.0.0.1:3110";
export const APP = "http://127.0.0.1:4191";
// What visitors' pages and the embed code show; the browser routes it to the local API.
export const PUBLIC = "https://app.replybek.uz";
const SITE_PORT = 5301;
const BIZ_PORT = 5302;
const POLAR_PORT = 5303;
const SMTP_PORT = 2526;
export const POLAR_SECRET = "whsec_" + Buffer.from("docs-recordings-polar-secret").toString("base64");

const procs = [];
let site;
export let bizApi;
let polar;
let smtp;
process.on("exit", () => procs.forEach((p) => p.kill()));

function start(cmd, args, cwd, env) {
  const p = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ["pipe", "pipe", "pipe"] });
  p.log = "";
  p.stdout.on("data", (d) => (p.log += d));
  p.stderr.on("data", (d) => (p.log += d));
  procs.push(p);
  return p;
}
const up = (url) => {
  try {
    const code = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", url]).toString();
    return code !== "000" && Number(code) < 500;
  } catch {
    return false;
  }
};
async function waitFor(url, ms = 40000) {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 300))) if (up(url)) return;
  throw new Error(`${url} didn't start`);
}

export let api;
let billing = false;
function startApi() {
  api = start("node", ["src/server.js"], path.join(ROOT, "replybek-backend"), {
    PORT: "3110",
    PGDATABASE: "replybek_docs",
    // A local mail catcher, so the dashboard behaves as it does with email set up (invites say "sent").
    SMTP_URL: `smtp://127.0.0.1:${SMTP_PORT}`,
    ALLOW_PRIVATE_URLS: "true",
    APP_ORIGIN: APP,
    PUBLIC_API_URL: `${PUBLIC}/api`,
    NODE_OPTIONS: `--import ${pathToFileURL(path.join(dir, "preload.mjs")).href}`, // a URL: the path has spaces
    DOCS_HOST_MAP: JSON.stringify({ [SITE_HOST]: `http://127.0.0.1:${SITE_PORT}`, [API_HOST]: `http://127.0.0.1:${BIZ_PORT}` }),
    // Billing is off unless a scene needs it; then Polar's API is a local stand-in (its pages never appear).
    ...(billing
      ? { POLAR_ACCESS_TOKEN: "docs", POLAR_API_URL: `http://127.0.0.1:${POLAR_PORT}/v1`, POLAR_WEBHOOK_SECRET: POLAR_SECRET, POLAR_PRODUCT_STARTER: "prod-starter", POLAR_PRODUCT_GROWTH: "prod-growth", POLAR_PRODUCT_BUSINESS: "prod-business" }
      : { POLAR_ACCESS_TOKEN: "" }),
  });
}

/** Restarts the API with billing on or off. */
export async function setBilling(on) {
  if (billing === on) return;
  billing = on;
  api.kill();
  await new Promise((r) => api.once("exit", r));
  startApi();
  await waitFor(`${API}/health`);
}

export async function startServices() {
  for (const port of [3110, 4191, SITE_PORT, BIZ_PORT, POLAR_PORT, SMTP_PORT]) if (up(`http://127.0.0.1:${port}/`)) throw new Error(`Port ${port} is busy; stop whatever runs there first.`);
  site = await startSite(SITE_PORT);
  bizApi = await startBusinessApi(BIZ_PORT);
  polar = await startPolar(POLAR_PORT);
  smtp = await startSmtp(SMTP_PORT);
  execFileSync("node", ["scripts/migrate.js"], { cwd: path.join(ROOT, "replybek-backend"), env: { ...process.env, PGDATABASE: "replybek_docs" }, stdio: "ignore" });
  startApi();
  // A private build of the dashboard: the dev server would reload mid-clip whenever someone edits the app,
  // and the shared dist/ belongs to the e2e runs.
  const appDist = path.join(os.tmpdir(), "replybek-docs-app");
  const appEnv = { ...process.env, REPLYBEK_API: API, VITE_WIDGET_SRC: `${PUBLIC}/widget.js`, VITE_PUBLIC_API: `${PUBLIC}/api` };
  execFileSync("npx", ["vite", "build", "--outDir", appDist, "--emptyOutDir"], { cwd: path.join(ROOT, "replybek-app"), env: appEnv, stdio: "ignore" });
  start("npx", ["vite", "preview", "--outDir", appDist, "--port", "4191", "--strictPort", "--host", "127.0.0.1"], path.join(ROOT, "replybek-app"), appEnv);
  await Promise.all([waitFor(`${API}/health`), waitFor(APP)]);
  // Without the forced scale factor the screencast sends 1x frames even with deviceScaleFactor 2.
  return chromium.launch({ channel: "chrome", args: ["--force-device-scale-factor=2"] });
}
export function stopServices() {
  procs.forEach((p) => p.kill());
  site?.close();
  bizApi?.close();
  polar?.close();
  smtp?.close();
}

/** Accepts any email and throws it away. */
function startSmtp(port) {
  const server = net.createServer((sock) => {
    let data = false;
    let buf = "";
    sock.write("220 docs ESMTP\r\n");
    sock.on("data", (chunk) => {
      buf += chunk;
      let i;
      while ((i = buf.indexOf("\r\n")) >= 0) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 2);
        if (data) {
          if (line === ".") (data = false), sock.write("250 queued\r\n");
          continue;
        }
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === "DATA") (data = true), sock.write("354 go ahead\r\n");
        else if (cmd === "QUIT") sock.end("221 bye\r\n");
        else sock.write("250 ok\r\n");
      }
    });
    sock.on("error", () => {});
  });
  return new Promise((done) => server.listen(port, "127.0.0.1", () => done(server)));
}

// ───── Polar's API, stood in for billing clips ─────
const checkouts = {};
function startPolar(port) {
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const input = body ? JSON.parse(body) : {};
      const json = (status, data) => res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(data));
      if (req.method === "POST" && req.url === "/v1/checkouts/") {
        const id = crypto.randomUUID();
        checkouts[id] = input;
        return json(201, { id, url: `${APP}/?checkout=done#/settings/billing` });
      }
      if (req.method === "POST" && req.url === "/v1/customer-sessions/") return json(201, { customer_portal_url: `${APP}/#/settings/billing` });
      const sub = req.url.match(/^\/v1\/subscriptions\/([^/]+)$/);
      if (req.method === "PATCH" && sub) return json(200, { id: sub[1], status: "active", product_id: input.product_id, current_period_end: "2026-11-27T00:00:00Z", cancel_at_period_end: false, metadata: {} });
      json(404, {});
    });
  });
  return new Promise((done) => server.listen(port, "127.0.0.1", () => done(server)));
}

/** Plays Polar's webhook for the workspace's last checkout: the subscription started (trialing or active). */
export async function polarSubscribed(workspaceId, { status = "trialing", plan = "growth" } = {}) {
  const [checkoutId, c] = Object.entries(checkouts).reverse().find(([, x]) => x.external_customer_id === workspaceId) || [];
  const end = new Date(Date.now() + 7 * 86400000).toISOString();
  const data = { id: `sub_${crypto.randomUUID()}`, status, product_id: c?.products?.[0] || `prod-${plan}`, checkout_id: checkoutId || null, metadata: { workspace_id: workspaceId }, customer: { external_id: workspaceId }, trial_end: status === "trialing" ? end : null, current_period_end: end, cancel_at_period_end: false };
  const raw = JSON.stringify({ type: "subscription.created", data });
  const id = `msg_${crypto.randomUUID()}`;
  const ts = Math.floor(Date.now() / 1000);
  const key = Buffer.from(POLAR_SECRET.slice("whsec_".length), "base64");
  const sig = crypto.createHmac("sha256", key).update(`${id}.${ts}.${raw}`).digest("base64");
  const r = await fetchLocal(`${API}/billing/polar/webhook`, { method: "POST", headers: { "content-type": "application/json", "webhook-id": id, "webhook-timestamp": String(ts), "webhook-signature": `v1,${sig}` }, body: raw });
  if (r !== 200) throw new Error(`webhook → ${r}`);
}
// Node's fetch can't reach local ports from this sandbox, so local calls go through curl.
function fetchLocal(url, { method, headers, body }) {
  const args = ["-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", method, url, "--data-binary", "@-"];
  for (const [k, v] of Object.entries(headers)) args.push("-H", `${k}: ${v}`);
  return Number(execFileSync("curl", args, { input: body }).toString());
}

// ───── Database ─────
const pg = createRequire(path.join(ROOT, "replybek-backend/package.json"))("pg");
let pool;
export function db(sql, params) {
  pool ||= new pg.Pool({ host: "127.0.0.1", port: 54329, user: "replybek", password: "replybek", database: "replybek_docs", max: 2 });
  return pool.query(sql, params);
}
export const closeDb = () => pool?.end();

// ───── Browser context ─────

// A visible cursor (headless Chrome draws none) with a soft ring on each click.
const CURSOR = `(() => {
  if (window.top !== window) return;
  const add = () => {
    if (document.getElementById("__docs_cursor")) return;
    const c = document.createElement("div");
    c.id = "__docs_cursor";
    c.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M5 3.2 19 11.6l-6.4 1.5-3.5 6.1z" fill="#111215" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: "fixed", left: (window.__cx ?? -50) + "px", top: (window.__cy ?? -50) + "px", zIndex: 2147483647, pointerEvents: "none", transformOrigin: "5px 3px", transition: "transform .12s" });
    document.documentElement.appendChild(c);
    addEventListener("mousemove", (e) => { c.style.left = e.clientX - 5 + "px"; c.style.top = e.clientY - 3 + "px"; }, true);
    addEventListener("mousedown", (e) => {
      c.style.transform = "scale(.86)";
      const r = document.createElement("div");
      Object.assign(r.style, { position: "fixed", left: e.clientX - 16 + "px", top: e.clientY - 16 + "px", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(45,91,210,.22)", zIndex: 2147483646, pointerEvents: "none", transition: "transform .45s ease-out, opacity .45s ease-out" });
      document.documentElement.appendChild(r);
      requestAnimationFrame(() => requestAnimationFrame(() => { r.style.transform = "scale(1.9)"; r.style.opacity = "0"; }));
      setTimeout(() => r.remove(), 500);
    }, true);
    addEventListener("mouseup", () => (c.style.transform = ""), true);
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", add) : add();
})();`;

export async function newContext(browser, { width = 1280, height = 800 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: "light", locale: "en-US", timezoneId: "Asia/Tashkent" });
  await ctx.addInitScript(CURSOR);
  // Page crashes would otherwise only show up as a blank clip.
  ctx.on("page", (p) => p.on("pageerror", (e) => console.error(`  ! page error: ${e.message.split("\n")[0]}`)));
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("replybek.lang", localStorage.getItem("replybek.lang") || "en");
    } catch {}
  });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: APP });
  // The store's site and the public API address, as visitors would see them.
  await ctx.route(`https://${SITE_HOST}/**`, async (route) => {
    const u = new URL(route.request().url());
    route.fulfill({ response: await route.fetch({ url: `http://127.0.0.1:${SITE_PORT}${u.pathname}${u.search}` }) });
  });
  await ctx.route(`https://${API_HOST}/**`, async (route) => {
    const u = new URL(route.request().url());
    route.fulfill({ response: await route.fetch({ url: `http://127.0.0.1:${BIZ_PORT}${u.pathname}${u.search}` }) });
  });
  await ctx.route(`${PUBLIC}/**`, async (route) => {
    const u = new URL(route.request().url());
    // Live-update streams never end, so they can't pass through a route; the widget falls back to polling.
    if (u.pathname.endsWith("/stream")) return route.abort();
    const target = `${API}${u.pathname.replace(/^\/api/, "")}${u.search}`;
    route.fulfill({ response: await route.fetch({ url: target }) });
  });
  return ctx;
}

/** Signs up a new owner in this context (the session cookie stays in it). Returns the workspace. */
export async function signUp(ctx, { name = "Dilnoza Karimova", workspace = "Northstar Outfitters", onboarded = true } = {}) {
  const r = await ctx.request.post(`${APP}/api/auth/register`, { data: { name, email: `docs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@docs.replybek.dev`, password: "correct horse battery", workspace_name: workspace } });
  if (r.status() !== 201) throw new Error(`sign-up failed: ${r.status()} ${await r.text()}`);
  const ws = (await r.json()).workspaces[0];
  if (onboarded) await call(ctx, "POST", `/w/${ws.id}/onboarding/complete`, { website: SITE_HOST });
  return ws;
}

export async function call(ctx, method, p, body) {
  const r = await ctx.request.fetch(`${APP}/api${p}`, { method, data: body });
  const text = await r.text();
  if (!r.ok()) throw new Error(`${method} ${p} → ${r.status()} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

/** Waits until every knowledge source of the agent is ready (or failed). */
export async function sourcesReady(ctx, ws, agent, ms = 120000) {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 1000))) {
    const list = await call(ctx, "GET", `/w/${ws.id}/agents/${agent.id}/sources`);
    if (list.length && list.every((s) => !["processing", "pending", "queued"].includes(s.status) && !s.syncing)) return list;
  }
  throw new Error("knowledge didn't finish processing");
}

// ───── Acting like a person ─────

export function actor(page) {
  let pos = { x: 640, y: 420 };
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  async function moveTo(x, y, ms) {
    const from = { ...pos };
    const dist = Math.hypot(x - from.x, y - from.y);
    const duration = ms ?? Math.min(900, 280 + dist * 0.6);
    const steps = Math.max(6, Math.round(duration / 16));
    for (let i = 1; i <= steps; i++) {
      const k = ease(i / steps);
      await page.mouse.move(from.x + (x - from.x) * k, from.y + (y - from.y) * k);
      await page.waitForTimeout(duration / steps);
    }
    pos = { x, y };
    await page.evaluate(([cx, cy]) => ((window.__cx = cx - 5), (window.__cy = cy - 3)), [x, y]).catch(() => {});
  }
  const loc = (t) => (typeof t === "string" ? page.locator(t).first() : t);
  async function point(t) {
    const l = loc(t);
    try {
      await l.waitFor({ state: "visible", timeout: 30000 });
    } catch {
      const shot = path.join(os.tmpdir(), `docs-fail-${Date.now()}.png`);
      await page.screenshot({ path: shot }).catch(() => {});
      throw new Error(`can't find ${typeof t === "string" ? t : "element"} (screenshot: ${shot})`);
    }
    await l.scrollIntoViewIfNeeded();
    const b = await l.boundingBox();
    return { x: b.x + Math.min(b.width / 2, 60 + b.width * 0.15), y: b.y + b.height / 2 };
  }
  return {
    page,
    pause: (ms) => page.waitForTimeout(ms),
    async move(t) {
      const p = await point(t);
      await moveTo(p.x, p.y);
    },
    async click(t, { after = 350 } = {}) {
      const p = await point(t);
      await moveTo(p.x, p.y);
      await page.waitForTimeout(140);
      await page.mouse.down();
      await page.waitForTimeout(80);
      await page.mouse.up();
      await page.waitForTimeout(after);
    },
    async type(t, text, { delay = 42, clear = false } = {}) {
      await this.click(t, { after: 150 });
      if (clear) {
        await page.keyboard.press("Meta+A");
        await page.keyboard.press("Backspace");
      }
      await page.keyboard.type(text, { delay });
      await page.waitForTimeout(250);
    },
    async press(key, after = 300) {
      await page.keyboard.press(key);
      await page.waitForTimeout(after);
    },
    async park(x = 1180, y = 760) {
      await moveTo(x, y, 500);
    },
  };
}

// ───── Capture and encode ─────

/**
 * Records what `fn` does on `page` into clips/<name>.mp4 (+ .jpg poster). `crop` is a selector or
 * { x, y, width, height } in CSS pixels, measured when recording starts; omit it for the whole view.
 */
export async function record(page, name, { crop, pad = 0, holdEnd = 1800, holdStart = 500 } = {}, fn) {
  const vp = page.viewportSize();
  let rect = { x: 0, y: 0, width: vp.width, height: vp.height };
  if (typeof crop === "string") {
    const b = await page.locator(crop).first().boundingBox();
    rect = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(vp.width, b.width + 2 * pad), height: Math.min(vp.height, b.height + 2 * pad) };
  } else if (crop) rect = crop;

  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: vp.width * 2, maxHeight: vp.height * 2, everyNthFrame: 1 });
  await page.waitForTimeout(holdStart);
  try {
    await fn();
    await page.waitForTimeout(holdEnd);
  } finally {
    await cdp.send("Page.stopScreencast").catch(() => {});
    await cdp.detach().catch(() => {});
  }
  if (frames.length < 2) throw new Error(`${name}: no frames captured`);
  encode(name, frames, rect, vp);
}

function encode(name, frames, rect, vp) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `docs-${name}-`));
  const lines = [];
  frames.forEach((f, i) => {
    const file = path.join(tmp, `f${String(i).padStart(5, "0")}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, "base64"));
    const next = frames[i + 1];
    lines.push(`file '${file}'`, `duration ${next ? Math.max(0.001, next.t - f.t).toFixed(4) : 0.5}`);
  });
  lines.push(`file '${path.join(tmp, `f${String(frames.length - 1).padStart(5, "0")}.jpg`)}'`);
  fs.writeFileSync(path.join(tmp, "list.txt"), lines.join("\n"));
  // Frames come at device pixels; work out the scale from the first one.
  const probe = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path.join(tmp, "f00000.jpg")]).toString().trim().split(",");
  const s = Number(probe[0]) / vp.width;
  const even = (n) => Math.floor(n / 2) * 2;
  const crop = `crop=${even(rect.width * s)}:${even(rect.height * s)}:${even(rect.x * s)}:${even(rect.y * s)}`;
  const outW = even(Math.min(1520, rect.width * s));
  fs.mkdirSync(CLIPS, { recursive: true });
  const mp4 = path.join(CLIPS, `${name}.mp4`);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", path.join(tmp, "list.txt"), "-vf", `${crop},scale=${outW}:-2:flags=lanczos,format=yuv420p`, "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-tune", "stillimage", "-movflags", "+faststart", "-an", mp4]);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", mp4, "-vf", "select=eq(n\\,0)", "-frames:v", "1", "-q:v", "3", path.join(CLIPS, `${name}.jpg`)]);
  fs.rmSync(tmp, { recursive: true, force: true });
  const kb = Math.round(fs.statSync(mp4).size / 1024);
  const secs = (frames.at(-1).t - frames[0].t + 0.5).toFixed(1);
  console.log(`  ✓ ${name}.mp4  ${secs}s  ${kb} KB  (${frames.length} frames)`);
}
