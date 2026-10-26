// Website widget: install code, look and feel, languages, and what visitors can do in the chat.
import { newContext, actor, record, call, APP } from "../lib.mjs";
import { SITE_URL } from "../site.mjs";
import { agentWithSite } from "../world.mjs";
import { storePage, widgetCrop, openWidget, waitForAnswer } from "./agents.mjs";

const QUESTIONS = {
  en: ["How much is delivery?", "How do I return an item?", "Which jacket size should I pick?"],
  uz: ["Yetkazib berish qancha turadi?", "Mahsulotni qanday qaytaraman?", "Qaysi o‘lchamni tanlashim kerak?"],
  ru: ["Сколько стоит доставка?", "Как вернуть товар?", "Какой размер куртки выбрать?"],
};

async function publishedAgent(ctx, opts) {
  const { ws, agent } = await agentWithSite(ctx, { publish: true, ...opts });
  await call(ctx, "PATCH", `/w/${ws.id}/agents/${agent.id}`, { suggested_questions_i18n: QUESTIONS, suggestion_default_language: "en", welcome: "Hi! I'm Northstar Help. Ask me about orders, delivery, returns or sizes." });
  return { ws, agent };
}

export async function installWidget({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 800 });
  await publishedAgent(ctx);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/widget`);
  await page.waitForSelector("#wg-origin");
  await page.evaluate(() => document.querySelector(".page-body")?.scrollBy({ top: 9999 }));
  await act.pause(800);

  await record(page, "widget-install", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.click("button:has-text('Copy code')");
    await act.pause(1200);
    await act.type("#wg-origin", SITE_URL.replace(/\/$/, ""));
    await act.click("button:has-text('Add'):near(#wg-origin)");
    await act.pause(700);
    await act.click(".unsaved-bar button:has-text('Save changes')");
    await act.park();
  });
  await ctx.close();
}

/** A small square PNG logo, drawn by Chrome. */
async function logoPng(browser) {
  const ctx = await browser.newContext({ viewport: { width: 128, height: 128 } });
  const p = await ctx.newPage();
  await p.setContent(`<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128"><rect width="64" height="64" rx="14" fill="#1f3d36"/><path d="M14 46 28 20l8 14 5-8 9 20z" fill="#e9f1ec"/><circle cx="45" cy="17" r="4" fill="#f2c14e"/></svg></body>`);
  const png = await p.screenshot({ omitBackground: true });
  await ctx.close();
  return png;
}

export async function customizeWidget({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 800 });
  await publishedAgent(ctx);
  const logo = await logoPng(browser);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/widget`);
  await page.waitForSelector(".swatches");
  await act.pause(800);

  await record(page, "widget-customize", { crop: ".main", holdEnd: 2400 }, async () => {
    await act.click(".swatch:nth-child(2)");
    await act.pause(500);
    await act.click(".swatch:nth-child(6)");
    await act.pause(600);
    await act.move(".logo-picker button");
    await page.locator(".logo-picker input[type=file]").setInputFiles({ name: "northstar-logo.png", mimeType: "image/png", buffer: logo });
    await act.pause(900);
    await act.type("#wg-name", "Northstar Outfitters");
    await act.type("#wg-welcome", "Salom! Hi! Ask me about orders, delivery, returns or sizes.", { clear: true, delay: 24 });
    await act.pause(500);
    await act.click(".unsaved-bar button:has-text('Save changes')");
    await act.park();
  });
  await ctx.close();
}

export async function widgetLanguages({ browser }) {
  const ctx = await newContext(browser, { width: 1100, height: 760 });
  const { agent } = await publishedAgent(ctx);
  const page = await ctx.newPage();
  const act = actor(page);

  await page.goto(storePage(agent, { lang: "uz" }));
  await openWidget(page, act);
  await record(page, "widget-uzbek", { crop: widgetCrop(page) }, async () => {
    await act.pause(800);
    await act.click("#replybek-widget .chip:nth-child(1)");
    await waitForAnswer(page, 2);
    await act.park(1060, 300);
  });

  await page.goto(storePage(agent, { language: "ru" }));
  await openWidget(page, act);
  await record(page, "widget-russian", { crop: widgetCrop(page) }, async () => {
    await act.type("#replybek-widget input[type=text]", "Можно обменять ботинки на другой размер?");
    await act.press("Enter");
    await waitForAnswer(page, 2);
    await act.park(1060, 300);
  });
  await ctx.close();
}

/** A product photo a visitor might send: the jacket swatch from the store page. */
async function photoPng(browser) {
  const ctx = await browser.newContext({ viewport: { width: 480, height: 360 } });
  const p = await ctx.newPage();
  await p.setContent(`<body style="margin:0;background:#e9e4da;display:grid;place-items:center;height:100vh"><div style="width:300px;height:250px;border-radius:18px;background:linear-gradient(160deg,#b4502a,#7f3417);position:relative"><div style="position:absolute;left:138px;top:40px;width:24px;height:180px;background:#5b2410;border-radius:6px"></div><div style="position:absolute;left:60px;top:150px;width:60px;height:4px;background:#f6efe6;transform:rotate(-24deg)"></div></div></body>`);
  const png = await p.screenshot();
  await ctx.close();
  return png;
}

export async function visitorExperience({ browser }) {
  const ctx = await newContext(browser, { width: 1100, height: 760 });
  const { ws, agent } = await publishedAgent(ctx);
  const photo = await photoPng(browser);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(storePage(agent));
  await page.waitForSelector("#replybek-widget .launcher", { timeout: 20000 });
  await act.pause(800);

  await record(page, "visitor-chat", { crop: widgetCrop(page) }, async () => {
    await act.click("#replybek-widget .launcher");
    await page.waitForSelector("#replybek-widget .panel");
    await act.pause(900);
    await act.click("#replybek-widget .chip:nth-child(2)");
    await waitForAnswer(page, 2);
    await act.pause(700);
    await act.click("#replybek-widget .src-toggle");
    await act.park(1060, 300);
  });

  await record(page, "visitor-file", { crop: widgetCrop(page), holdEnd: 2400 }, async () => {
    await act.move("#replybek-widget .attach");
    await page.locator("#replybek-widget input[type=file]").setInputFiles({ name: "jacket-seam.png", mimeType: "image/png", buffer: photo });
    await act.pause(900);
    await act.type("#replybek-widget input[type=text]", "The seam on my jacket came apart after one week.");
    await act.press("Enter");
    await waitForAnswer(page, 3);
    await act.park(1060, 300);
  });

  await record(page, "visitor-person", { crop: widgetCrop(page), holdEnd: 2600 }, async () => {
    await act.click("#replybek-widget button:has-text('Start a new chat')");
    await act.pause(900);
    await act.type("#replybek-widget input[type=text]", "Do you make custom team jackets with a logo?");
    await act.press("Enter");
    await waitForAnswer(page, 2);
    await act.pause(900);
    await act.click("#replybek-widget button.human");
    await page.waitForSelector("#replybek-widget .handoff", { timeout: 30000 });
    await act.pause(1500);
    // A teammate picks it up in the inbox and replies.
    const [conv] = await call(ctx, "GET", `/w/${ws.id}/conversations?view=needs_human`);
    await call(ctx, "POST", `/w/${ws.id}/conversations/${conv.id}/takeover`);
    await call(ctx, "POST", `/w/${ws.id}/conversations/${conv.id}/reply`, { text: "Hi, I'm Dilnoza from Northstar. Yes, we make team jackets with your logo from 10 pieces. How many do you need, and in which colour?" });
    await page.waitForSelector("#replybek-widget .msg.team", { timeout: 20000 });
    await act.park(1060, 300);
  });
  await ctx.close();
}
