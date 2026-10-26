---
title: Procedures
description: A fixed series of actions and checks that always runs in the same order, like checking an order before starting a return.
---

An [action](actions) is one request. A procedure chains up to 12 steps into one job, in the order you set. Use one when a task always takes several calls, or when a later call needs data from an earlier one.

For example, **return an order**:

:::steps
1. **Run action** `get_order`: look up the order.
2. **Check a condition**: the order's status is not "processing". If it is, stop and tell the customer it can be cancelled instead.
3. **Run action** `create_return`: start the return with the reason the customer gave.
:::

@clip integration-procedure | A three-step procedure: look up, check, then change.

## Build a procedure

Open the **Procedures** step and press **Add procedure**.

| Field | What it's for |
| --- | --- |
| Procedure name | A short id, like `return_order`. |
| What it accomplishes | What the whole procedure does. |
| When to use | When the agent should start it. |
| Customer inputs | Values the agent collects before starting, like the order number and the reason. |

Then add steps. Each step either **runs an action** or **checks a condition**:

- In an action step, map its inputs from the procedure's inputs, `{{args.order_id}}`, or from an earlier step's result, `{{steps.order.status}}`.
- A check compares a value: **equals**, **not equals**, **exists**, **greater than** or **less than**. Write the **message** the customer gets when the check fails.

## How a procedure runs

- Steps run in order. Lookups run right away.
- Every step that makes a change still shows the customer its own card and waits for **Confirm**.
- The procedure stops if the customer cancels, a check fails or an action fails. The customer is told why.
- Steps that already finished are not undone. If step 3 fails, steps 1 and 2 still happened, so put changes as late as you can.

## Test it

**Simulate procedure** runs the whole thing against mock responses you write for each step, so you can check every path, including failed checks, without touching your system.
