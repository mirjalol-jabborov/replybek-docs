// Replybek Docs: mobile navigation, theme switch, copy buttons, "On this page" highlight and search.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: the choice lasts this page */ } },
  };

  // Mobile navigation
  const menu = $(".menu");
  const setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    menu.setAttribute("aria-expanded", String(open));
  };
  menu.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  document.addEventListener("click", (e) => {
    if (document.body.classList.contains("nav-open") && !e.target.closest(".sidebar, .menu")) setNav(false);
  });
  $(".sidebar [aria-current]")?.scrollIntoView({ block: "center" });

  // Theme: follows the system until switched here.
  $(".theme").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = dark ? "light" : "dark";
    store.set("replybek.docs.theme", document.documentElement.dataset.theme);
  });

  // Copy buttons on code
  $$(".copy").forEach((b) =>
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(b.nextElementSibling.innerText);
        b.textContent = "Copied";
        b.classList.add("done");
        setTimeout(() => ((b.textContent = "Copy"), b.classList.remove("done")), 1500);
      } catch {
        b.textContent = "Select and copy";
      }
    })
  );

  // Clips play only while on screen, and not at all when motion is reduced.
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clips = $$(".media video");
  if (reduce) clips.forEach((v) => (v.removeAttribute("autoplay"), v.pause(), (v.controls = true)));
  else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.25 });
    clips.forEach((v) => io.observe(v));
  }

  // A clip opens full screen on click: the dashboard is easier to read that way, especially on phones.
  clips.forEach((v) =>
    v.addEventListener("click", () => {
      if (document.fullscreenElement) return document.exitFullscreen();
      (v.requestFullscreen || v.webkitEnterFullscreen)?.call(v);
    })
  );

  // On this page: highlight the section being read.
  const tocLinks = $$(".toc a");
  if (tocLinks.length) {
    const heads = tocLinks.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const onScroll = () => {
      let current = heads[0];
      for (const h of heads) if (h.getBoundingClientRect().top < 120) current = h;
      tocLinks.forEach((a) => a.classList.toggle("active", a.hash === `#${current?.id}`));
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Search
  const dialog = $(".search");
  const input = $("input", dialog);
  const results = $(".search-results", dialog);
  let index = null;
  let selected = 0;
  const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const mark = (text, words) => {
    let html = escape(text);
    for (const w of words) html = html.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark>$1</mark>");
    return html;
  };
  const snippet = (text, words) => {
    const i = Math.max(0, ...words.map((w) => text.toLowerCase().indexOf(w)));
    return (i > 40 ? "…" : "") + text.slice(Math.max(0, i - 40), i + 120);
  };
  async function open() {
    dialog.hidden = false;
    input.value = "";
    input.focus();
    if (!index) index = await fetch("/search.json").then((r) => r.json()).catch(() => []);
    show();
  }
  const close = () => (dialog.hidden = true);
  function show() {
    const words = input.value.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
    const list = !words.length
      ? index.filter((e) => !e.p).slice(0, 8)
      : index
          .map((e) => {
            const t = e.t.toLowerCase();
            const x = e.x.toLowerCase();
            if (!words.every((w) => t.includes(w) || x.includes(w))) return null;
            return { e, score: words.reduce((s, w) => s + (t.includes(w) ? 10 : 0) + (t.startsWith(w) ? 5 : 0) + (x.includes(w) ? 1 : 0), 0) + (e.p ? 0 : 2) };
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score)
          .slice(0, 12)
          .map((r) => r.e);
    selected = 0;
    results.innerHTML = list.length
      ? list
          .map(
            (e, i) =>
              `<a href="${e.u}" role="option" aria-selected="${i === 0}"><small>${escape(e.p ? `${e.g} › ${e.p}` : e.g)}</small><b>${mark(e.t, words)}</b>${words.length ? `<p>${mark(snippet(e.x, words), words)}</p>` : ""}</a>`
          )
          .join("")
      : `<div class="search-empty">Nothing found for “${escape(input.value)}”. Try other words.</div>`;
  }
  const move = (d) => {
    const items = $$("a", results);
    if (!items.length) return;
    selected = (selected + d + items.length) % items.length;
    items.forEach((a, i) => a.setAttribute("aria-selected", String(i === selected)));
    items[selected].scrollIntoView({ block: "nearest" });
  };
  $(".search-open").addEventListener("click", open);
  input.addEventListener("input", show);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") (e.preventDefault(), move(1));
    if (e.key === "ArrowUp") (e.preventDefault(), move(-1));
    if (e.key === "Enter") $$("a", results)[selected]?.click();
  });
  results.addEventListener("click", (e) => e.target.closest("a") && close());
  dialog.addEventListener("mousedown", (e) => e.target === dialog && close());
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") (e.preventDefault(), dialog.hidden ? open() : close());
    else if (e.key === "/" && dialog.hidden && !/input|textarea/i.test(document.activeElement.tagName)) (e.preventDefault(), open());
    else if (e.key === "Escape" && !dialog.hidden) close();
  });
})();
