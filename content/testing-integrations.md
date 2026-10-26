---
title: Testing
description: Check every action before customers use it, from a dry run to a live read against your system.
---

The **Test** step lets you try each action with sample inputs. Pick the action, fill in the sample scenario, then choose how to test.

@clip integration-test | A live read test gets order 4127 from the real system.

## Four ways to test

| Test | What it does | Calls your system? |
| --- | --- | --- |
| Preview request | Shows the exact request the action would send. | No |
| Simulate response | Runs your response mapping against a mock response you write, with any HTTP status, including errors. | No |
| Run read test | Sends the real request and shows the response. Lookups (GET) only. | Yes, read-only |
| Browser test | For browser-session connections: a script you run in your own signed-in tab of the system. The test link works once, for 10 minutes. | Yes, read-only |

Changes are never run live from the test step. Simulate them instead, so a test can't create a real order or return. For customer OAuth connections, you can paste a temporary access token for the test; it isn't saved.

:::tip
Use sample data, not real customer records, in tests.
:::

## Review and enable

The **Review** step checks that the integration has a name, a working connection and at least one action, and that the current configuration has been tested. Then press **Save and enable**.

@clip integration-enable | Review the checklist, enable it, and see it in the list.

A simulation checks your mappings and a live read checks the connection. Neither guarantees that every workflow in your system succeeds, so try a few real conversations in the [Playground](playground) after enabling.

If you change the configuration later, earlier test results no longer count, and the integration asks to be tested again.
