---
title: Actions
description: One thing the agent can do in your system, and the request it makes to do it.
---

An action is one API request the agent may make, like "get an order" or "create a return". Open the **Actions** step and press **Add action**. The editor has four sections, with a live preview on the right.

@clip integration-action | Add a lookup action that gets an order by its number.

## General

| Field | What it's for |
| --- | --- |
| Name | A short id the agent uses, in lowercase with underscores, like `get_order`. |
| When to use | When the agent should choose it: "The customer asks where their order is." This is what the agent reads, so be specific. |
| Short description | What it does, for the agent and your team. |
| What it does | **Look up (runs now)** for reads, or **Make a change (needs confirm)** for anything that changes data. |

:::warning
Anything that creates, changes or deletes data must be **Make a change**, even if your API uses a GET or a POST that "only reads". Then the customer always confirms it first.
:::

## API

**Inputs the agent collects** are the values the request needs. For each one, set its name, type, whether it's required, a description, and where the value comes from:

| Source | Meaning |
| --- | --- |
| Ask the customer | The agent gets it from the conversation, like an order number. |
| Signed-in account | A value from the customer's account context, like their customer id. The customer can't change it. |
| Fixed value | Always the same, like a branch code. |
| Previous procedure step | A result from an earlier step, in [procedures](procedures) only. |

Then the **Method** (GET, POST, PUT, PATCH or DELETE) and the **Endpoint path**, with inputs written as `{{args.name}}`:

```text
/orders/{{args.order_id | url}}
```

`| url` makes a value safe to put in the path. Add **Headers** or a JSON **Body** the same way.

## Test action

Preview the exact request without sending it, or simulate a response to check how the agent will read it. See [Testing](testing-integrations).

## Response and confirmation

- **Fields the agent can see**: choose which parts of the response reach the agent. Less is better: it keeps answers focused and private data out of the chat. For lists, map **rows and columns**.
- **Confirmation** (changes only): the card the customer sees before confirming. Write a clear **Confirmation title** like `Return order {{args.order_id}}`, and optional lines and a total.

Responses are limited in size, so a huge table can't flood the conversation. If an action returns too much, narrow the request or the fields.
