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

## Tell the chat who's signed in

If your visitors sign in to your site or app, the chat can tell your team who they are: their name and photo show in the [inbox](inbox), with their email, your own user ID for them, their company and anything else you add. Call `Replybek.identify` once the chat has loaded:

```html
<script>
  window.addEventListener("replybek:ready", function () {
    Replybek.identify({
      user_id: "4127",                       // your own ID for this person
      name: "Dilnoza Karimova",
      email: "dilnoza@example.uz",
      phone: "+998 90 123 45 67",
      avatar: "https://example.uz/photos/4127.jpg",
      company: { id: "77", name: "Silk Road Shop", plan: "Pro", website: "silkroad.uz" },
      attributes: { role: "owner", orders: 12, vip: true }
    });
  });
</script>
```

Everything is optional. `attributes` takes up to 30 short values of your own; your team sees them under **From their website**. The photo is an `https` link or a small PNG, JPEG, WebP or GIF image. You can search the inbox by email, user ID and company name.

When the person signs out, call `Replybek.reset()`. The chat then forgets them in that browser, so the next person doesn't see their conversation.

These details come from your page, so treat them like anything else a visitor tells you: don't use them to decide who may see private information.

### Your own chat button

To open the chat from your own button instead of the round one, add `data-launcher="none"` to the code and call `Replybek.open()` from your button. The `replybek:unread` event tells you how many replies the visitor hasn't read yet, for a badge on your button:

```js
window.addEventListener("replybek:unread", function (e) {
  myBadge.textContent = e.detail.count || "";
});
```

## Check that it works

Open your site in a private browser window. The chat button appears in the bottom right corner. Ask a question you know the answer to. The conversation appears in your [inbox](inbox) right away.
