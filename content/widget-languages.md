---
title: Widget languages
description: The chat speaks Uzbek, Russian and English, and the agent answers each customer in their own language.
---

Replybek is built for Uzbekistan, so the widget works in **Uzbek**, **Russian** and **English** out of the box.

## Two kinds of language

- **The chat's buttons and labels**, like "Talk to a person" or "Ask a question", follow the widget's language.
- **The agent's answers** follow the customer. If someone writes in Russian, the agent answers in Russian, even when your knowledge is only in English or Uzbek.

## How the widget picks its language

It uses the first of these that it finds:

:::steps
1. The `data-language` setting in your widget code, if you added one: `uz`, `ru` or `en`.
2. Your website's language, from the page's `lang` setting. An Uzbek version of your site shows the chat in Uzbek.
3. The visitor's browser language, if the page has no language set.
:::

If the language it finds isn't Uzbek, Russian or English, the chat uses English.

On a site with Uzbek pages, the chat is in Uzbek, and so are the suggested questions:

@clip widget-uzbek | The site is in Uzbek, so the chat, the suggested questions and the answer are too.

On any site, `data-language="ru"` makes it Russian:

@clip widget-russian | The widget code sets Russian. The customer writes in Russian and gets an answer in Russian.

```html
<script src="https://app.replybek.uz/widget.js"
  data-key="pk_your_agent_key"
  data-api="https://app.replybek.uz/api"
  data-language="ru"
  defer></script>
```

## Translate your suggested questions

Suggested questions are kept per language, so visitors see them in their own. Write them or let AI translate them in the Playground. See [Suggested questions](suggested-questions#translate-them).

## Knowledge in one language is enough

You don't need to translate your website or documents. The agent reads your knowledge in whatever language it's in and answers in the customer's language. Product names and prices stay exactly as written.
