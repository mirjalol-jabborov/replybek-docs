---
title: Integrations
description: Connect your own systems so the AI agent can look things up and make changes for customers, always with their confirmation.
---

With an integration, your agent does more than answer. It can check an order's status in your system, look up stock, or start a return. You describe your system's API once, and the agent uses it in the chat.

@clip action-lookup | A customer asks about their order. The agent looks it up in the shop's order system.

Replybek works with any system that has an HTTP API: an online shop, an ERP or CRM, or your own backend. Nothing is built for one vendor; every integration is configuration you can see and edit.

## Lookups and changes

Each thing the agent can do is an **action**. There are two kinds:

| Kind | Example | What happens |
| --- | --- | --- |
| Look up | Get an order's status, check stock | Runs right away while the agent answers. |
| Make a change | Start a return, place an order | The customer sees a card with the details and must press **Confirm**. Nothing changes until they do. |

@clip action-confirm | A change needs the customer's Confirm. The agent then reports what happened.

For workflows that always take several steps in the same order, use a [procedure](procedures).

## How to set one up

Open **Integrations** in the sidebar and press **Add integration**. The setup has six steps: **Start**, **Connection**, **Actions**, **Procedures**, **Test** and **Review**. There are three ways to start:

:::cards
- [Set up with AI](integration-with-ai): Give it your API documentation. AI proposes the connection and actions for you to review.
- [Build with forms](build-with-forms): Describe the connection and add actions one at a time.
- [Import a definition](build-with-forms#import-a-definition): Start from a cURL command, an OpenAPI file or an exported Replybek package.
:::

Then:

:::steps
1. Choose how Replybek [connects](connections) to your system.
2. Review the [actions](actions), and add [procedures](procedures) if you need them.
3. [Test](testing-integrations) with sample data.
4. **Save and enable**. The agent can use it from its next answer.
:::

Only workspace owners and admins can manage integrations.

## Safety by design

- Every change waits for the customer's **Confirm** on a card that shows exactly what will happen.
- The agent sees only the response fields you choose to show it, and big responses are cut to size.
- Credentials are stored encrypted and never shown to the AI or the customer.
- Values like the signed-in customer's account id come from your system, not from the chat, so a customer can't ask for someone else's data.
