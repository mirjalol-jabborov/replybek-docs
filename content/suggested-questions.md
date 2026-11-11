---
title: Suggested questions
description: The tappable questions under the welcome message. Write them yourself or let AI draft them, in any of the widget's 16 languages.
---

Suggested questions help visitors start. They appear as chips under the welcome message in the chat, and a tap sends the question. Each agent can have up to five per language, each up to 180 characters.

Find them in the [Playground](playground), in the settings panel under **Suggested questions**.

## Write or generate them

Type your own questions, or press **Generate with AI**. Replybek reads the agent's ready knowledge and drafts questions customers are likely to ask. Review the draft, then press **Use generated questions** to keep it, or **Dismiss** to keep yours.

@clip suggested-generate | Generate questions from the agent's knowledge, use them, then save.

Use the arrows to change the order, and **×** to remove one. Changes go live when you press **Save changes**.

:::tip
Good starter questions are the ones customers actually ask most, worded the way they ask them. Check your [inbox](inbox) and [Analytics](analytics) for ideas.
:::

## Translate them

Questions are kept per language. The tabs above the list show your default language and every language that has questions; pick another one from **Add a language**. In a language with no questions yet, press **Translate from English** (or from another language that has them). You get a draft to review, the same as when generating.

@clip suggested-translate | Translate the English questions into Uzbek. The Playground shows them right away.

Translating or generating replaces only the language you're looking at. Other languages stay as they are. To drop a language, press **Remove** under its list.

## Which language visitors see

The widget shows the questions in the visitor's language. It takes the language from the widget's `data-language` setting if you set one, then from your website's language, then from the visitor's browser. See [Widget languages](widget-languages).

If you haven't written questions for a language, the first visitor on a page in that language gets your **Default language** questions translated by AI. The translation is saved for everyone after them, and its tab shows **Auto**. Edit those questions and they become yours; change your default-language questions and the automatic translations follow. If a translation can't be made, visitors see your default-language questions. See [Widget languages](widget-languages#your-greeting-and-questions-in-other-languages).

To show no suggestions at all in a language, add questions and then remove them all: an empty list stays empty, and visitors simply type their own question.
