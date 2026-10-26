// Integrations: set up with AI, build with forms (connection, actions, procedures), test, enable,
// and the agent using the order system in the chat.
import { newContext, actor, record, call, APP } from "../lib.mjs";
import { API_URL, API_KEY } from "../business-api.mjs";
import { agentWithSite, ordersIntegration, ORDER_TOOLS } from "../world.mjs";
import { storePage, widgetCrop, openWidget, waitForAnswer } from "./agents.mjs";

const RETURN_PROCEDURE = {
  name: "return_order",
  description: "Check that an order can be returned, then start the return and book a courier.",
  when: "The customer wants to return something they ordered.",
  input: { type: "object", properties: { order_id: { type: "string", description: "The order number" }, reason: { type: "string", enum: ["wrong_size", "damaged", "changed_mind"] } }, required: ["order_id", "reason"] },
  steps: [
    { id: "order", kind: "action", tool: "get_order", args: { order_id: "{{args.order_id}}" } },
    { id: "can_return", kind: "check", condition: { path: "steps.order.status", op: "not_equals", value: "processing" }, message: "This order hasn't shipped yet, so it can be cancelled instead of returned." },
    { id: "return", kind: "action", tool: "create_return", args: { order_id: "{{args.order_id}}", reason: "{{args.reason}}" } },
  ],
};

async function openBuilder(page, act) {
  await act.click(".page-head button:has-text('Add integration')");
  await page.waitForSelector(".ib-wizard", { timeout: 10000 });
  await act.pause(700);
}

export async function integrationAi({ browser }) {
  const ctx = await newContext(browser, { width: 1320, height: 860 });
  await agentWithSite(ctx);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/integrations`);
  await page.waitForSelector(".page-head button:has-text('Add integration')");
  await act.pause(800);

  await record(page, "integration-ai-plan", { holdEnd: 2200 }, async () => {
    await openBuilder(page, act);
    await act.click(".type-card:has-text('Set up with AI')");
    await act.pause(600);
    await act.type("#ai-doc-url", `${API_URL}/openapi.json`, { delay: 22 });
    await act.type("#ai-doc-goal", "Let customers check where their order is and start a return. We connect with our business API key.", { delay: 16 });
    await page.selectOption("#ai-access-mode", { label: "Server: OAuth or business API key" });
    await act.click("button:has-text('Prepare integration plan')");
    await page.waitForSelector("button:has-text('Generate selected actions')", { timeout: 120000 });
    await act.pause(1500);
    await page.locator("button:has-text('Generate selected actions')").scrollIntoViewIfNeeded();
    await act.park();
  });

  await record(page, "integration-ai-generate", { holdEnd: 2400 }, async () => {
    await act.click("button:has-text('Generate selected actions')");
    await page.waitForSelector("button:has-text('Review connection and actions')", { timeout: 240000 });
    await act.pause(1200);
    await page.locator("button:has-text('Review connection and actions')").scrollIntoViewIfNeeded();
    await act.pause(800);
    await act.click("button:has-text('Review connection and actions')");
    await act.pause(1500);
    await act.park();
  });
  await ctx.close();
}

export async function integrationForms({ browser }) {
  const ctx = await newContext(browser, { width: 1320, height: 860 });
  await agentWithSite(ctx);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/integrations`);
  await page.waitForSelector(".page-head button:has-text('Add integration')");
  await act.pause(800);

  await record(page, "integration-connection", { holdEnd: 2000 }, async () => {
    await openBuilder(page, act);
    await act.click(".type-card:has-text('Build with forms')");
    await act.type("#builder-name", "Northstar orders");
    await act.click(".ib-wizard .dialog-foot button:has-text('Continue'), .dialog-foot button:has-text('Continue')");
    await page.waitForSelector("#connection-url");
    await act.pause(600);
    await act.type("#connection-url", API_URL, { delay: 25 });
    await page.selectOption("#connection-auth", "api_key");
    await act.pause(700);
    await act.type("#api-key", API_KEY, { delay: 25 });
    await act.type("#api-key-header", "X-Api-Key", { clear: true });
    await act.type("#api-key-prefix", "", { clear: true });
    await act.park();
  });

  await record(page, "integration-action", { holdEnd: 2400 }, async () => {
    await act.click(".dialog-foot button:has-text('Continue')");
    await act.pause(700);
    await act.click("button:has-text('Add action')");
    await page.waitForSelector("#te-name");
    await act.type("#te-name", "get_order");
    await act.type("#te-desc", "Look up an order's status, items, delivery date and tracking link.", { delay: 18 });
    const when = page.locator("#te-when");
    if (await when.isVisible()) await act.type(when, "The customer asks where their order is or when it arrives.", { delay: 18 });
    await act.click(".action-layout button:has-text('API')").catch(() => {});
    await act.pause(500);
    await act.click(".action-layout button:has-text('Add data input')");
    const ask = page.locator(".popover [role=menuitem]:has-text('Ask the customer'), .popover button:has-text('Ask the customer')").first();
    if (await ask.count()) await act.click(ask);
    await act.type("[aria-label='Input name']", "order_id");
    await act.type("[aria-label='Input description']", "The order number, like 4127", { delay: 20 });
    await page.locator(".action-layout select").filter({ hasText: "DELETE" }).first().selectOption("GET", { timeout: 5000 });
    await act.type("#te-path", "/orders/{{args.order_id | url}}", { clear: true, delay: 28 });
    await act.pause(800);
    await act.click(".dialog-foot button:has-text('Save action')");
    await act.park();
  });
  await ctx.close();
}

export async function integrationReview({ browser }) {
  const ctx = await newContext(browser, { width: 1320, height: 860 });
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  await ordersIntegration(ctx, ws, agent, { procedures: [RETURN_PROCEDURE], enabled: false });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/integrations`);
  await page.waitForSelector("tr:has-text('Northstar orders')");
  await act.pause(800);

  const openStage = async (name) => {
    await act.click(`.ib-stages button:has-text('${name}')`);
    await act.pause(900);
  };

  await record(page, "integration-procedure", { holdEnd: 2200 }, async () => {
    await act.click("tr:has-text('Northstar orders') button[aria-label^='Actions for']");
    await act.click(".popover [role=menuitem]:has-text('Edit')");
    await page.waitForSelector(".ib-wizard");
    await openStage("Actions");
    await act.pause(800);
    await openStage("Procedures");
    await act.pause(1200);
    const open = page.locator(".ib-main :text('return_order')").first();
    if (await open.count()) await act.click(open);
    await act.pause(1600);
    await act.park();
  });

  await record(page, "integration-test", { holdEnd: 2600 }, async () => {
    await openStage("Test");
    await act.pause(800);
    // The sample inputs come first; the order number goes in its field.
    await act.type(page.locator(".ib-main input:visible").first(), "4127");
    await act.click(".ib-main button:has-text('Run read test')");
    await page.waitForSelector(".ib-test-result", { timeout: 20000 });
    await page.locator(".ib-test-result").scrollIntoViewIfNeeded();
    await act.pause(2500);
    await act.park();
  });

  await record(page, "integration-enable", { holdEnd: 2400 }, async () => {
    await openStage("Review");
    await act.pause(1200);
    await act.click(".dialog-foot button:has-text('Save and enable')");
    await page.waitForSelector("tr:has-text('Northstar orders')", { timeout: 15000 });
    await act.pause(1200);
    await act.click("tr:has-text('Northstar orders') button[aria-label^='Actions for']");
    await act.pause(1200);
    await page.keyboard.press("Escape");
    await act.park();
  });
  await ctx.close();
}

// The message after Confirm sometimes comes back in another language (a known product bug, reported);
// try again until the clip shows the intended English reply.
export async function integrationChat({ browser }) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const english = await integrationChatOnce(browser);
    if (english) return;
    console.log(`  … outcome wasn't in English, recording again (${attempt})`);
  }
  throw new Error("the outcome message never came back in English");
}

async function integrationChatOnce(browser) {
  const ctx = await newContext(browser, { width: 1100, height: 780 });
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  await ordersIntegration(ctx, ws, agent, { procedures: [RETURN_PROCEDURE] });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(storePage(agent));
  await openWidget(page, act);

  await record(page, "action-lookup", { crop: widgetCrop(page) }, async () => {
    await act.type("#replybek-widget input[type=text]", "Where is my order 4127?");
    await act.press("Enter");
    await waitForAnswer(page, 2);
    await act.park(1060, 300);
  });

  await record(page, "action-confirm", { crop: widgetCrop(page), holdEnd: 2600 }, async () => {
    await act.type("#replybek-widget input[type=text]", "The jacket is too small. I'd like to return it.");
    await act.press("Enter");
    await page.waitForSelector("#replybek-widget .card .card-btn:not(.ghost)", { timeout: 90000 });
    await act.pause(1500);
    await act.click("#replybek-widget .card .card-btn:not(.ghost)");
    await waitForAnswer(page, 4).catch(() => {});
    await act.pause(1000);
    await act.park(1060, 300);
  });
  const outcome = await page.evaluate(() => [...document.querySelector("#replybek-widget").shadowRoot.querySelectorAll(".msg.bot .bubble")].map((b) => b.innerText).slice(-2).join(" "));
  await ctx.close();
  void ORDER_TOOLS;
  return /\b(return|pickup|courier)\b/i.test(outcome) && !/[а-яё]|devoluci/i.test(outcome);
}
