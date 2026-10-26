// Records the docs clips. `npm run record` records every scene; `npm run record -- playground knowledge`
// records only the scenes named. Each scene starts from a fresh account, so any clip can be redone alone.
import { startServices, stopServices, closeDb } from "./lib.mjs";
import * as start from "./scenes/start.mjs";
import * as agents from "./scenes/agents.mjs";
import * as knowledge from "./scenes/knowledge.mjs";
import * as widget from "./scenes/widget.mjs";
import * as inbox from "./scenes/inbox.mjs";
import * as stills from "./scenes/stills.mjs";
import * as integrations from "./scenes/integrations.mjs";
import * as insights from "./scenes/insights.mjs";
import * as workspace from "./scenes/workspace.mjs";

const SCENES = Object.fromEntries(Object.entries({ ...start, ...agents, ...knowledge, ...widget, ...inbox, ...stills, ...integrations, ...insights, ...workspace }).filter(([, f]) => typeof f === "function" && f.length === 1 && /^\s*async/.test(String(f))));

const wanted = process.argv.slice(2);
const unknown = wanted.filter((n) => !SCENES[n]);
if (unknown.length) {
  console.error(`Unknown scene(s): ${unknown.join(", ")}. Scenes: ${Object.keys(SCENES).join(", ")}`);
  process.exit(1);
}
const browser = await startServices();
let failed = 0;
for (const name of wanted.length ? wanted : Object.keys(SCENES)) {
  console.log(`● ${name}`);
  try {
    await SCENES[name]({ browser });
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}: ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
await closeDb();
stopServices();
process.exit(failed ? 1 : 0);
