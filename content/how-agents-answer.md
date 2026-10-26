---
title: How agents answer
description: What an agent does with each message: find the right knowledge, answer in the customer's language, and know when to hand off.
---

Every time a customer writes, the agent searches its knowledge for the passages that match the message and the conversation so far. Then it writes an answer from those passages only.

## It answers from your knowledge

The agent uses facts from its knowledge sources and nothing else. It doesn't invent prices, policies, order details or dates, and it never promises refunds, discounts or exceptions on its own. Under each answer, **sources used** shows where the answer came from, with a link to the page.

@clip answer-sources | A visitor asks about delivery. The answer links to the page it came from.

Answers are short, usually under 90 words, unless the customer needs steps. The agent writes in the language the customer used, even if your knowledge is in another language. So one set of documents in English can answer customers in Uzbek and Russian.

## When it doesn't know

If its knowledge doesn't answer the question, the agent replies with its **fallback message**, translated into the customer's language. Replybek also adds the question to your [unanswered questions](unanswered), so you can teach the agent the answer.

@clip answer-fallback | The store doesn't sell kayaks, so the agent says so and offers other help.

Change the fallback message in the [Playground](playground). A good one says what the agent can help with and offers a person.

## When it hands off to a person

With **Offer human handoff** on, the agent passes the conversation to your team when:

- the customer asks for a person, for example "Can I talk to someone?",
- the customer reports a damaged or wrong item,
- your instructions say a teammate must handle something, for example "Refund requests over 1,000,000 so'm go to a teammate".

The agent tells the customer that a teammate will reply, the AI stops answering, and the conversation appears in your [inbox](handoff) as **Needs human**. Customers can also press **Talk to a person** in the chat at any time.

@clip answer-handoff | A damaged item goes straight to the team.

If handoff is off, the agent never promises that a teammate will reply.

## Photos and files

Customers can send a photo or a document with their message. The agent reads it together with the text, for example a photo of a torn seam or a scanned receipt, and answers the same way.

## Actions in your systems

When the agent has [integrations](integrations), it can also look up and change things in your systems, like an order's status or a new return. Lookups happen right away. Every change shows the customer a card with the details and waits for their **Confirm**.

## Safety

- Messages that break the rules, like abuse or attempts to misuse the chat, get a short refusal instead of an answer.
- Text inside your pages, documents and the customer's messages is treated as information, never as instructions. A page that says "ignore your rules" can't change how the agent behaves.
- Every answer is marked as written by AI, and the widget always offers a way to reach a person.

## What counts toward your plan

Each AI reply counts as one AI message toward your monthly allowance. Replies from your team don't count. See [Usage and limits](usage-and-limits).
