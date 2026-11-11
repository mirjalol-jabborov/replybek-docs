---
title: Widget languages
description: The chat speaks 16 languages, translates your greeting and suggested questions for each, and the agent answers every customer in their own language.
---

The widget follows your website's language. It has its buttons and labels ready in 16 languages, translates your greeting and suggested questions when a page is in a language you haven't written them in, and the agent answers each customer in the language they write in.

## Three kinds of language

- **The chat's buttons and labels**, like "Talk to a person" or "Ask a question", come built in, in the widget's language.
- **Your greeting and suggested questions** are yours. Write them once in your default language; pages in other languages show your own translation if you wrote one, and an automatic one if you didn't.
- **The agent's answers** follow the customer. If someone writes in Japanese, the agent answers in Japanese, even when your knowledge is only in English or Uzbek.

## Languages the widget speaks

| Code | Language | Code | Language |
|---|---|---|---|
| `en` | English | `de` | German |
| `uz` | Uzbek | `ja` | Japanese |
| `ru` | Russian | `ko` | Korean |
| `es` | Spanish | `zh` | Chinese (Simplified) |
| `pt` | Portuguese | `ar` | Arabic (shown right to left) |
| `fr` | French | `tr` | Turkish |
| `it` | Italian | `hi` | Hindi |
| `pl` | Polish | `id` | Indonesian |

## How the widget picks its language

It uses the first of these that it finds:

:::steps
1. The `data-language` setting in your widget code, if you added one: any code from the table, like `ja` or `ar`.
2. Your website's language, from the page's `lang` setting. The Japanese version of your site (`<html lang="ja">`) shows the chat in Japanese.
3. The visitor's browser language, if the page has no language set.
:::

Regional codes work too: `pt-BR` means Portuguese and `zh-Hans` means Chinese. For a language that isn't in the table, the buttons and labels are in English, and the agent still answers in the customer's language.

On a site with Uzbek pages, the chat is in Uzbek, and so are the suggested questions:

@clip widget-uzbek | The site is in Uzbek, so the chat, the suggested questions and the answer are too.

On any site, `data-language="ru"` makes it Russian:

@clip widget-russian | The widget code sets Russian. The customer writes in Russian and gets an answer in Russian.

```html
<script src="https://app.replybek.uz/api/widget.js"
  data-key="pk_your_agent_key"
  data-api="https://app.replybek.uz/api"
  data-language="ru"
  defer></script>
```

## Your greeting and questions in other languages

You write your welcome message and suggested questions in your **default language** (set it under Suggested questions in the Playground). When a visitor opens the chat on a page in another of the languages above:

:::steps
1. If you wrote a welcome or questions for that language, the visitor sees yours.
2. If you didn't, the first visitor's chat translates yours with AI. The translation is saved, so every later visitor gets it right away, and it's never translated twice.
3. If the translation can't be made right then, the visitor sees your default-language texts. The next visitor tries again.
:::

Automatic translations show an **Auto-translated** mark in the Playground. Edit one and it becomes yours: it's never replaced again. If you change the original in your default language, the automatic translations are redone to match; yours stay as you wrote them. Remove a language to go back to an automatic translation. See [Suggested questions](suggested-questions#translate-them).

## Which language the agent answers in

The agent answers in the language of the customer's message. When a message has no clear language of its own, like an emoji, an order number or a product name, it answers in the page's language, and failing that in the language the customer used before.

## Knowledge in one language is enough

You don't need to translate your website or documents. The agent reads your knowledge in whatever language it's in and answers in the customer's language. Product names and prices stay exactly as written.
