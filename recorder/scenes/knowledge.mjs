// Knowledge: sources table, websites, files, Q&A answers and unanswered questions.
import { newContext, actor, record, call, sourcesReady, APP } from "../lib.mjs";
import { SITE_HOST } from "../site.mjs";
import { agentWithSite, seedHistory } from "../world.mjs";

/** A small real PDF, printed by Chrome, to upload as a document. */
async function samplePdf(browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setContent(`<html><body style="font:14px/1.6 Georgia,serif;padding:48px;color:#1d2622">
    <h1>Northstar gift cards and warranty</h1>
    <h2>Gift cards</h2><p>Gift cards come in 200,000, 500,000 and 1,000,000 so'm. They are valid for 12 months and can be used online and in our Tashkent and Samarkand stores. Gift cards can't be exchanged for cash.</p>
    <h2>Warranty claims</h2><p>To claim the warranty, bring the item and your receipt to any store. We repair or replace it within 14 days. Tents and backpacks from the Northstar line have a 3-year warranty.</p>
    <h2>Corporate orders</h2><p>Companies ordering 10 or more items get 10% off. Write to b2b@northstar.example.com.</p></body></html>`);
  const pdf = await page.pdf({ format: "A4" });
  await ctx.close();
  return pdf;
}

async function openAdd(act, page) {
  await act.click(".page-head button:has-text('Add knowledge')");
  await page.waitForSelector(".dialog [role=radiogroup], .dialog .segmented, .dialog");
  await act.pause(500);
}

export async function knowledge({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 780 });
  const { ws, agent } = await agentWithSite(ctx);
  await call(ctx, "POST", `/w/${ws.id}/agents/${agent.id}/sources/qa`, { question: "Do you offer gift wrapping?", answer: "Yes. Gift wrapping is free for orders over 300,000 so'm, and 15,000 so'm otherwise." });
  await sourcesReady(ctx, ws, agent);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/knowledge`);
  await page.waitForSelector("table");
  await act.pause(800);

  await record(page, "knowledge-table", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.move("tr:has-text('gift wrapping')");
    await act.pause(500);
    await act.click(`tr:has-text('${SITE_HOST}')`);
    await page.waitForSelector(".drawer", { timeout: 10000 });
    await act.pause(1600);
    await page.locator(".drawer .drawer-body, .drawer").first().evaluate((el) => el.scrollBy({ top: 420, behavior: "smooth" }));
    await act.pause(1200);
    await act.park();
  });

  await record(page, "knowledge-pages", { crop: ".main", holdEnd: 2000 }, async () => {
    const search = page.locator(".drawer input[type=search], .drawer input[placeholder='Search pages']").first();
    if (await search.count()) await act.type(search, "returns");
    await act.pause(900);
    await act.click(".drawer button:has-text('Re-sync now')");
    await act.pause(2500);
    await act.park();
  });
  await page.keyboard.press("Escape");
  await ctx.close();
}

export async function websites({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 800 });
  const ws = await (await import("../lib.mjs")).signUp(ctx);
  await call(ctx, "POST", `/w/${ws.id}/agents`, { name: "Northstar Help", purpose: "Answer questions about orders, delivery, returns and sizes." });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/knowledge`);
  await page.waitForSelector(".page-head button:has-text('Add knowledge')");
  await act.pause(800);

  await record(page, "knowledge-website", { crop: ".main", holdEnd: 2500 }, async () => {
    await openAdd(act, page);
    await act.type("#ak-url", SITE_HOST);
    await act.click(".dialog button:has-text('Check site')");
    await page.waitForSelector(".site-preview", { timeout: 30000 });
    await act.pause(1200);
    // Leave the store pages out: untick two sections to show choosing.
    for (const s of ["/stores/", "/rentals/"]) {
      const box = page.locator(`.sections label.check:has-text('${s.replaceAll("/", "")}')`).first();
      if (await box.count()) await act.click(box, { after: 250 });
    }
    await act.pause(500);
    await act.click(".dialog-foot .btn-primary");
    await page.waitForSelector("tr:has-text('northstar')", { timeout: 20000 });
    await page.waitForSelector("tr:has-text('northstar') :text('Ready'), tr:has-text('northstar') .badge.green", { timeout: 120000 }).catch(() => {});
    await act.park();
  });
  await ctx.close();
}

export async function files({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 780 });
  await agentWithSite(ctx);
  const pdf = await samplePdf(browser);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/knowledge`);
  await page.waitForSelector("table");
  await act.pause(800);

  await record(page, "knowledge-files", { crop: ".main", holdEnd: 2500 }, async () => {
    await openAdd(act, page);
    await act.click(".dialog [role=radio]:has-text('Files'), .dialog button:has-text('Files')");
    await act.pause(600);
    await act.move(".dialog .dropzone, .dialog :text('Drop files here')");
    await page.locator(".dialog input[type=file]").setInputFiles({ name: "Gift cards and warranty.pdf", mimeType: "application/pdf", buffer: pdf });
    await act.pause(1100);
    await act.click(".dialog-foot .btn-primary");
    await page.waitForSelector("tr:has-text('Gift cards and warranty')", { timeout: 20000 });
    await page.waitForSelector("tr:has-text('Gift cards and warranty') .badge.green, tr:has-text('Gift cards and warranty') :text('Ready')", { timeout: 90000 }).catch(() => {});
    await act.park();
  });
  await ctx.close();
}

export async function qa({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 780 });
  await agentWithSite(ctx);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/knowledge`);
  await page.waitForSelector("table");
  await act.pause(800);

  await record(page, "knowledge-qa", { crop: ".main", holdEnd: 2200 }, async () => {
    await openAdd(act, page);
    await act.click(".dialog [role=radio]:has-text('Q&A'), .dialog button:has-text('Q&A')");
    await act.type("#ak-q", "Do you offer gift wrapping?");
    await act.type("#ak-a", "Yes. Gift wrapping is free for orders over 300,000 so'm, and 15,000 so'm otherwise.", { delay: 22 });
    await act.click(".dialog-foot .btn-primary");
    await page.waitForSelector("tr:has-text('gift wrapping')", { timeout: 20000 });
    await act.park();
  });
  await ctx.close();
}

export async function unanswered({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 800 });
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  await seedHistory(ws, agent);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/analytics`);
  await page.waitForSelector("tr:has-text('kayaks')", { timeout: 20000 });
  await page.locator("tr:has-text('kayaks')").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector(".page-body")?.scrollBy({ top: 9999 }));
  await act.pause(800);

  await record(page, "unanswered-answer", { crop: ".main", holdEnd: 2400 }, async () => {
    await act.click("tr:has-text('Bukhara') button:has-text('Add answer')");
    await page.waitForSelector("#ak-a");
    await act.type("#ak-a", "Not yet. We have stores in Tashkent and Samarkand, and we deliver to Bukhara in 2 to 4 days.", { delay: 22 });
    await act.click(".dialog-foot .btn-primary");
    await page.waitForSelector("tr:has-text('Bukhara') .badge:has-text('Answer added')", { timeout: 20000 });
    await act.pause(600);
    await act.click("tr:has-text('student') button[aria-label^='Actions for']");
    await act.pause(700);
    await act.click(".popover [role=menuitem]:has-text('Delete question')");
    await act.park();
  });
  await ctx.close();
}
