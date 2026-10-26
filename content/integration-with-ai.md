---
title: Set up with AI
description: Give Replybek your API documentation and describe what the agent should do. AI drafts the connection and actions for you to review.
---

The fastest way to start is to let AI read your API documentation. It finds the endpoints, proposes how to connect, and writes the actions. You review everything before anything is connected.

## 1. Add your documentation

In **Add integration**, choose **Set up with AI**. Then give it the documentation in one of three ways:

| Option | Accepts |
| --- | --- |
| Documentation URL | Postman collections, OpenAPI or Swagger files, ReDoc pages and linked documentation pages. |
| Paste documentation | Text with endpoint paths, inputs and example responses. |
| Upload documentation | PDF, Word, text, Markdown or OpenAPI files, up to 2 MB. |

:::warning Remove secrets first
Documentation is sent to the AI provider. Take out passwords, API keys and real customer data. You add credentials securely in the Connection step later.
:::

## 2. Describe the goal

Under **What should your agent be able to do?**, describe the tasks, who uses them and how your app gives access. For example: *"Let customers check where their order is and start a return. We connect with our business API key."* Describe the mechanism; never paste a real credential.

Then choose **How will your app provide access?**, or let AI propose it.

## 3. Prepare the plan

Press **Prepare integration plan**. AI reads the documentation and shows:

- a **proposed setup**: the connection and what each action will do,
- the **documented endpoints** it found, with the ones it suggests already selected,
- anything that **needs clarification**. Update your description and prepare the plan again.

@clip integration-ai-plan | AI reads the store's OpenAPI file and proposes a setup.

## 4. Generate the actions

Review the selected endpoints, then press **Generate selected actions**. Large APIs are generated in batches. You can close the window: progress is saved and continues when you come back. Endpoints that fail are listed, and **Retry failed endpoints** tries them again.

Press **Review connection and actions** to load the result into the setup.

@clip integration-ai-generate | Generate the actions, then review them in the normal setup.

## 5. Review and test

Nothing has been connected or run yet. Go through [Connection](connections), add your credentials, check each [action](actions), then [test](testing-integrations) before you enable it.

:::tip
AI works from what the documentation says. If an endpoint isn't documented, it isn't proposed, so add it yourself with [forms](build-with-forms).
:::
