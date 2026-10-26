---
title: Best practices
description: What makes an AI agent answer well, and the mistakes that make it answer badly.
---

An agent is only as good as what you teach it. These habits make the biggest difference.

## Give it clear knowledge

- **Write facts plainly.** "Delivery to Samarkand costs 45,000 so'm and takes 2 to 4 days" works better than a page that says "see our delivery terms".
- **Keep one fact in one place.** If two pages give different return periods, the agent may quote either. Fix the page, then [re-sync](websites#keep-it-up-to-date) it.
- **Cover the questions people really ask.** Start from your inbox, your phone calls and the [unanswered questions](unanswered) list, not from what you think customers ask.
- **Add Q&A answers for the tricky ones.** A short [Q&A answer](qa) is the fastest way to fix a question the agent gets wrong.

## Keep instructions short

Instructions shape how the agent answers, not what it knows. A few clear rules work best:

```text
- Keep answers to two or three sentences.
- When someone asks about exchanges, mention that they're free.
- Refund requests over 1,000,000 so'm go to a teammate.
```

Avoid putting facts like prices in the instructions. They belong in [knowledge](knowledge), where the agent can cite them and you can update them in one place.

## Test before you publish

Ask the [Playground](playground) the ten questions you hear most, in Uzbek, Russian and English. Read the sources it used. If an answer is wrong, fix the knowledge first, then the instructions.

## Leave a way to a person

Keep **Offer human handoff** on, and make sure someone watches the [inbox](inbox). Turn on [email alerts](email-alerts) so nobody waits when the dashboard is closed. Customers trust an AI agent more when they know a person is one tap away.

## Review every week

Spend fifteen minutes a week on [Analytics](analytics):

1. Answer the top unanswered questions.
2. Read a few conversations that were handed to a person, and ask whether the agent could have answered with better knowledge.
3. Check that the website sources re-synced and no pages failed.

## Connect systems with care

When you add [integrations](integrations), give the agent only the actions it needs. Make everything that changes data a **change** action, so the customer always confirms it, and test with sample data before you enable it.
