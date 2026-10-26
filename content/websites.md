---
title: Websites
description: Import pages from your site or help center, choose which sections, and keep them in sync automatically.
---

A website source reads pages from your site and keeps them up to date. It's the fastest way to teach an agent what your customers already read.

## Import a website

:::steps
1. Open **Knowledge**, press **Add knowledge** and choose **Website**.
2. Enter the address, for example `yourshop.uz` or `help.yourshop.uz/delivery`, and press **Check site**.
3. Replybek reads the site's sitemap and shows how many pages it found, grouped by section. Untick the sections you don't want.
4. Choose how often to **Re-sync automatically**, then press **Import** (the button says how many pages, like **Import 9 pages**).
:::

@clip knowledge-website | Check the site, choose what to import, then watch it become ready.

The import runs in the background. You can close the window; progress shows in the Knowledge table.

## What to import

| Option | What Replybek reads |
| --- | --- |
| Sections of the site | Every page in the sections you tick, found through the sitemap. |
| Follow links | When a site has no sitemap: pages linked from the address you entered, within the same folder. |
| Only this page | Just the one page. Good for a single policy or FAQ page. |

Replybek respects your site's `robots.txt`. Pages it asks crawlers not to read are skipped, and the dialog tells you how many.

:::note Pages per website
Each website imports up to 50 pages on Starter, 500 on Growth and 5,000 on Business. If a site has more, the first pages up to the limit are imported, and the details show how many were left out.
:::

## Keep it up to date

Websites change, so Replybek can read them again on a schedule: **Daily**, **Weekly** or **Monthly**, or **Off** to update by hand. A re-sync picks up new and changed pages. Pages that didn't change aren't processed again.

To update now, open the source and press **Re-sync now**. The agent keeps answering from the current pages while the new ones are read.

@clip knowledge-pages | Search the pages a website source read, and start a re-sync.

## When pages fail

Open the source to see every page it read. Failed pages are listed first with the reason, for example a page that needs a login or returned an error. Fix the page on your site, then re-sync.

:::tip
The agent can only read text that's on the page. Prices inside images or behind a login aren't visible to it. Put important facts in plain text, or add them as a [Q&A answer](qa).
:::
