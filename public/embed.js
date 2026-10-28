(function () {
  "use strict";

  var SCRIPT_SELECTOR = 'script[src$="/embed.js"]';
  var EMBED_SELECTOR = "[data-cally-embed]";
  var STYLE_ID = "cally-embed-styles";
  var initialized = new WeakSet();
  var script = document.currentScript || document.querySelector(SCRIPT_SELECTOR);
  var fallbackOrigin = script
    ? new URL(script.src, window.location.href).origin
    : "https://cally.cermuel.dev";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".cally-trigger{transition:filter 140ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}",
      ".cally-trigger:hover{filter:brightness(.96)}",
      ".cally-trigger:active{transform:scale(.96)}",
      ".cally-trigger:focus-visible{outline:2px solid currentColor;outline-offset:3px}",
      ".cally-embed-dialog{box-sizing:border-box;margin:auto;width:calc(100% - 32px);max-width:700px;height:min(476px,calc(100dvh - 32px));max-height:min(476px,calc(100dvh - 32px));padding:0;border:0;border-radius:16px;outline:0;background:transparent;color:#171717;overflow:hidden;opacity:0;transform:scale(.96);transition:opacity 250ms cubic-bezier(.23,1,.32,1),transform 250ms cubic-bezier(.23,1,.32,1),display 250ms allow-discrete,overlay 250ms allow-discrete}",
      ".cally-embed-dialog[open]{opacity:1;transform:scale(1)}",
      ".cally-embed-dialog::backdrop{background:rgba(0,0,0,0);backdrop-filter:blur(3px);transition:background-color 250ms cubic-bezier(.23,1,.32,1),display 250ms allow-discrete,overlay 250ms allow-discrete}",
      ".cally-embed-dialog[open]::backdrop{background:rgba(0,0,0,.56)}",
      ".cally-embed-dialog[data-theme=dark]{color:#f5f5f5}",
      ".cally-embed-loading{position:absolute;inset:0;z-index:1;display:grid;background:transparent;place-items:center}",
      ".cally-embed-spinner{box-sizing:border-box;width:18px;height:18px;border:2px solid currentColor;border-right-color:transparent;border-radius:999px;opacity:.35;animation:cally-spin .7s linear infinite}",
      ".cally-embed-frame{position:relative;display:block;width:100%;height:100%;border:0;border-radius:16px;background:transparent;opacity:0}",
      ".cally-embed-frame[data-loaded]{opacity:1}",
      "@keyframes cally-spin{to{transform:rotate(360deg)}}",
      "@starting-style{.cally-embed-dialog[open]{opacity:0;transform:scale(.96)}.cally-embed-dialog[open]::backdrop{background:rgba(0,0,0,0)}}",
      "@media(prefers-color-scheme:dark){.cally-embed-dialog[data-theme=auto]{color:#f5f5f5}}",
      "@media(prefers-reduced-motion:reduce){.cally-trigger{transition-property:filter}.cally-embed-dialog{transform:none;transition:opacity 200ms cubic-bezier(.23,1,.32,1),display 200ms allow-discrete,overlay 200ms allow-discrete}.cally-embed-dialog[open]{transform:none}.cally-embed-spinner{animation:none}}",
      "@media(max-width:640px){.cally-embed-dialog{width:calc(100% - 16px);height:calc(100dvh - 16px);max-height:none}}",
    ].join("");
    document.head.appendChild(style);
  }

  function embedUrl(element) {
    var url = new URL(element.dataset.callyUrl || fallbackOrigin, fallbackOrigin);
    url.searchParams.set("embed", "true");
    url.searchParams.set("theme", element.dataset.callyTheme || "auto");
    url.searchParams.set(
      "mode",
      element.dataset.callyEmbed === "popup" ? "popup" : "inline",
    );
    return url;
  }

  function createFrame(element, title) {
    var frame = document.createElement("iframe");
    var url = embedUrl(element);

    frame.src = url.toString();
    frame.title = title;
    frame.loading = "lazy";
    frame.allow = "clipboard-write";
    frame.style.cssText =
      "display:block;width:100%;min-height:560px;border:0;background:transparent;";
    frame.dataset.callyOrigin = url.origin;
    return frame;
  }

  function initInline(element) {
    var frame = createFrame(
      element,
      element.dataset.callyTitle || "Book a meeting",
    );
    element.replaceChildren(frame);
  }

  function initPopup(trigger) {
    var dialog = document.createElement("dialog");
    var loading = document.createElement("div");
    var spinner = document.createElement("span");
    var frame = createFrame(
      trigger,
      trigger.dataset.callyTitle || "Book a meeting",
    );
    var theme = trigger.dataset.callyTheme || "auto";
    var previousOverflow = "";

    ensureStyles();
    trigger.classList.add("cally-trigger");
    dialog.className = "cally-embed-dialog";
    dialog.dataset.theme = theme;
    dialog.setAttribute(
      "aria-label",
      trigger.dataset.callyTitle || "Book a meeting",
    );
    dialog.tabIndex = -1;
    loading.className = "cally-embed-loading";
    loading.setAttribute("aria-hidden", "true");
    spinner.className = "cally-embed-spinner";
    loading.append(spinner);
    frame.className = "cally-embed-frame";
    frame.style.cssText = "";
    frame.addEventListener(
      "load",
      function () {
        frame.dataset.loaded = "";
        loading.remove();
      },
      { once: true },
    );

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      document.documentElement.style.overflow = previousOverflow;
      trigger.focus();
    });
    trigger.addEventListener("click", function () {
      if (!dialog.isConnected) document.body.appendChild(dialog);
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      dialog.showModal();
      dialog.focus();
    });

    dialog.append(loading, frame);
  }

  function initialize(root) {
    var elements =
      root.matches && root.matches(EMBED_SELECTOR)
        ? [root]
        : Array.from(root.querySelectorAll(EMBED_SELECTOR));

    elements.forEach(function (element) {
      if (initialized.has(element)) return;
      initialized.add(element);

      if (element.dataset.callyEmbed === "popup") initPopup(element);
      else initInline(element);
    });
  }

  window.addEventListener("message", function (event) {
    if (
      !event.data ||
      event.data.source !== "cally" ||
      event.data.type !== "resize" ||
      !Number.isFinite(event.data.height)
    )
      return;

    document
      .querySelectorAll("iframe[data-cally-origin]")
      .forEach(function (frame) {
        if (
          frame.contentWindow !== event.source ||
          frame.dataset.callyOrigin !== event.origin
        )
          return;

        var dialog = frame.closest("dialog");
        if (!dialog) {
          frame.style.height = Math.max(320, event.data.height) + "px";
        }
      });
  });

  function start() {
    ensureStyles();
    initialize(document);
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) initialize(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
