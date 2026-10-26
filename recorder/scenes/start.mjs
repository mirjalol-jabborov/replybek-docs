// Get started and AI agents: onboarding and the Playground.
import { newContext, actor, record, APP } from "../lib.mjs";
import { SITE_HOST } from "../site.mjs";
import { agentWithSite } from "../world.mjs";

// Build your first AI agent: sign-up lands in onboarding.
export async function onboarding({ browser }) {
  const ctx = await newContext(browser, { width: 1120, height: 720 });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(APP);
  await page.waitForSelector("button:has-text('Create a workspace')");
  await page.waitForTimeout(800);

  await record(page, "signup", {}, async () => {
    await act.click("button:has-text('Create a workspace')");
    await act.type("#au-name", "Dilnoza Karimova");
    await act.type("#au-email", `dilnoza.${Date.now().toString(36)}@northstar.example.com`, { delay: 25 });
    await act.type("#au-pass", "correct horse battery", { delay: 25 });
    await act.type("#au-biz", "Northstar");
    await act.click("button[type=submit]");
    await page.waitForSelector(".onb-hero", { timeout: 20000 });
    await act.pause(1200);
    await act.park();
  });

  await record(page, "onboarding-website", {}, async () => {
    await act.type("#onb-url", SITE_HOST);
    await act.click("button:has-text('Build my agent')");
    await page.waitForSelector("h1:has-text(\"Here's what we found\")", { timeout: 60000 });
    await act.pause(900);
    await act.type("#onb-welcome", "Hi! Ask me about delivery, returns or sizes.", { clear: true });
    await act.park();
  });

  await record(page, "onboarding-train", { holdEnd: 2400 }, async () => {
    await act.click("button:has-text('Create my agent')");
    await page.waitForSelector("h1:has-text('Try your agent')", { timeout: 180000 });
    await act.pause(800);
    await act.type(".owg-input input", "Do you deliver to Samarkand?");
    await act.press("Enter");
    await page.waitForFunction(() => document.querySelectorAll(".owg .bub.ai").length >= 2, null, { timeout: 60000 });
    await act.park();
  });

  await record(page, "onboarding-live", {}, async () => {
    await act.click("button:has-text('Looks good')");
    await page.waitForSelector("h1:has-text('Add the chat to your website')", { timeout: 30000 });
    await act.pause(900);
    await act.click("button:has-text('Copy code')");
    await act.park();
  });
  await ctx.close();
}

export async function playground({ browser }) {
  const ctx = await newContext(browser, { width: 1280, height: 800 });
  await agentWithSite(ctx);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/playground`);
  await page.waitForSelector(".pg-composer");
  await page.waitForTimeout(800);

  await record(page, "playground-test", { crop: ".main" }, async () => {
    await act.type("#pg-input", "Can I exchange a jacket for a bigger size?");
    await act.press("Enter");
    await page.waitForFunction(() => document.querySelectorAll(".tmsg.ai").length >= 2, null, { timeout: 60000 });
    await act.pause(700);
    const sources = page.locator(".tmsg.ai").last().locator("button").first();
    if (await sources.count()) await act.click(sources);
    await act.park();
  });

  await record(page, "playground-instructions", { crop: ".main", holdEnd: 2400 }, async () => {
    await act.click("#pg-ins");
    await page.keyboard.press("Meta+ArrowDown");
    await page.keyboard.type("\n- Keep answers to two sentences.\n- When someone asks about exchanges, mention that they're free.", { delay: 28 });
    await act.pause(500);
    await act.type("#pg-input", "How do exchanges work?");
    await act.press("Enter");
    await page.waitForFunction(() => document.querySelectorAll(".tmsg.ai").length >= 3, null, { timeout: 60000 });
    await act.pause(900);
    await act.click(".pg-config button:has-text('Save changes')");
    await act.park();
  });

  await record(page, "playground-publish", { crop: ".pg-config" , pad: 8 }, async () => {
    await act.click("button:has-text('Publish agent')");
    await act.pause(600);
    await act.park();
  });
  await ctx.close();
}
