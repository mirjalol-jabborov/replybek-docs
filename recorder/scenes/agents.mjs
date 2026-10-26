// AI agents: the Agents page, suggested questions, and how an agent answers on a website.
import { newContext, actor, record, APP, PUBLIC } from "../lib.mjs";
import { SITE_URL } from "../site.mjs";
import { agentWithSite } from "../world.mjs";

/** The store's page with the agent's chat, as a visitor sees it. */
export const storePage = (agent, { path = "/", lang, language } = {}) =>
  `${SITE_URL}${path}?widget=${agent.public_key}&api=${encodeURIComponent(`${PUBLIC}/api`)}${lang ? `&lang=${lang}` : ""}${language ? `&language=${language}` : ""}`;

/** The right side of the page: a slice of the store and the open chat. */
export const widgetCrop = (page, width = 520) => {
  const vp = page.viewportSize();
  return { x: vp.width - width, y: 0, width, height: vp.height };
};

export async function openWidget(page, act) {
  await page.waitForSelector("#replybek-widget .launcher", { timeout: 20000 });
  await act.pause(500);
  await act.click("#replybek-widget .launcher");
  await page.waitForSelector("#replybek-widget .panel", { timeout: 10000 });
  await act.pause(500);
}

export async function waitForAnswer(page, count) {
  await page.waitForFunction(
    (n) => {
      const root = document.querySelector("#replybek-widget")?.shadowRoot;
      return root && root.querySelectorAll(".msg.bot").length >= n && !root.querySelector(".typing");
    },
    count,
    { timeout: 60000 }
  );
}

export async function agents({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 760 });
  await agentWithSite(ctx, { publish: true });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/agents`);
  await page.waitForSelector(".agent-create-card");
  await act.pause(700);

  await record(page, "agents-create", { crop: ".main" }, async () => {
    await act.click(".page-head button:has-text('Create agent')");
    await page.waitForSelector("#ca-name");
    await act.type("#ca-name", "Returns Helper");
    await act.type("#ca-purpose", "Answer questions about returns and exchanges, and help customers start a return.", { delay: 22 });
    await act.click(".dialog-foot button:has-text('Continue')");
    await act.click(".choice:has-text('Q&A')");
    await act.type("#ca-q", "Can I return an item I bought on sale?");
    await act.type("#ca-a", "Yes. Sale items can be returned within 30 days like any other item, unworn and with their tags.", { delay: 20 });
    await act.click(".dialog-foot button:has-text('Continue')");
    await act.pause(1200);
    await act.click(".dialog-foot button:has-text('Create agent')");
    await page.waitForSelector(".agent-card:has-text('Returns Helper')", { timeout: 20000 });
    await act.park();
  });

  await record(page, "agents-actions", { crop: ".main" }, async () => {
    await act.click(".agent-card:has-text('Returns Helper') button[aria-label^='Actions for']");
    await act.pause(700);
    await act.click(".popover [role=menuitem]:has-text('Publish')");
    await act.pause(1600);
    await act.type("input[placeholder='Search agents']", "returns");
    await act.pause(900);
    await act.click("[role=radio]:has-text('Published'), button:has-text('Published')");
    await act.park();
  });
  await ctx.close();
}

export async function suggestedQuestions({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 800 });
  await agentWithSite(ctx);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/playground`);
  await page.waitForSelector(".suggestion-editor");
  await page.locator(".suggestion-editor").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector(".suggestion-editor").scrollIntoView({ block: "start" }));
  await act.pause(700);

  await record(page, "suggested-generate", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.click(".suggestion-editor button:has-text('Generate with AI')");
    await page.waitForSelector(".suggestion-generated", { timeout: 60000 });
    await act.pause(1600);
    await act.click(".suggestion-generated button:has-text('Use generated questions')");
    await act.pause(900);
    await act.click(".pg-config button:has-text('Save changes')");
    await act.park();
  });

  await record(page, "suggested-translate", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.click(".suggestion-languages [role=tab]:nth-child(2)");
    await act.pause(800);
    await act.click(".suggestion-editor button:has-text('Translate from')");
    await page.waitForSelector(".suggestion-generated", { timeout: 60000 });
    await act.pause(1500);
    await act.click(".suggestion-generated button:has-text('Use generated questions')");
    await act.pause(900);
    await act.click(".pg-config button:has-text('Save changes')");
    await act.park();
  });
  await ctx.close();
}

export async function howAgentsAnswer({ browser }) {
  const ctx = await newContext(browser, { width: 1100, height: 760 });
  const { agent } = await agentWithSite(ctx, { publish: true });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(storePage(agent));
  await openWidget(page, act);

  await record(page, "answer-sources", { crop: widgetCrop(page) }, async () => {
    await act.type("#replybek-widget input[type=text]", "How much is delivery to Samarkand?");
    await act.press("Enter");
    await waitForAnswer(page, 2);
    await act.pause(800);
    await act.click("#replybek-widget .src-toggle");
    await act.park(1060, 300);
  });

  await record(page, "answer-fallback", { crop: widgetCrop(page) }, async () => {
    await act.type("#replybek-widget input[type=text]", "Do you sell kayaks?");
    await act.press("Enter");
    await waitForAnswer(page, 3);
    await act.park(1060, 300);
  });

  await record(page, "answer-handoff", { crop: widgetCrop(page), holdEnd: 2400 }, async () => {
    await act.type("#replybek-widget input[type=text]", "My new jacket arrived with a torn seam.");
    await act.press("Enter");
    await page.waitForSelector("#replybek-widget .handoff", { timeout: 60000 });
    await act.park(1060, 300);
  });
  await ctx.close();
}
