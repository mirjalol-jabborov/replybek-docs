// Stills: the emails Replybek sends, rendered by the backend's own templates.
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, CLIPS } from "../lib.mjs";

export async function emails({ browser }) {
  const backend = (f) => pathToFileURL(path.join(ROOT, "replybek-backend/src", f)).href;
  process.env.APP_ORIGIN = "https://app.replybek.uz";
  const { outbox } = await import(backend("lib/mail.js"));
  const mail = await import(backend("services/emails.service.js"));
  const shots = [
    ["email-waiting", () => mail.sendWaiting({ to: "dilnoza@northstar.example.com", lang: "en", visitor: "Aziza Rahimova", workspace: "Northstar Outfitters", message: "Hi! My new Chimgan jacket arrived with a torn seam. Order 4127.", conversationId: "c" })],
    ["email-invite", () => mail.sendInvite({ to: "jasur@northstar.example.com", lang: "en", inviter: "Dilnoza Karimova", workspace: "Northstar Outfitters", role: "agent", token: "t" })],
    ["email-allowance", () => mail.sendAllowanceUsed({ to: "dilnoza@northstar.example.com", lang: "en", workspace: "Northstar Outfitters", limit: 2000, resetsAt: "2026-11-01T00:00:00Z" })],
  ];
  const ctx = await browser.newContext({ viewport: { width: 680, height: 600 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const [name, send] of shots) {
    await send();
    const m = outbox.at(-1);
    await page.setContent(`<body style="margin:0;background:#f4f4f2;font-family:system-ui"><div id="mail" style="padding:28px 0 32px">
      <div style="max-width:600px;margin:0 auto 14px;font:13px/1.5 system-ui;color:#4a4f57"><b style="color:#111215">${m.subject}</b><br>Replybek &lt;no-reply@replybek.uz&gt; · to ${m.to}</div>${m.html}</div></body>`);
    await page.waitForTimeout(300);
    await page.locator("#mail").screenshot({ path: path.join(CLIPS, `${name}.png`) });
    console.log(`  ✓ ${name}.png`);
  }
  await ctx.close();
}
