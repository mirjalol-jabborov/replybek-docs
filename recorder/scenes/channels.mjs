// Channels: connecting a Telegram bot, and a Telegram chat arriving in the inbox. Telegram itself is
// the local stand-in in ../telegram.mjs.
import { newContext, actor, record, db, APP } from "../lib.mjs";
import { agentWithSite } from "../world.mjs";
import { BOT_TOKEN, customerSays, sent } from "../telegram.mjs";

const until = async (fn, ms = 90000) => {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 250))) if (await fn()) return;
  throw new Error("timed out");
};

export async function telegram({ browser }) {
  // The stand-in bot is the same in every run; a bot held by an earlier run's workspace would refuse to connect.
  await db("DELETE FROM agent_channels WHERE type = 'telegram'");
  const ctx = await newContext(browser, { width: 1320, height: 820 });
  await agentWithSite(ctx, { publish: true });
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
