// Northstar Outfitters' order system, as the integration clips use it: a small REST API with an
// OpenAPI document and a docs page. Recordings show it at https://api.northstar.example.com.
import http from "node:http";

export const API_HOST = "api.northstar.example.com";
export const API_URL = `https://${API_HOST}`;
export const API_KEY = "nst_live_4f9c2a7d1e";

const ORDERS = {
  4127: { id: "4127", status: "shipped", placed_at: "2026-10-22", delivery_date: "2026-10-28", city: "Samarkand", total: "1,250,000 so'm", items: [{ sku: "JKT-CHM-M", name: "Chimgan down jacket", size: "M", qty: 1 }], tracking_url: "https://track.example.com/NS4127" },
  4131: { id: "4131", status: "processing", placed_at: "2026-10-25", delivery_date: "2026-10-29", city: "Tashkent", total: "980,000 so'm", items: [{ sku: "BT-TRL-42", name: "Trail boots", size: "42", qty: 1 }], tracking_url: null },
  4088: { id: "4088", status: "delivered", placed_at: "2026-10-10", delivery_date: "2026-10-13", city: "Tashkent", total: "740,000 so'm", items: [{ sku: "BP-PMR-45", name: "Pamir 45 backpack", size: "M", qty: 1 }], tracking_url: null },
};
const STOCK = { "JKT-CHM-L": { Tashkent: 4, Samarkand: 1 }, "JKT-CHM-M": { Tashkent: 0, Samarkand: 2 }, "BT-TRL-43": { Tashkent: 6, Samarkand: 0 } };
let returnSeq = 310;

export const OPENAPI = {
  openapi: "3.0.3",
  info: { title: "Northstar Orders API", version: "1.4.0", description: "Orders, returns and stock for Northstar Outfitters. Authenticate with your API key in the X-Api-Key header." },
  servers: [{ url: API_URL }],
  components: { securitySchemes: { apiKey: { type: "apiKey", in: "header", name: "X-Api-Key" } } },
  security: [{ apiKey: [] }],
  paths: {
    "/orders/{order_id}": {
      get: {
        operationId: "getOrder",
        summary: "Get an order",
        description: "Status, items, delivery date and tracking link of one order.",
        parameters: [{ name: "order_id", in: "path", required: true, schema: { type: "string" }, description: "The order number, e.g. 4127" }],
        responses: { 200: { description: "The order", content: { "application/json": { example: ORDERS[4127] } } }, 404: { description: "No such order" } },
      },
    },
    "/returns": {
      post: {
        operationId: "createReturn",
        summary: "Start a return",
        description: "Creates a return for an order and books a courier pickup.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["order_id", "reason"], properties: { order_id: { type: "string" }, reason: { type: "string", enum: ["wrong_size", "damaged", "changed_mind"] }, pickup_date: { type: "string", format: "date" } } } } },
        },
        responses: { 201: { description: "Return created", content: { "application/json": { example: { return_id: "R-311", order_id: "4127", status: "pickup_booked", pickup_date: "2026-10-30" } } } } },
      },
    },
    "/stock/{sku}": {
      get: {
        operationId: "getStock",
        summary: "Check stock",
        description: "How many items are in stock in each store.",
        parameters: [{ name: "sku", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Stock by store", content: { "application/json": { example: { sku: "JKT-CHM-L", stores: { Tashkent: 4, Samarkand: 1 } } } } } },
      },
    },
  },
};

const DOCS = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Northstar Orders API</title>
<style>body{font:15px/1.6 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#1d2622}code,pre{background:#f1f3f2;border-radius:4px;padding:2px 5px}pre{padding:12px}</style></head><body>
<h1>Northstar Orders API</h1><p>Base URL: <code>${API_URL}</code>. Send your API key in the <code>X-Api-Key</code> header. The OpenAPI file is at <a href="/openapi.json">/openapi.json</a>.</p>
<h2>GET /orders/{order_id}</h2><p>Returns the status, items, delivery date and tracking link of an order.</p><pre>${JSON.stringify(ORDERS[4127], null, 2)}</pre>
<h2>POST /returns</h2><p>Starts a return and books a courier pickup. Body: <code>order_id</code>, <code>reason</code> (wrong_size, damaged, changed_mind), optional <code>pickup_date</code>.</p>
<h2>GET /stock/{sku}</h2><p>Stock of a product in each store.</p></body></html>`;

/** Starts the API on `port`. Calls are logged so a clip can show what the agent did. */
export function startBusinessApi(port) {
  const calls = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const url = new URL(req.url, API_URL);
      const json = (status, data) => res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*" }).end(JSON.stringify(data));
      if (url.pathname === "/openapi.json") return json(200, OPENAPI);
      if (url.pathname === "/" || url.pathname === "/docs") return res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(DOCS);
      calls.push({ method: req.method, path: url.pathname, body });
      if (req.headers["x-api-key"] !== API_KEY) return json(401, { error: "invalid_api_key", message: "Send a valid X-Api-Key header." });
      const order = url.pathname.match(/^\/orders\/(\w+)$/);
      if (req.method === "GET" && order) return ORDERS[order[1]] ? json(200, ORDERS[order[1]]) : json(404, { error: "not_found", message: `There's no order ${order[1]}.` });
      const stock = url.pathname.match(/^\/stock\/([\w-]+)$/);
      if (req.method === "GET" && stock) return json(200, { sku: stock[1], stores: STOCK[stock[1]] || { Tashkent: 0, Samarkand: 0 } });
      if (req.method === "POST" && url.pathname === "/returns") {
        const input = body ? JSON.parse(body) : {};
        if (!ORDERS[input.order_id]) return json(404, { error: "not_found", message: `There's no order ${input.order_id}.` });
        return json(201, { return_id: `R-${++returnSeq}`, order_id: input.order_id, status: "pickup_booked", pickup_date: input.pickup_date || "2026-10-30" });
      }
      json(404, { error: "not_found" });
    });
  });
  return new Promise((done) => server.listen(port, "127.0.0.1", () => done(Object.assign(server, { calls }))));
}
