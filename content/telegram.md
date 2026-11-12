---
title: Telegram bot
description: Connect a Telegram bot, and the same AI agent answers your customers in Telegram.
---

Customers who prefer Telegram can write to your bot instead of using your website. The same AI agent answers there, with the same knowledge, actions and handoff, and every chat lands in your [inbox](inbox) next to the website ones.

## Connect a bot

:::steps
1. In Telegram, open **@BotFather** and send `/newbot`. Choose a name and a username for the bot. BotFather replies with a token, like `123456789:AA...`.
2. In Replybek, open **Channels** in the sidebar, pick the agent at the top, and press **Telegram bot**.
3. Paste the token and press **Connect**.
:::

@clip telegram-botfather | In @BotFather: /newbot, a name, a username ending in bot, and the token to copy.

@clip telegram-connect | Paste the token from BotFather, and the bot is connected.

Write to your bot to try it. Replybek also fills in the bot's menu with **/start** and **/operator**, in your customers' languages.

The bot answers only while its agent is **published**. While the agent is a draft, the bot tells customers it isn't answering right now. See [Agents](agents#draft-and-published).

:::note
A bot answers for one workspace. To use it in another one, disconnect it here first, or create a second bot in BotFather.
:::

## The bot's profile and buttons

Once the bot is connected, the same page shows how it looks in Telegram. Change it here instead of in BotFather:

| Setting | Where customers see it |
| --- | --- |
| Photo | The bot's picture in their chat list and in the chat. **Use the widget logo** takes your widget's logo. |
| Name | The chat's title. |
| About | The bot's profile, and next to the link when someone shares it. Up to 120 characters. |
| What can this bot do? | An empty chat, before the customer presses **Start**. Up to 512 characters. |

The bot's @username can only be changed in BotFather.

Under **Buttons under the greeting**, choose what **/start** offers: your **suggested questions**, the **Talk to a person** button, both or neither. Customers can always type instead, and **/operator** works either way.

@clip telegram-bot-settings | Give the bot the store's logo, write its profile, and turn off the question buttons.

:::note
Telegram limits how often a bot's profile can change. If it asks you to wait, Replybek tells you for how long.
:::

## What customers get

- **A greeting.** **/start** shows your welcome message, with your [suggested questions](suggested-questions) as buttons to tap, if you keep them on.
- **Their own language.** The bot's buttons and notes follow the language of the customer's Telegram app, in the same 16 languages as the [widget](widget-languages). The agent answers in whatever language they write in.
- **One answer to several messages.** People often send a few short messages in a row. The bot waits a moment and answers them together.
- **Photos and files.** Photos, PDFs and other documents up to 10 MB, the same as in the widget. Stickers, voice messages and locations get a short note saying the bot can't read them.
- **Confirm buttons.** When an action would change something in your system, the customer confirms it with a button, as in the widget. See [Actions](actions).
- **A person when they need one.** The **Talk to a person** button or the **/operator** command hands the chat to your team. See [Take over and hand back](handoff).

The bot answers one-to-one chats only, not groups.

## In the inbox

Telegram chats show **Telegram bot** as the channel, with the customer's Telegram name and @username. Take over and reply as usual. Your reply goes to the customer's Telegram. If the bot has been disconnected, the reply box tells you the customer won't get your reply.

@clip telegram-inbox | A customer writes to the bot in Uzbek, the agent answers, and the chat is in the inbox.

## Disconnect

Press **Disconnect** on the Telegram bot page. The bot stops answering right away, and conversations already in the inbox stay. If the token is revoked in BotFather, the bot shows as **Disconnected**. Paste a new token to connect it again.

## Answer from your own account

Customers who write to your personal Telegram, not to the bot, can be answered too. See [Telegram Business](telegram-business).

## Website only

Actions that run inside your own system's browser session work in the website widget only. Everything else works in Telegram too.
