(function () {
  const COUNT_PLACEHOLDER = /\{\{count\}\}/g;

  function decodeHtmlAttribute(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value ?? "";
    return textarea.value;
  }

  function renderWidget(root) {
    const template = decodeHtmlAttribute(root.dataset.fomoTemplate);
    const count = root.dataset.fomoCount;
    if (!template) return;

    const messageEl = root.querySelector(".fomo-message-html");
    if (!messageEl) return;

    messageEl.innerHTML = template.replace(COUNT_PLACEHOLDER, count ?? "0");
  }

  function init() {
    document.querySelectorAll("[data-fomo-widget]").forEach(renderWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
