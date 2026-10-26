---
title: Manage integrations
description: Turn integrations on and off, edit, export and delete them.
---

The **Integrations** page lists every integration with its agent, how many lookups and changes it has, how many customers are signed in through it, and its status.

| Status | Meaning |
| --- | --- |
| Disabled | Saved as a draft or turned off. The agent doesn't use it. |
| Needs actions | It has no actions yet. |
| Needs testing | The current configuration hasn't been tested. |
| Simulation passed | A simulated test passed. |
| Read test passed | A live read test passed. |

Filter by **All integrations**, **Enabled** or **Drafts**, or search by name.

## The ⋯ menu

- **Edit** opens the setup at any step.
- **Turn off** stops the agent using it right away, and **Turn on** brings it back.
- **Export configuration** downloads it as a Replybek package.
- **Delete integration** removes it for good.

## Export and import

An exported package contains the connection settings, actions and procedures, so you can copy an integration to another workspace or keep a backup. It never contains stored credentials, customer sign-ins or test results. Fixed values and custom header values are cleared too.

To use a package, choose **Import a definition** when adding an integration. Then reconnect your credentials, review the actions and test before enabling.

## Changing a live integration

Saving changes as a draft turns the integration off until you enable it again, so customers never use half-finished settings. Changing the connection also signs out customers who were signed in through it.

:::warning After a timeout
If a change action times out, the result in your system is unknown: it may or may not have happened. Check it in your system before trying again.
:::
