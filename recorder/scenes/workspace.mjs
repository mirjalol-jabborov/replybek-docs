// Workspace: settings, team, plans and billing, usage limits, and your account.
import { newContext, actor, record, call, signUp, db, setBilling, polarSubscribed, APP } from "../lib.mjs";
import { agentWithSite } from "../world.mjs";
import { addTeammate } from "./inbox.mjs";

const settingsTab = async (page, act, name) => {
  await act.click(`.vtabs [role=tab]:has-text('${name}')`);
  await act.pause(700);
};

export async function workspaceSettings({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 780 });
  await signUp(ctx);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/settings/workspace`);
  await page.waitForSelector("#ws-name");
  await act.pause(800);

  await record(page, "workspace-settings", { crop: ".main", holdEnd: 2000 }, async () => {
    await act.type("#ws-site", "northstar.example.com", { clear: true });
    await act.click("#ws-tz");
    await page.keyboard.type("tash", { delay: 90 });
    await act.pause(700);
    await act.press("Enter", 600);
    await act.click(".unsaved-bar button:has-text('Save changes')");
    await act.park();
  });
  await ctx.close();
}

export async function team({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 780 });
  const ws = await signUp(ctx);
  await addTeammate(browser, ctx, ws);
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/settings/team`);
  await page.waitForSelector("button:has-text('Invite teammate')");
  await act.pause(800);

  await record(page, "team-invite", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.click("button:has-text('Invite teammate')");
    await page.waitForSelector("#inv-email");
    await act.type("#inv-email", "malika@northstar.example.com");
    await act.click("#inv-role");
    await act.pause(700);
    await act.click("[role=option]:has-text('Admin')");
    await act.click(".dialog-foot .btn-primary");
    await page.waitForSelector("td:has-text('malika@northstar.example.com')", { timeout: 15000 });
    await act.park();
  });

  await record(page, "team-roles", { crop: ".main", holdEnd: 2000 }, async () => {
    await act.click("tr:has-text('malika') button:has-text('Resend')");
    await act.pause(1600);
    await act.click("tr:has-text('Jasur') button[aria-label^='Actions for']");
    await act.pause(1400);
    await page.keyboard.press("Escape");
    await act.park();
  });
  await ctx.close();

  // The invited person joins from the link in their email.
  const inviter = await newContext(browser, { width: 1240, height: 780 });
  const ws2 = await signUp(inviter);
  const invite = await call(inviter, "POST", `/w/${ws2.id}/invites`, { email: `malika.${Date.now().toString(36)}@northstar.example.com`, role: "agent" });
  const guest = await newContext(browser, { width: 1120, height: 720 });
  const gpage = await guest.newPage();
  const gact = actor(gpage);
  await gpage.goto(invite.link.replace(/^https?:\/\/[^/]+/, APP));
  await gpage.waitForSelector("button:has-text('Join'), button:has-text('Create account'), #jn-name, input[autocomplete='name']", { timeout: 15000 }).catch(() => {});
  await gact.pause(900);
  await record(gpage, "team-join", { holdEnd: 2000 }, async () => {
    const name = gpage.locator("input[autocomplete='name'], #jn-name, input[type=text]").first();
    await gact.type(name, "Malika Yusupova");
    await gact.type(gpage.locator("input[type=password]").first(), "correct horse battery", { delay: 25 });
    await gact.click(gpage.locator("button[type=submit]").first());
    await gpage.waitForSelector(".shell", { timeout: 20000 });
    await gact.pause(1200);
    await gact.park();
  });
  await guest.close();
  await inviter.close();
}

export async function plansAndBilling({ browser }) {
  await setBilling(true);
  try {
    const ctx = await newContext(browser, { width: 1240, height: 820 });
    // Like a real owner: the first agent is built during onboarding, before the trial.
    const { ws } = await agentWithSite(ctx, { publish: true, signup: { onboarded: false } });
    await call(ctx, "POST", `/w/${ws.id}/onboarding/complete`, { website: "northstar.example.com" });
    const page = await ctx.newPage();
    const act = actor(page);
    await page.goto(`${APP}/#/overview`);
    await page.waitForSelector(".billing-banner");
    await act.pause(900);

    await record(page, "billing-trial", { crop: ".main", holdEnd: 2200 }, async () => {
      await act.click(".billing-banner button:has-text('Start free trial')");
      await page.waitForSelector(".plans");
      await act.pause(900);
      await act.click(".plan:has-text('Growth') button:has-text('Start free trial')");
      await page.waitForSelector("[role=dialog]");
      await act.pause(1600);
      await act.park();
    });
    await page.keyboard.press("Escape");

    // The owner adds a card on Polar; Polar's webhook starts the trial.
    await call(ctx, "POST", `/w/${ws.id}/billing/checkout`, { plan: "growth" });
    await polarSubscribed(ws.id, { status: "trialing", plan: "growth" });
    await page.goto(`${APP}/#/settings/billing`);
    await page.reload();
    await page.waitForSelector(".plans");
    await act.pause(900);

    await record(page, "billing-active", { crop: ".main", holdEnd: 2400 }, async () => {
      await act.move(".badge:has-text('Free trial')");
      await act.pause(1200);
      await act.click(".plan:has-text('Business') button");
      await page.waitForSelector("[role=dialog]");
      await act.pause(1500);
      await act.click("[role=dialog] .btn-primary");
      await page.waitForSelector(".plan:has-text('Business') .badge:has-text('Current plan')", { timeout: 15000 });
      await act.pause(800);
      await act.park();
    });
    await ctx.close();
  } finally {
    await setBilling(false);
  }
}

export async function usageLimits({ browser }) {
  const ctx = await newContext(browser, { width: 1240, height: 800 });
  const { ws } = await agentWithSite(ctx, { publish: true });
  await call(ctx, "PATCH", `/w/${ws.id}/plan`, { plan: "starter" });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/agents`);
  await page.waitForSelector(".agent-card");
  await act.pause(800);

  await record(page, "limit-agents", { crop: ".main", holdEnd: 2200 }, async () => {
    await act.click(".page-head button:has-text('Create agent')");
    await page.waitForSelector("[role=dialog]:has-text('Agent limit reached')");
    await act.pause(1500);
    await act.click("[role=dialog] button:has-text('See plans')");
    await page.waitForSelector(".usage-grid");
    await act.pause(900);
    await act.move(".usage-grid");
    await act.park();
  });

  await db(`INSERT INTO usage (workspace_id, period, messages) VALUES ($1, to_char(now(), 'YYYY-MM'), 2000) ON CONFLICT (workspace_id, period) DO UPDATE SET messages = 2000`, [ws.id]);
  await page.goto(`${APP}/#/overview`);
  await page.reload();
  await page.waitForSelector(".billing-banner");
  await act.pause(800);
  await record(page, "limit-messages", { crop: ".main", holdEnd: 2000 }, async () => {
    await act.move(".billing-banner");
    await act.pause(1500);
    await act.click(".billing-banner button:has-text('See plans')");
    await page.waitForSelector(".plans");
    await act.pause(1000);
    await act.park();
  });
  await ctx.close();
}

export async function account({ browser }) {
  {
    const ctx = await newContext(browser, { width: 1120, height: 720 });
    const page = await ctx.newPage();
    const act = actor(page);
    await page.goto(APP);
    await page.waitForSelector("text=Forgot password?");
    await act.pause(900);
    await record(page, "account-reset", { holdEnd: 2000 }, async () => {
      await act.click("text=Forgot password?");
      await act.pause(700);
      await act.type(page.locator("input[type=email]").first(), "dilnoza@northstar.example.com", { delay: 30 });
      await act.click(page.locator("button[type=submit]").first());
      await act.pause(1800);
      await act.park();
    });
    await ctx.close();
  }

  const ctx = await newContext(browser, { width: 1240, height: 780 });
  await agentWithSite(ctx, { publish: true });
  const page = await ctx.newPage();
  const act = actor(page);
  await page.goto(`${APP}/#/overview`);
  await page.waitForSelector(".user-trigger");
  await act.pause(800);

  await record(page, "account-search", { holdEnd: 1800 }, async () => {
    await act.click("button:has-text('Quick search')");
    await act.pause(600);
    await page.keyboard.type("inbox", { delay: 110 });
    await act.pause(800);
    await act.press("Enter", 1200);
    await act.park();
  });

  await record(page, "account-language", { holdEnd: 2200 }, async () => {
    await act.click(".user-trigger");
    await act.pause(800);
    await act.click(".popover [role=menuitem]:has-text('O‘zbekcha'), .popover [role=menuitemradio]:has-text('O‘zbekcha')");
    await act.pause(1800);
    await act.click(".user-trigger");
    await act.pause(700);
    await act.click(".popover [role=menuitem]:has-text('Русский'), .popover [role=menuitemradio]:has-text('Русский')");
    await act.pause(1500);
    await act.click(".user-trigger");
    await act.pause(600);
    await act.click(".popover [role=menuitem]:has-text('English'), .popover [role=menuitemradio]:has-text('English')");
    await act.park();
  });

  await record(page, "account-theme", { holdEnd: 1800 }, async () => {
    await act.click(".user-trigger");
    await act.pause(700);
    await act.click(".popover [role=menuitem]:has-text('Dark'), .popover [role=menuitemradio]:has-text('Dark')");
    await act.pause(1800);
    await act.click(".user-trigger");
    await act.pause(600);
    await act.click(".popover [role=menuitem]:has-text('Light'), .popover [role=menuitemradio]:has-text('Light')");
    await act.park();
  });
  await ctx.close();
}
