// Insights: the Overview page and Analytics, over two months of seeded history.
import { newContext, actor, record, call, signUp, APP } from "../lib.mjs";
import { agentWithSite, seedHistory, visitorChat, askForPerson } from "../world.mjs";

export async function overviewPage({ browser }) {
  // A new workspace: the setup checklist.
  {
    const ctx = await newContext(browser, { width: 1280, height: 800 });
    const ws = await signUp(ctx);
    await call(ctx, "POST", `/w/${ws.id}/agents`, { name: "Northstar Help", purpose: "Answer questions about orders, delivery, returns and sizes." });
    const page = await ctx.newPage();
    const act = actor(page);
    await page.goto(`${APP}/#/overview`);
    await page.waitForSelector("text=Get set up");
    await act.pause(800);
    await record(page, "overview-setup", { crop: ".main", holdEnd: 1800 }, async () => {
      await act.move("text=Add knowledge");
      await act.pause(900);
      await act.click(".main button:has-text('Add knowledge')");
      await act.pause(1500);
      await page.keyboard.press("Escape");
      await act.park();
    });
    await ctx.close();
  }

  // A busy workspace: metrics, people waiting and knowledge gaps.
  const ctx = await newContext(browser, { width: 1280, height: 860 });
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  await seedHistory(ws, agent);
  const waiting = await visitorChat(ctx, agent, "Hi! My new Chimgan jacket arrived with a torn seam. Order 4127.", { name: "Aziza Rahimova" });
  void waiting;
  const bulk = await visitorChat(ctx, agent, "Do you make team jackets with a logo? We need about 20.", { name: "Timur Karimov" });
  await askForPerson(ctx, agent, bulk);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/overview`);
  await page.waitForSelector("text=Needs attention");
  await act.pause(1000);

  await record(page, "overview-page", { crop: ".main", holdEnd: 1800 }, async () => {
    await act.move(".metric, .stat").catch(() => {});
    await act.pause(800);
    await act.click("button:has-text('7 days'), [role=radio]:has-text('7 days')");
    await act.pause(1200);
    await act.click("button:has-text('30 days'), [role=radio]:has-text('30 days')");
    await act.pause(800);
    await page.evaluate(() => document.querySelector(".page-body")?.scrollBy({ top: 420, behavior: "smooth" }));
    await act.pause(1600);
    await act.move("text=Knowledge gaps");
    await act.pause(1200);
    await act.park();
  });
  await ctx.close();
}

export async function analytics({ browser }) {
  const ctx = await newContext(browser, { width: 1280, height: 860 });
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  await seedHistory(ws, agent);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/analytics`);
  await page.waitForSelector("text=Conversation volume");
  await act.pause(1000);

  await record(page, "analytics", { crop: ".main", holdEnd: 1800 }, async () => {
    const bars = page.locator(".main svg rect, .main .bar");
    const n = await bars.count();
    for (const i of [Math.floor(n * 0.55), Math.floor(n * 0.8)]) {
      if (n) await act.move(bars.nth(i)).catch(() => {});
      await act.pause(900);
    }
    await act.click("button:has-text('90 days'), [role=radio]:has-text('90 days')");
    await act.pause(1500);
    await act.click("button:has-text('7 days'), [role=radio]:has-text('7 days')");
    await act.pause(1500);
    await act.click("button:has-text('30 days'), [role=radio]:has-text('30 days')");
    await act.pause(800);
    await page.evaluate(() => document.querySelector(".page-body")?.scrollBy({ top: 600, behavior: "smooth" }));
    await act.pause(1500);
    await act.park();
  });
  await ctx.close();
}
