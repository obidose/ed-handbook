// Site-wide feedback: floating button + modal → Formspree
(() => {
  const ENDPOINT =
    document.querySelector('meta[name="feedback-endpoint"]')?.content || "";

  if (!ENDPOINT) return;

  let lastFocus = null;

  function $(id) {
    return document.getElementById(id);
  }

  function getPageContext() {
    return {
      page_url: location.href,
      page_title:
        document.title.replace(/\s*[–-]\s*Palmy ED Clinician Handbook\s*$/i, "").trim() ||
        document.title,
    };
  }

  function syncPageFields() {
    const ctx = getPageContext();
    const urlEl = $("palmy-feedback-page-url");
    const titleEl = $("palmy-feedback-page-title");
    const labelEl = $("palmy-feedback-page-label");
    if (urlEl) urlEl.value = ctx.page_url;
    if (titleEl) titleEl.value = ctx.page_title;
    if (labelEl) {
      labelEl.textContent = ctx.page_title ? `Page: ${ctx.page_title}` : "";
    }
  }

  function setStatus(text, isError) {
    const el = $("palmy-feedback-status");
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("palmy-feedback-status--error", Boolean(isError));
  }

  function openModal() {
    const overlay = $("palmy-feedback-overlay");
    if (!overlay) return;
    lastFocus = document.activeElement;
    setStatus("");
    const form = $("palmy-feedback-form");
    if (form) form.reset();
    syncPageFields();
    overlay.hidden = false;
    document.body.classList.add("palmy-feedback-open");
    $("palmy-feedback-message")?.focus();
  }

  function closeModal() {
    const overlay = $("palmy-feedback-overlay");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("palmy-feedback-open");
    setStatus("");
    const form = $("palmy-feedback-form");
    if (form) {
      form.reset();
      const submit = $("palmy-feedback-submit");
      if (submit) submit.disabled = false;
    }
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  async function submitForm(ev) {
    ev.preventDefault();
    const form = $("palmy-feedback-form");
    const submitBtn = $("palmy-feedback-submit");
    const message = $("palmy-feedback-message")?.value?.trim();

    if (!message) {
      setStatus("Please enter a message.", true);
      $("palmy-feedback-message")?.focus();
      return;
    }

    syncPageFields();
    setStatus("Sending…", false);
    if (submitBtn) submitBtn.disabled = true;

    const data = new FormData(form);
    data.set(
      "_subject",
      `Palmy ED Handbook feedback: ${getPageContext().page_title || "Unknown page"}`
    );

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("Thank you — your feedback was sent.", false);
        form.reset();
        syncPageFields();
        setTimeout(closeModal, 2200);
      } else {
        const body = await res.json().catch(() => ({}));
        const err =
          body.error ||
          body.errors?.map((e) => e.message).join(" ") ||
          "Something went wrong.";
        setStatus(`${err} Please try again.`, true);
        if (submitBtn) submitBtn.disabled = false;
      }
    } catch {
      setStatus("Could not send feedback. Check your connection and try again.", true);
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function onKeydown(ev) {
    if (ev.key === "Escape" && !$("palmy-feedback-overlay")?.hidden) {
      ev.preventDefault();
      closeModal();
    }
  }

  function wireEvents() {
    $("palmy-feedback-open")?.addEventListener("click", openModal);
    $("palmy-feedback-close")?.addEventListener("click", closeModal);
    $("palmy-feedback-cancel")?.addEventListener("click", closeModal);
    $("palmy-feedback-overlay")?.addEventListener("click", (ev) => {
      if (ev.target.id === "palmy-feedback-overlay") closeModal();
    });
    $("palmy-feedback-form")?.addEventListener("submit", submitForm);
    document.addEventListener("keydown", onKeydown);
  }

  function init() {
    if (window.__palmyFeedbackInit) {
      syncPageFields();
      return;
    }
    window.__palmyFeedbackInit = true;

    const root = document.createElement("div");
    root.id = "palmy-feedback-root";
    root.innerHTML = `
      <button type="button" class="palmy-feedback-fab" id="palmy-feedback-open" aria-haspopup="dialog" aria-controls="palmy-feedback-dialog">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.2L4 17.2V4h16v12Z"/>
        </svg>
        <span>Feedback</span>
      </button>
      <div class="palmy-feedback-overlay" id="palmy-feedback-overlay" hidden>
        <div class="palmy-feedback-dialog" id="palmy-feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="palmy-feedback-title">
          <header class="palmy-feedback-dialog__header">
            <h2 id="palmy-feedback-title">Send feedback</h2>
            <button type="button" class="palmy-feedback-dialog__close" id="palmy-feedback-close" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/>
              </svg>
            </button>
          </header>
          <p class="palmy-feedback-dialog__hint">Report broken links, outdated content, or suggestions. Do not include patient-identifiable information.</p>
          <p class="palmy-feedback-dialog__page" id="palmy-feedback-page-label"></p>
          <form id="palmy-feedback-form" class="palmy-feedback-form" novalidate>
            <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="palmy-feedback-honeypot" aria-hidden="true">
            <input type="hidden" name="page_url" id="palmy-feedback-page-url">
            <input type="hidden" name="page_title" id="palmy-feedback-page-title">
            <label for="palmy-feedback-message">Message <span class="palmy-feedback-required">(required)</span></label>
            <textarea id="palmy-feedback-message" name="message" rows="5" required placeholder="What would you like us to know?"></textarea>
            <label for="palmy-feedback-email">Your email <span class="palmy-feedback-optional">(optional, if you want a reply)</span></label>
            <input type="email" id="palmy-feedback-email" name="email" autocomplete="email" placeholder="you@example.com">
            <div class="palmy-feedback-actions">
              <button type="button" class="md-button" id="palmy-feedback-cancel">Cancel</button>
              <button type="submit" class="md-button md-button--primary" id="palmy-feedback-submit">Send</button>
            </div>
            <p class="palmy-feedback-status" id="palmy-feedback-status" role="status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(root);
    wireEvents();
    syncPageFields();
  }

  function boot() {
    init();
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(boot);
  } else {
    boot();
  }
})();
