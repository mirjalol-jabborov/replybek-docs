---
title: Playground
description: Test real answers from your agent and adjust its settings before customers see them.
---

The Playground is a private chat with your agent. It uses the agent's real knowledge, but nothing you ask here reaches the inbox or your customers. Open it from **Playground** in the sidebar.

The left side holds the agent's settings, the right side is a test conversation. Pick which agent to test from the menu at the top.

## Ask a test question

Type a question the way a customer would and press **Enter**. The agent answers from its knowledge. Under each answer, **sources used** shows which pages or documents it relied on. Open it to read the exact passages.

@clip playground-test | A test question, the answer and the source it came from.

If the agent has no knowledge yet, it replies with its fallback message. Add some from [Knowledge](knowledge) first.

:::tip
Test the questions customers really ask, in the words they use. Your inbox and the [unanswered questions](unanswered) list are the best source.
:::

## Change how it answers

Every setting applies to your test questions as soon as you type it, before you save. Change something, ask again, compare.

| Setting | What it does |
| --- | --- |
| Agent name | The name visitors see in the chat. |
| Short description | For your team only. Visitors don't see it. |
| Instructions | Plain-language rules the agent follows alongside its knowledge, like "Keep answers short" or "Always mention free exchanges". |
| Tone | Friendly, professional or concise. |
| Welcome message | The first message visitors see in the widget. |
| Fallback message | What the agent says when its knowledge doesn't answer the question. |
| Offer human handoff | When a visitor asks for a person or reports a problem like a damaged item, the conversation moves to the [Inbox](handoff) and the AI pauses. |

@clip playground-instructions | Add two rules to the instructions, test again, then save.

When you're happy, press **Save changes**. The website widget uses the saved settings right away. **Discard** throws away your edits.

:::note
Instructions shape how the agent answers, not what it knows. To teach it a fact, like a new delivery price, add it to [Knowledge](knowledge) instead.
:::

## Publish the agent

A new agent is a **draft**: you can test it here, but its widget doesn't answer visitors. Press **Publish agent** to put it live. Press **Unpublish** to take it offline again. Its knowledge and settings stay.

@clip playground-publish | Publishing makes the agent's widget answer visitors.

## Suggested questions

The chips under the welcome message are the agent's suggested questions. Visitors tap one to start a conversation. You can write them yourself, generate them from your knowledge, and translate them into each language. See [Suggested questions](suggested-questions).

## Start over

**Reset** clears the test conversation. It doesn't change any settings.
