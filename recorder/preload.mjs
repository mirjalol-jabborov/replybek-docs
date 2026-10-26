// Loaded into the API only while recording docs clips (NODE_OPTIONS=--import): requests to the
// fictional business's addresses go to the local stand-ins instead of the internet.
const MAP = JSON.parse(process.env.DOCS_HOST_MAP || "{}");
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const raw = typeof input === "string" || input instanceof URL ? String(input) : input.url;
  const url = new URL(raw);
  const target = MAP[url.host];
  return target ? realFetch(new URL(url.pathname + url.search, target), init) : realFetch(input, init);
};
