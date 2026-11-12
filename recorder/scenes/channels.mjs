// Channels: connecting a Telegram bot, and a Telegram chat arriving in the inbox. Telegram itself is
// the local stand-in in ../telegram.mjs.
import { newContext, actor, record, db, call, APP } from "../lib.mjs";
import { agentWithSite } from "../world.mjs";
import { BOT_TOKEN, customerSays, sent, pushUpdate, newMessageId } from "../telegram.mjs";

const until = async (fn, ms = 90000) => {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 250))) if (await fn()) return;
  throw new Error("timed out");
};

export async function telegram({ browser }) {
  // The stand-in bot is the same in every run; a bot held by an earlier run's workspace would refuse to connect.
  await db("DELETE FROM agent_channels WHERE type = 'telegram'");
  const ctx = await newContext(browser, { width: 1320, height: 820 });
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  // The store's logo on the widget, which the bot can take as its photo.
  const logo = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256"><rect width="64" height="64" fill="#1f3d36"/><path d="M14 46 28 20l8 14 5-8 9 20z" fill="#e9f1ec"/><circle cx="45" cy="17" r="4" fill="#f2c14e"/></svg>').toString("base64")}`;
  await call(ctx, "PATCH", `/w/${ws.id}/agents/${agent.id}`, { widget: { ...agent.widget, logo } });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/channels`);
  await page.waitForSelector(".channel-card");
  await act.pause(800);

  await record(page, "telegram-connect", { crop: ".main", holdEnd: 2400 }, async () => {
    await act.move(".channel-card:has-text('Website widget')");
    await act.pause(500);
    await act.click(".channel-card:has-text('Telegram bot')");
    await page.waitForSelector("#telegram-token");
    await act.pause(900);
    await act.type("#telegram-token", BOT_TOKEN, { delay: 18 });
    await act.click("button:has-text('Connect')");
    await page.waitForSelector(".channel-detail strong:has-text('@northstar_help_bot')", { timeout: 20000 });
    await act.pause(600);
    await act.park();
  });

  // The bot's photo, profile texts and greeting buttons, from the dashboard.
  await page.waitForSelector("#bot-name");
  await act.pause(600);
  await record(page, "telegram-bot-settings", { crop: ".main", holdEnd: 2400 }, async () => {
    await act.click("button:has-text('Use the widget logo')");
    await act.pause(700);
    await act.type("#bot-about", "Orders, delivery, returns and sizes", { delay: 26 });
    await act.type("#bot-description", "Ask about your order, delivery or returns. We answer in Uzbek, Russian and English.", { delay: 18 });
    await act.click("label[for=bot-suggestions]");
    await act.pause(500);
    await act.click("button:has-text('Save changes')");
    await page.waitForSelector("text=Bot updated", { timeout: 20000 });
    await act.pause(800);
    await act.park();
  });

  // A customer writes a couple of messages in a row; the agent answers them together.
  await page.goto(`${APP}/#/inbox`);
  await page.waitForSelector(".ib-conv");
  await act.pause(900);
  const before = sent.length;
  await record(page, "telegram-inbox", { crop: ".main", holdEnd: 2600 }, async () => {
    customerSays("Salom!");
    customerSays("Samarqandga yetkazib berasizlarmi? Qancha turadi?");
    await page.waitForSelector(".ib-row:has-text('Dilshod')", { timeout: 20000 });
    await act.pause(600);
    await act.click(".ib-row:has-text('Dilshod')");
    await until(() => sent.length > before);
    await act.pause(1600);
    await act.move("dd:has-text('Telegram bot')");
    await act.pause(1200);
    await act.park();
  });
  await ctx.close();
}

// Telegram Business on the same bot: the owner's one-time link and the bot added in Telegram, each
// step ticking over on the page as it happens (Telegram's side comes from the stand-in).
export async function telegramBusiness({ browser }) {
  await db("DELETE FROM agent_channels WHERE type = 'telegram'");
  const ctx = await newContext(browser, { width: 1320, height: 820 });
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  await call(ctx, "POST", `/w/${ws.id}/agents/${agent.id}/channels/telegram`, { bot_token: BOT_TOKEN });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/channels/telegram-business`);
  await page.waitForSelector(".setup-steps");
  await act.pause(800);
  const owner = { id: 5200000001, is_bot: false, first_name: "Madina", last_name: "Karimova", username: "northstar_madina", language_code: "en" };
  await record(page, "telegram-business-setup", { crop: ".main", holdEnd: 2600 }, async () => {
    await act.move(".setup-step:nth-child(1)");
    await act.pause(700);
    await act.click(".setup-step:nth-child(2) button.btn-primary");
    const link = await page.waitForSelector(".setup-step a.btn");
    await act.move(".setup-step a.btn");
    await act.pause(900);
    // The owner opens the link in their Telegram and presses Start.
    const code = (await link.getAttribute("href")).split("start=")[1];
    pushUpdate({ message: { message_id: newMessageId(), date: Math.floor(Date.now() / 1000), chat: { id: owner.id, type: "private", first_name: owner.first_name }, from: owner, text: `/start ${code}` } });
    await page.waitForSelector(".setup-step:nth-child(2).done", { timeout: 20000 });
    await act.pause(1000);
    // Then adds the bot under Settings > Telegram Business > Chatbots.
    pushUpdate({ business_connection: { id: "docs-business", user: owner, user_chat_id: owner.id, date: Math.floor(Date.now() / 1000), is_enabled: true, rights: { can_reply: true } } });
    await page.waitForSelector(".setup-step:nth-child(3).done", { timeout: 20000 });
    await act.pause(700);
    await act.move(".channel-detail .callout");
    await act.pause(800);
    await act.park();
  });
  await ctx.close();
}

// The walkthroughs "?" shows on the Telegram pages, one clip per step: what to tap inside Telegram.
export async function telegramGuides({ browser }) {
  await db("DELETE FROM agent_channels WHERE type = 'telegram'");
  const ctx = await newContext(browser, { width: 1320, height: 900 });
  const { ws, agent } = await agentWithSite(ctx, { publish: true });
  await call(ctx, "POST", `/w/${ws.id}/agents/${agent.id}/channels/telegram`, { bot_token: BOT_TOKEN });
  const page = await ctx.newPage();
  const act = actor(page);
  // Each step plays once from its first screen; the times are the sums of its screens.
  const play = async (url, steps) => {
    await page.goto(`${APP}/#/${url}`);
    await page.waitForTimeout(1200);
    await page.click(".workspace-bar-actions button[aria-label]:last-child");
    await page.waitForSelector(".tg-guide");
    // A video can't be paused from inside it, so the player's own controls stay out of the picture.
    await page.addStyleTag({ content: ".tg-guide-controls { visibility: hidden }" });
    for (const [i, name, ms] of steps) {
      await page.click(`.tg-guide-steps li:nth-child(${i + 1}) button`);
      await page.waitForTimeout(200);
      await record(page, name, { crop: ".tg-guide-stage", pad: 8, holdStart: 200, holdEnd: 300 }, async () => {
        await page.click(`.tg-guide-steps li:nth-child(${i + 1}) button`);
        await page.waitForTimeout(ms);
      });
    }
    await page.keyboard.press("Escape");
  };
  await play("channels/telegram-business", [
    [0, "telegram-business-secretary-mode", 10700],
    [1, "telegram-business-start-link", 5500],
    [2, "telegram-business-chat-automation", 12600],
  ]);
  await play("channels/telegram", [[0, "telegram-botfather", 10100]]);

  await ctx.close();
}
