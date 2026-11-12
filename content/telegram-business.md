---
title: Telegram Business
description: Your AI agent answers the customers who write to your own Telegram account, as you.
---

Many customers write to a shop owner's own Telegram, not to a bot. With Telegram Business, your AI agent answers those chats for you. Customers see your account, and every chat lands in your [inbox](inbox) next to the rest.

It runs through your [Telegram bot](telegram), so connect one first. Telegram calls this **Chat Automation**, and it works with or without Telegram Premium.

## Set it up

Open **Channels** in the sidebar, pick the agent at the top, and press **Telegram Business**. The page ticks off each step as it happens:

:::steps
1. **Turn on Secretary Mode for the bot.** In **@BotFather**, send `/mybots`, choose your bot, then open **Bot Settings › Secretary Mode** and turn it on. Older Telegram versions call it **Business Mode**.
2. **Confirm it's your account.** Press **Get the link** and open it in the Telegram account your customers write to, then press **Start**. The link works once, within 30 minutes. If Telegram is on your phone, press **Copy link** and send it to yourself.
3. **Connect the bot to your account.** In Telegram, open **Settings › Telegram Business › Chatbots**, enter your bot's @username, choose which chats it can access, and keep **Manage Messages** on. Without Telegram Premium, the same screen is **Settings › Chat Automation**.
:::

What each step looks like in Telegram:

@clip telegram-business-secretary-mode | Step 1: in @BotFather, Bot Settings, Secretary Mode, Turn on.

@clip telegram-business-start-link | Step 2: open the link in your Telegram and press Start.

@clip telegram-business-chat-automation | Step 3: Settings, Telegram Business, Chatbots, your bot, and Manage Messages on.

In Replybek, press **?** at the top of the page, or **Watch** above the steps, to see these again.

@clip telegram-business-setup | Get the link, open it in your Telegram, add the bot, and the page shows it connected.

The bot writes to you in Telegram after each step, and the card shows **Connected** when it is answering.

:::note
Step 2 is what makes the bot answer for you and nobody else. Anyone can add any bot in their own settings, so Replybek only answers the chats of the account that opened your link.

An account can have one such bot at a time. Connecting yours replaces any other bot in **Chat Automation**.
:::

## When you write yourself

Write in any chat from your phone as usual. Your message goes into the transcript, and the AI agent stops answering in that chat. To let it answer again, open the chat in the inbox and hand it back. See [Take over and hand back](handoff).

Other chats carry on with the AI agent.

## What's different from the bot

- **No greeting or buttons.** The customer is writing to you, so there is no **/start**, no suggested questions and no **Talk to a person** button. Your own greeting and away messages in Telegram still work.
- **Confirm buttons work.** When an action would change something in your system, the customer confirms it with a button, the same as in the bot. See [Actions](actions).
- **24 hours to reply.** Telegram lets the bot write only within 24 hours of the customer's last message. After that, the inbox tells you to write to them from your own Telegram.
- **A draft stays quiet.** While the agent is a draft, it stays out of your chats completely, so customers only hear from you.

## Turn it off

Press **Turn off** on the Telegram Business page. The AI agent stops answering your chats right away. To take the bot off your account completely, also remove it in **Telegram Business › Chatbots**. Disconnecting the Telegram bot turns off Telegram Business too.
