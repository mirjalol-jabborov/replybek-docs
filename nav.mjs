// The docs' sidebar: groups in order, each a list of content/<slug>.md pages.
export const SITE = {
  name: "Replybek",
  origin: "https://docs.replybek.uz",
  app: "https://app.replybek.uz",
  version: "1",
};

export const NAV = [
  { group: "Get started", pages: ["index", "first-agent", "best-practices"] },
  { group: "AI agents", pages: ["agents", "playground", "suggested-questions", "how-agents-answer"] },
  { group: "Knowledge", pages: ["knowledge", "websites", "files", "qa", "unanswered"] },
  { group: "Website widget", pages: ["install-widget", "customize-widget", "widget-languages", "visitor-experience"] },
  { group: "Inbox", pages: ["inbox", "handoff", "replies-and-notes", "assign-and-resolve", "email-alerts"] },
  {
    group: "Integrations",
    pages: ["integrations", "connections", "integration-with-ai", "build-with-forms", "actions", "procedures", "testing-integrations", "manage-integrations"],
  },
  { group: "Insights", pages: ["overview-page", "analytics"] },
  { group: "Workspace", pages: ["workspace-settings", "team", "plans-and-billing", "usage-and-limits", "account"] },
];
