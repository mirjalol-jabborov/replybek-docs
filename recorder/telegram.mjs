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
// The bot's profile, as set from the dashboard.
const profile = { name: BOT.first_name, description: "", short_description: "", photo: null };

/** Any update, as Telegram would deliver it: a Telegram Business connection or message, say. */
export function pushUpdate(update) {
  updates.push({ update_id: nextUpdate++, ...update });
  for (const wake of waiting) wake();
}
/** The next message id, for updates built by hand. */
export const newMessageId = () => nextMessage++;

/** A customer writes to the bot. */
export function customerSays(text, { chatId = 5100000001, first = "Dilshod", last = "Rahimov", username = "dilshod_r", language = "uz" } = {}) {
  const from = { id: chatId, is_bot: false, first_name: first, last_name: last, username, language_code: language };
  updates.push({ update_id: nextUpdate++, message: { message_id: nextMessage++, date: Math.floor(Date.now() / 1000), chat: { id: chatId, type: "private", first_name: first, username }, from, text } });
  for (const wake of waiting) wake();
}

export function startTelegram(port) {
  const server = http.createServer((req, res) => {
    let raw;
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", async () => {
      const buf = Buffer.concat(chunks);
      raw = buf.toString("latin1");
      const file = req.url.match(/^\/file\/bot[^/]+\/(.+)$/);
      if (file) return profile.photo ? res.writeHead(200, { "content-type": "image/jpeg" }).end(profile.photo) : res.writeHead(404).end();
      const [, token, method] = req.url.match(/^\/bot([^/]+)\/(\w+)/) || [];
      const multipart = /multipart/.test(req.headers["content-type"] || "");
      const body = multipart || !raw ? {} : JSON.parse(buf.toString("utf8"));
      const reply = (result) => res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, result }));
      if (token !== BOT_TOKEN) return res.writeHead(401, { "content-type": "application/json" }).end(JSON.stringify({ ok: false, error_code: 401, description: "Unauthorized" }));
      if (method === "getMe") return reply({ ...BOT, first_name: profile.name, can_connect_to_business: true });
      if (method === "setMyName") return (profile.name = body.name || BOT.first_name), reply(true);
      if (method === "getMyDescription") return reply({ description: profile.description });
      if (method === "setMyDescription") return (profile.description = body.description || ""), reply(true);
      if (method === "getMyShortDescription") return reply({ short_description: profile.short_description });
      if (method === "setMyShortDescription") return (profile.short_description = body.short_description || ""), reply(true);
      if (method === "removeMyProfilePhoto") return (profile.photo = null), reply(true);
      if (method === "setMyProfilePhoto") {
        // The JPEG inside the multipart body: from its start marker to its end marker.
        const start = buf.indexOf("\xff\xd8", 0, "latin1");
        const end = buf.lastIndexOf("\xff\xd9", undefined, "latin1");
        profile.photo = start >= 0 && end > start ? buf.subarray(start, end + 2) : null;
        return reply(true);
      }
      if (method === "getUserProfilePhotos") return reply({ total_count: profile.photo ? 1 : 0, photos: profile.photo ? [[{ file_id: "photo", width: 640, height: 640 }]] : [] });
      if (method === "getFile") return reply({ file_id: body.file_id, file_path: "photos/photo.jpg" });
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
