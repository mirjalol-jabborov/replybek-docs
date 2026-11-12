// A stand-in for the Telegram Bot API, so the Telegram clips need no real bot. The API polls it for
// updates (TELEGRAM_POLLING), a scene puts customer messages in with `customerSays`, and whatever
// the bot sends back is kept in `sent`.
import http from "node:http";

export const BOT = { id: 7400000001, is_bot: true, first_name: "Northstar Outfitters", username: "northstar_help_bot" };
export const BOT_TOKEN = "7400000001:AAH3kq9Zt2-docs-northstar-help";
export const sent = [];
const updates = [];
let nextUpdate = 1;
let nextMessage = 1;
const waiting = new Set();

/** A customer writes to the bot. */
export function customerSays(text, { chatId = 5100000001, first = "Dilshod", last = "Rahimov", username = "dilshod_r", language = "uz" } = {}) {
  const from = { id: chatId, is_bot: false, first_name: first, last_name: last, username, language_code: language };
  updates.push({ update_id: nextUpdate++, message: { message_id: nextMessage++, date: Math.floor(Date.now() / 1000), chat: { id: chatId, type: "private", first_name: first, username }, from, text } });
  for (const wake of waiting) wake();
}

export function startTelegram(port) {
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", async () => {
      const [, token, method] = req.url.match(/^\/bot([^/]+)\/(\w+)/) || [];
      const body = raw ? JSON.parse(raw) : {};
      const reply = (result) => res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, result }));
      if (token !== BOT_TOKEN) return res.writeHead(401, { "content-type": "application/json" }).end(JSON.stringify({ ok: false, error_code: 401, description: "Unauthorized" }));
      if (method === "getMe") return reply(BOT);
      if (method === "getUpdates") {
        const ready = () => updates.filter((u) => u.update_id >= (body.offset || 0));
        if (!ready().length) {
          // Long polling, kept short so a stopped scene doesn't hang on it.
          await new Promise((done) => {
            const wake = () => (waiting.delete(wake), done());
            waiting.add(wake);
            setTimeout(wake, Math.min(body.timeout || 0, 2) * 1000);
          });
        }
        return reply(ready());
      }
      if (["sendMessage", "editMessageText", "editMessageReplyMarkup"].includes(method)) {
        if (method === "sendMessage") sent.push(body);
        return reply({ message_id: nextMessage++, date: Math.floor(Date.now() / 1000), chat: { id: body.chat_id, type: "private" }, text: body.text });
      }
      // setMyCommands, deleteWebhook, sendChatAction, answerCallbackQuery and the rest: accepted.
      return reply(true);
    });
  });
  return new Promise((done) => server.listen(port, "127.0.0.1", () => done(server)));
}
