// Simplified Magnesium converter for clinical use
// Convert between mmol, grams (heptahydrate), % w/v, and standard vials

(() => {
  const MW_MGSO4_7H2O = 246.47;
  const VIAL_MMOL = 10;
  const VIAL_ML = 5;
  const VIAL_CONCENTRATION = VIAL_MMOL / VIAL_ML;

  const $ = (sel, root = document) => root.querySelector(sel);

  function num(val) {
    const x = parseFloat(String(val || "").replace(",", "."));
    return Number.isFinite(x) ? x : null;
  }
  
  function fmt(x, dp = 2) {
    if (x === null) return "";
    const v = Math.abs(x) >= 1000 ? x.toFixed(0) : x.toFixed(dp);
    return v.replace(/\.00$/, "");
  }

  function ui(container) {
    container.innerHTML = `
      <div class="mg-card">
        <div class="mg-grid">
          <div class="mg-input-section">
            <label>📝 Enter ONE value to convert</label>
            <div class="mg-row">
              <input id="in_mmol" type="number" step="0.01" placeholder="e.g., 8">
              <span class="mg-unit">mmol Mg²⁺</span>
            </div>
            <div class="mg-row">
              <input id="in_grams" type="number" step="0.1" placeholder="e.g., 2">
              <span class="mg-unit">grams (heptahydrate)</span>
            </div>
            <div class="mg-row">
              <input id="in_pct" type="number" step="0.1" placeholder="e.g., 10">
              <span class="mg-unit">% w/v</span>
            </div>
            <div class="mg-row mg-volume-row" id="vol_row" style="display:none;">
              <input id="in_vol" type="number" step="1" placeholder="e.g., 20">
              <span class="mg-unit">mL (volume of % solution)</span>
            </div>
          </div>

          <div class="mg-output-section">
            <label>💊 Results</label>
            <div class="mg-results">
              <div class="mg-result-row">
                <span class="mg-label">Magnesium (mmol):</span>
                <span class="mg-value" id="out_mmol">—</span>
              </div>
              <div class="mg-result-row">
                <span class="mg-label">Grams (MgSO₄·7H₂O):</span>
                <span class="mg-value" id="out_grams">—</span>
              </div>
              <div class="mg-result-row">
                <span class="mg-label">% w/v (per 100 mL):</span>
                <span class="mg-value" id="out_pct">—</span>
              </div>
              <div class="mg-result-row mg-highlight">
                <span class="mg-label">💉 Standard vials needed:</span>
                <span class="mg-value" id="out_vials">—</span>
              </div>
              <div class="mg-result-row mg-highlight">
                <span class="mg-label">📏 mL to draw up:</span>
                <span class="mg-value" id="out_ml">—</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mg-footer">
          <small>
            💡 <strong>Tip:</strong> Each standard vial contains 10 mmol in 5 mL (2 mmol/mL).<br>
            MgSO₄·7H₂O = magnesium sulfate heptahydrate (the form listed in medchart).
          </small>
        </div>
      </div>
    `;

    const volRow = $("#vol_row", container);
    const pctInput = $("#in_pct", container);
    
    pctInput.addEventListener("focus", () => {
      volRow.style.display = "flex";
    });

    function compute() {
      const in_mmol = num($("#in_mmol", container).value);
      const in_grams = num($("#in_grams", container).value);
      const in_pct = num($("#in_pct", container).value);
      const in_vol = num($("#in_vol", container).value);

      const drivers = [
        ["mmol", in_mmol],
        ["grams", in_grams],
        ["pct", in_pct]
      ].filter(x => x[1] !== null);

      if (drivers.length !== 1) return clear();

      const driver = drivers[0][0];
      let mmol = null, grams = null;
      let pctOutText = "—";

      if (driver === "mmol") {
        if (in_mmol <= 0) return clear();
        mmol = in_mmol;
        grams = mmol * MW_MGSO4_7H2O / 1000.0;
      }
      else if (driver === "grams") {
        if (in_grams <= 0) return clear();
        grams = in_grams;
        mmol = grams * 1000.0 / MW_MGSO4_7H2O;
      }
      else if (driver === "pct") {
        if (!in_vol || in_vol <= 0) return clear();
        if (in_pct <= 0) return clear();
        grams = in_pct * (in_vol / 100.0);
        mmol = grams * 1000.0 / MW_MGSO4_7H2O;
        pctOutText = fmt(in_pct, 2) + "%";
      }

      const ml_needed = mmol !== null ? (mmol / VIAL_CONCENTRATION) : null;
      const vials_needed = ml_needed !== null ? Math.ceil(ml_needed / VIAL_ML) : null;

      $("#out_mmol", container).textContent = fmt(mmol, 2);
      $("#out_grams", container).textContent = fmt(grams, 2);
      $("#out_pct", container).textContent = pctOutText;
      $("#out_vials", container).textContent = vials_needed !== null ? vials_needed : "—";
      $("#out_ml", container).textContent = fmt(ml_needed, 1) + (ml_needed !== null ? " mL" : "");
    }

    function clear() {
      $("#out_mmol", container).textContent = "—";
      $("#out_grams", container).textContent = "—";
      $("#out_pct", container).textContent = "—";
      $("#out_vials", container).textContent = "—";
      $("#out_ml", container).textContent = "—";
    }

    ["in_mmol", "in_grams", "in_pct", "in_vol"].forEach(id => {
      $("#" + id, container).addEventListener("input", compute);
    });
  }

  function styles() {
    const css = `
      .mg-card {
        border: 1px solid var(--md-default-fg-color--lightest);
        border-radius: 8px;
        padding: 1.5rem;
        background: var(--md-code-bg-color);
        margin: 1rem 0;
      }
      .mg-grid {
        display: grid;
        gap: 2rem;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }
      .mg-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin: 0.5rem 0;
      }
      .mg-volume-row {
        margin-left: 1rem;
        padding-left: 1rem;
        border-left: 3px solid var(--md-accent-fg-color);
      }
      .mg-row input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid var(--md-default-fg-color--lighter);
        border-radius: 4px;
        background: var(--md-default-bg-color);
        color: var(--md-default-fg-color);
        font-size: 0.9rem;
      }
      .mg-unit {
        flex: 0 0 auto;
        min-width: 160px;
        font-size: 0.85rem;
        opacity: 0.8;
      }
      .mg-input-section label,
      .mg-output-section label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.75rem;
        font-size: 1rem;
      }
      .mg-results {
        background: var(--md-default-bg-color);
        border: 1px solid var(--md-default-fg-color--lightest);
        border-radius: 6px;
        padding: 1rem;
      }
      .mg-result-row {
        display: flex;
        justify-content: space-between;
        padding: 0.4rem 0;
        border-bottom: 1px solid var(--md-default-fg-color--lightest);
      }
      .mg-result-row:last-child {
        border-bottom: none;
      }
      .mg-label {
        font-weight: 500;
        opacity: 0.9;
      }
      .mg-value {
        font-weight: 600;
        color: var(--md-accent-fg-color);
        font-family: monospace;
      }
      .mg-highlight {
        background: var(--md-accent-fg-color--transparent);
        margin: 0.5rem -0.5rem 0;
        padding: 0.6rem 0.5rem !important;
        border-radius: 4px;
      }
      .mg-footer {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid var(--md-default-fg-color--lightest);
        opacity: 0.8;
      }
      [data-md-color-scheme="slate"] .mg-row input {
        background: var(--md-code-bg-color);
      }
    `;
    if (document.getElementById("ed-handbook-mg-converter-styles")) return;
    const style = document.createElement("style");
    style.id = "ed-handbook-mg-converter-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function boot() {
    styles();
    document.querySelectorAll(".mg-converter").forEach(ui);
  }

  if (typeof document$ !== "undefined" && document$ && typeof document$.subscribe === "function") {
    document$.subscribe(boot);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
