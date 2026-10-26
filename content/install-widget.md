---
title: Install the widget
nav: Install the widget
description: Add your AI agent's chat to your website with one line of code, and choose which sites may show it.
---

The widget is the chat window on your website. Each agent has its own widget, with its own code.

## Copy the code

Open **Website widget** in the sidebar, pick the agent at the top, and scroll to **Install**. Press **Copy code**. You can also open it from the agent's **⋯** menu, under **Install widget**.

```html
<script src="https://app.replybek.uz/api/widget.js"
  data-key="pk_your_agent_key"
  data-api="https://app.replybek.uz/api"
  defer></script>
```

Paste it just before the closing `</body>` tag on every page where the chat should appear. Most sites have one shared footer or layout file, so you paste it once.

@clip widget-install | Copy the code, and allow only your own website to load it.

:::note
The widget answers only when its agent is **published**. A draft agent's widget doesn't answer visitors. See [Agents](agents#draft-and-published).
:::

## Where to paste it

| Your site | Where the code goes |
| --- | --- |
| Your own code | The shared layout or footer template, before `</body>`. |
| WordPress | A plugin for header and footer code, in the footer section. Or your theme's `footer.php`. |
| Tilda | An **HTML block** (T123) on each page, or the site's settings for code before `</body>`. |
| Shopify | **Online Store › Themes › Edit code**, in `theme.liquid`, before `</body>`. |
| Wix, Webflow and others | Their **custom code** setting, placed at the end of the body. |

If you're not sure, send the code to whoever manages your site. It doesn't change anything else on the page.

## Allowed websites

By default, any website can load your widget. To make sure only yours can, add your address under **Allowed websites**, like `https://yourshop.uz`, and press **Save changes**. Add each address separately if the chat runs on more than one site, for example your shop and your help center.

## Choose the language

The widget speaks Uzbek, Russian and English. To fix the language instead of following your site and the visitor's browser, add `data-language="uz"`, `"ru"` or `"en"` to the code. See [Widget languages](widget-languages).

## Check that it works

Open your site in a private browser window. The chat button appears in the bottom right corner. Ask a question you know the answer to. The conversation appears in your [inbox](inbox) right away.
