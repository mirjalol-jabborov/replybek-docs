// Ready-made states the scenes start from, built through the real API (and SQL for history).
import { call, signUp, sourcesReady, db, API } from "./lib.mjs";
import { SITE_URL } from "./site.mjs";
import { API_URL, API_KEY } from "./business-api.mjs";

/** A workspace with one agent that has learned the Northstar website. */
export async function agentWithSite(ctx, { name = "Northstar Help", publish = false, signup = {} } = {}) {
  const ws = await signUp(ctx, signup);
  const agent = await call(ctx, "POST", `/w/${ws.id}/agents`, { name, purpose: "Answer questions about orders, delivery, returns and sizes." });
  await call(ctx, "POST", `/w/${ws.id}/agents/${agent.id}/sources/website`, { url: SITE_URL, mode: "site", include_paths: [] });
  await sourcesReady(ctx, ws, agent);
  if (publish) Object.assign(agent, await call(ctx, "POST", `/w/${ws.id}/agents/${agent.id}/publish`));
  return { ws, agent };
}

export const ORDER_TOOLS = [
  {
    name: "get_order",
    description: "Look up an order's status, items, delivery date and tracking link by its order number.",
    when: "The customer asks where their order is, when it arrives, or what they ordered.",
    kind: "read",
    input: { type: "object", properties: { order_id: { type: "string", description: "The order number, like 4127" } }, required: ["order_id"] },
    request: { method: "GET", path: "/orders/{{args.order_id | url}}" },
    response: { type: "json", fields: { status: "status", delivery_date: "delivery_date", city: "city", items: "items", tracking_url: "tracking_url" } },
  },
  {
    name: "create_return",
    description: "Start a return for an order and book a courier pickup.",
    when: "The customer wants to return or send back an item.",
    kind: "write",
    input: {
      type: "object",
      properties: { order_id: { type: "string", description: "The order number" }, reason: { type: "string", enum: ["wrong_size", "damaged", "changed_mind"], description: "Why the item goes back" } },
      required: ["order_id", "reason"],
    },
    request: { method: "POST", path: "/returns", body: { order_id: "{{args.order_id}}", reason: "{{args.reason}}" } },
    response: { type: "json", fields: { return_id: "return_id", status: "status", pickup_date: "pickup_date" } },
    confirm: { title: "Return order {{args.order_id}}", lines: ["Reason: {{args.reason}}", "A courier picks it up, 20,000 so'm"] },
  },
  {
    name: "check_stock",
    description: "Check how many items of a product are in stock in each store.",
    kind: "read",
    input: { type: "object", properties: { sku: { type: "string", description: "The product code, like JKT-CHM-L" } }, required: ["sku"] },
    request: { method: "GET", path: "/stock/{{args.sku | url}}" },
    response: { type: "json", fields: { stores: "stores" } },
  },
];

/** The Northstar order system, connected with a business API key, with three actions. */
export async function ordersIntegration(ctx, ws, agent, { procedures = [], enabled = true } = {}) {
  return call(ctx, "POST", `/w/${ws.id}/integrations`, {
    agent_id: agent.id,
    name: "Northstar orders",
    mode: "server",
    base_url: API_URL,
    auth: { type: "api_key", header: "X-Api-Key", prefix: "" },
    client_secret: API_KEY,
    tools: ORDER_TOOLS,
    procedures,
    enabled,
  });
}

/** A website visitor's chat, through the widget's public API. Returns { id, token, messages }. */
export async function visitorChat(ctx, agent, texts, { name, email, page = `${SITE_URL}/returns/` } = {}) {
  const headers = { origin: SITE_URL.replace(/\/$/, "") };
  const start = await ctx.request.post(`${API}/widget/${agent.public_key}/conversations`, { headers, data: Object.fromEntries(Object.entries({ name, email, page }).filter(([, v]) => v)) });
  const conv = await start.json();
  let messages = [];
  for (const text of [].concat(texts)) {
    const r = await ctx.request.post(`${API}/widget/${agent.public_key}/conversations/${conv.conversation_id}/messages`, { headers: { ...headers, "X-Visitor-Token": conv.visitor_token }, data: { text } });
    messages = messages.concat((await r.json()).messages || []);
  }
  return { id: conv.conversation_id, token: conv.visitor_token, messages };
}

export async function askForPerson(ctx, agent, conv) {
  await ctx.request.post(`${API}/widget/${agent.public_key}/conversations/${conv.id}/handoff`, { headers: { "X-Visitor-Token": conv.token }, data: {} });
}

const SUBJECTS = [
  "Where is my order?", "Do you deliver to Bukhara?", "Can I exchange boots for a bigger size?", "How long does delivery take?",
  "Is the Chimgan jacket warm enough for skiing?", "Can I pay with Payme?", "Do you have the Pamir 45 in stock?", "How do returns work?",
  "What are your store hours in Samarkand?", "Can I rent a tent for the weekend?", "Is delivery free in Tashkent?", "Which size should I pick?",
];

/** About two months of past conversations, so Overview and Analytics have something to show. */
export async function seedHistory(ws, agent, { count = 190 } = {}) {
  await db(
    `INSERT INTO conversations (workspace_id, agent_id, status, visitor_token_hash, subject, created_at, last_message_at, escalated_at, resolved_by, unread, visitor)
     SELECT $1, $2, 'resolved', 'seed', ($3::text[])[1 + floor(random() * array_length($3::text[], 1))::int], ts, ts,
            CASE WHEN random() < 0.17 THEN ts END, 'ai', false, '{"name": "Website visitor"}'::jsonb
       FROM (SELECT now() - ((1 + random() * 58) * interval '1 day') - (random() * interval '10 hours') AS ts
               FROM generate_series(1, $4) g
              -- More chats on weekdays, and a little growth over time.
              WHERE random() < 0.8) x
      WHERE extract(isodow FROM ts) < 6 OR random() < 0.6`,
    [ws.id, agent.id, SUBJECTS, count]
  );
  const unanswered = [
    ["Do you sell kayaks?", 6],
    ["Is there a store in Bukhara?", 4],
    ["Can I pick up an online order in Samarkand?", 3],
    ["Do you offer student discounts?", 2],
  ];
  for (const [q, times] of unanswered) {
    await db(
      `INSERT INTO unanswered (workspace_id, agent_id, question, normalized, times, last_asked_at) VALUES ($1, $2, $3, lower($3), $4, now() - interval '5 hours')
       ON CONFLICT (agent_id, normalized) DO UPDATE SET times = EXCLUDED.times`,
      [ws.id, agent.id, q, times]
    );
  }
  await db(`INSERT INTO usage (workspace_id, period, messages) VALUES ($1, to_char(now(), 'YYYY-MM'), 3184) ON CONFLICT (workspace_id, period) DO UPDATE SET messages = 3184`, [ws.id]);
}
