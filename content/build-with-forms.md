---
title: Build with forms
description: Set up an integration by hand, or import it from cURL, OpenAPI or a Replybek package.
---

Building with forms gives you full control. It suits small APIs and anyone who knows exactly which calls the agent needs.

## Start

:::steps
1. Open **Integrations**, press **Add integration** and choose **Build with forms**.
2. Give it an **Integration name**, like "Shop orders", and pick the **Agent** that will use it. An integration belongs to one agent.
3. Press **Continue** to set up the [connection](connections).
4. Add [actions](actions) one at a time, then [procedures](procedures) if you need them.
5. [Test](testing-integrations), review and enable.
:::

Press **Save draft** at any time to keep your work without enabling it.

## Import a definition

Choose **Import a definition** to start from something you already have. Imports create an editable draft; nothing is run.

| Format | Notes |
| --- | --- |
| cURL | One request, like the ones your API documentation shows. |
| OpenAPI 3.x | JSON or YAML, up to 30 operations. Local references, simple parameters and JSON bodies are supported. |
| Replybek package | A configuration exported from another Replybek workspace. See [Manage integrations](manage-integrations#export-and-import). |

```bash
curl -X GET "https://api.yourshop.uz/orders/4127" \
  -H "X-Api-Key: YOUR_KEY"
```

Paste the definition or choose a file, then review the connection and actions it created.

## Edit as JSON

Every part of the setup is also available as JSON, under **Edit as JSON** in Actions and in the advanced sections. Use it to copy settings between actions, or for options the forms don't show. **Back to the visual editor** returns to the forms.
