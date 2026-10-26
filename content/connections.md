---
title: Connections
description: How Replybek reaches your system, from a business API key to the customer's own sign-in.
---

The **Connection** step tells Replybek where your system is and how to sign in to it. Pick the option that matches whose data the agent works with.

@clip integration-connection | A server connection with a business API key.

## Server connection

Replybek calls your system from its servers. Enter the **System address**, the base of your API, like `https://api.yourshop.uz`, and choose the authentication:

| Authentication | Use it when | What you enter |
| --- | --- | --- |
| Business API key | The agent works with business data, like order status by order number or stock. | The **API key**, the **Authentication header** it goes in (like `Authorization` or `X-Api-Key`) and an optional **Key prefix** (like `Bearer ` with the space). |
| Customer OAuth sign-in | The agent works with a customer's private account, like "my orders". | Your system's **Sign-in page path** and **Token path**, the **Client ID** and **Client secret**, the **Scope**, and the **Token request format**. |
| Public API | The API needs no sign-in. | Nothing else. |

:::warning A business key sees everything
A business API key gives every conversation the same access. Expose only actions and data that every customer may see, and use customer OAuth for anything private to one customer.
:::

### Customer OAuth sign-in

The customer signs in on your system's own page, in a popup from the chat. Replybek keeps only that conversation's tokens, encrypted, and refreshes them when they expire. The customer's password never reaches Replybek.

Register this return address in your system's OAuth settings:

```text
https://app.replybek.uz/api/oauth/callback
```

## Customer browser session

Use this when the chat runs inside your own web app, where the customer is already signed in, like a customer portal or an ERP. The widget makes each request from the customer's browser, in their existing session. No OAuth setup and no stored secret.

Choose the **Browser authentication**:

- **Existing session cookies**: the browser sends your app's own cookies.
- **Current user's token**: your developer gives the widget a function that returns the signed-in user's token. The widget calls it for each request and never stores it.

The requests must go to the same site as the page. For an API on another domain, use a server connection or a proxy on your own domain.

## Advanced settings

Under **Advanced connection settings** you can add:

- **Headers** sent with every request.
- **Account context**: values read once after sign-in, like the customer's account id or branch, which actions can then use.
- **Account label**: which field names the signed-in account, shown to your team in the inbox.

Secrets you've saved are never shown again. Leave the field empty to keep the saved one.
