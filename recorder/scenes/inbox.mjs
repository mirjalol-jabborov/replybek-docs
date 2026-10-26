// Inbox: views and search, takeover and hand back, replies, notes and files, assigning and resolving.
import { newContext, actor, record, call, APP } from "../lib.mjs";
import { agentWithSite, visitorChat, askForPerson } from "../world.mjs";

/** Adds a teammate who joins through a real invitation. */
export async function addTeammate(browser, ctx, ws, { name = "Jasur Aliev", email = `jasur.${Date.now().toString(36)}@northstar.example.com`, role = "agent" } = {}) {
  const invite = await call(ctx, "POST", `/w/${ws.id}/invites`, { email, role });
  const token = invite.link.split("/invite/")[1];
  const other = await browser.newContext();
  const r = await other.request.post(`${APP}/api/invites/${token}/join`, { data: { name, password: "correct horse battery" } });
  if (!r.ok()) throw new Error(`join failed: ${r.status()} ${await r.text()}`);
  await other.close();
}

/** A few real conversations: one the AI handled, two waiting for a person, one still with the AI. */
export async function busyInbox(browser, ctx) {
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  await addTeammate(browser, ctx, ws);
  await visitorChat(ctx, agent, "How much is delivery to Samarkand?", { name: "Bekzod Tursunov" });
  const seam = await visitorChat(ctx, agent, "Hi! My new Chimgan jacket arrived with a torn seam. Order 4127.", { name: "Aziza Rahimova", email: "aziza@example.com" });
  void seam;
  const bulk = await visitorChat(ctx, agent, "Do you make team jackets with a logo? We need about 20.", { name: "Timur Karimov", email: "timur@example.com" });
  await askForPerson(ctx, agent, bulk);
  await visitorChat(ctx, agent, ["Which size of trail boots should I pick if I wear thick socks?"], { name: "Website visitor" });
  return { ws, agent };
}

export async function inbox({ browser }) {
  const ctx = await newContext(browser, { width: 1320, height: 820 });
  const { ws } = await busyInbox(browser, ctx);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/inbox`);
  await page.waitForSelector(".ib-row");
  await act.pause(900);

  await record(page, "inbox-views", { crop: ".main" }, async () => {
    await act.click("[role=tab]:has-text('Needs human')");
    await act.pause(900);
    await act.click("[role=tab]:has-text('AI')");
    await act.pause(800);
    await act.click("[role=tab]:has-text('All')");
    await act.pause(500);
    await act.type("input[placeholder='Search name or message']", "jacket");
    await act.pause(1000);
    await act.click(".ib-row:has-text('Aziza')");
    await page.waitForSelector(".ib-conv-head");
    await act.pause(800);
    await act.park();
  });

  await record(page, "inbox-takeover", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.click(".takeover-bar button:has-text('Take over')");
    await page.waitForSelector(".handling.paused", { timeout: 10000 });
    await act.pause(600);
    await act.type("#ib-compose", "Hi Aziza, I'm Dilnoza. I'm sorry about the seam! I've booked a free courier pickup for tomorrow, and we'll send a new jacket the same day.", { delay: 16 });
    await act.press("Enter", 1200);
    await act.park();
  });

  await record(page, "inbox-note", { crop: ".main", holdEnd: 2000 }, async () => {
    await act.click(".comp-head [role=tab]:has-text('Internal note')");
    await act.type("#ib-compose", "Order 4127 is in the warehouse system. Jasur, please swap it for size M.", { delay: 18 });
    await act.press("Enter", 1000);
    await act.click(".comp-head [role=tab]:has-text('Reply')");
    await act.park();
  });

  await record(page, "inbox-assign", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.click(".ib-side .select-trigger");
    await act.pause(600);
    await act.click(".popover [role=option]:has-text('Jasur')");
    await act.pause(1300);
    await act.click(".ib-conv-head button[aria-label='Conversation actions']");
    await act.pause(800);
    await act.click(".popover [role=menuitem]:has-text('Hand back to AI')");
    await act.pause(1300);
    await act.click(".ib-side button:has-text('Mark resolved')");
    await page.waitForSelector(".handling.done", { timeout: 10000 });
    await act.pause(600);
    await act.click("[role=tab]:has-text('Resolved')");
    await act.park();
  });

  // Files: the visitor sends a photo; the teammate answers with a PDF.
  await page.goto(`${APP}/#/inbox`);
  await page.waitForSelector(".ib-list");
  await act.click("[role=tab]:has-text('All')");
  await page.locator("input[placeholder='Search name or message']").fill("");
  await act.pause(1500); // let the list settle before clicking a row
  await act.click(".ib-row:has-text('Timur')");
  await page.waitForSelector(".ib-conv-head:has-text('Timur')");
  await act.click(".takeover-bar button:has-text('Take over')");
  await page.waitForSelector(".handling.paused", { timeout: 10000 });
  await act.pause(700);
  await record(page, "inbox-files", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.type("#ib-compose", "Yes! Here's our team jacket catalogue with prices from 10 pieces.", { delay: 18 });
    await act.move("button[aria-label='Attach a file']");
    const pdf = await (async () => {
      const c = await browser.newContext();
      const p = await c.newPage();
      await p.setContent("<h1 style='font-family:sans-serif'>Northstar team jackets</h1><p style='font-family:sans-serif'>From 10 pieces. Embroidered logo included.</p>");
      const b = await p.pdf({ format: "A4" });
      await c.close();
      return b;
    })();
    await page.locator(".composer input[type=file]").setInputFiles({ name: "Northstar team jackets.pdf", mimeType: "application/pdf", buffer: pdf });
    await act.pause(900);
    await act.press("Enter", 1400);
    await act.park();
  });
  await ctx.close();
  void ws;
}
