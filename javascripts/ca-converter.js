// Simplified Calcium converter for clinical use
// Convert between mmol Ca²⁺ ions and standard vials (gluconate vs chloride)

(() => {
  // Standard vial specifications
  const GLUCONATE_MMOL = 2.23;
  const GLUCONATE_ML = 10;
  const GLUCONATE_CONC = GLUCONATE_MMOL / GLUCONATE_ML; // mmol/mL

  const CHLORIDE_MMOL = 6.8;
  const CHLORIDE_ML = 10;
  const CHLORIDE_CONC = CHLORIDE_MMOL / CHLORIDE_ML; // mmol/mL

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
            <label>📝 Enter dose in mmol Ca²⁺</label>
            <div class="mg-row">
              <input id="in_mmol" type="number" step="0.01" placeholder="e.g., 4.5">
              <span class="mg-unit">mmol Ca²⁺</span>
            </div>
          </div>

          <div class="mg-output-section">
            <label>💊 Calcium Gluconate 10%</label>
            <div class="mg-results">
              <div class="mg-result-row">
                <span class="mg-label">Standard vials:</span>
                <span class="mg-value" id="out_gluconate_vials">—</span>
              </div>
              <div class="mg-result-row mg-highlight">
                <span class="mg-label">💉 mL to draw up:</span>
                <span class="mg-value" id="out_gluconate_ml">—</span>
              </div>
            </div>
          </div>

          <div class="mg-output-section">
            <label>💊 Calcium Chloride 10%</label>
            <div class="mg-results">
              <div class="mg-result-row">
                <span class="mg-label">Standard vials:</span>
                <span class="mg-value" id="out_chloride_vials">—</span>
              </div>
              <div class="mg-result-row mg-highlight">
                <span class="mg-label">💉 mL to draw up:</span>
                <span class="mg-value" id="out_chloride_ml">—</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mg-footer">
          <small>
            💡 <strong>Standard vials:</strong><br>
            • <strong>Calcium Gluconate 10%:</strong> 2.23 mmol Ca²⁺ in 10 mL (0.223 mmol/mL)<br>
            • <strong>Calcium Chloride 10%:</strong> 6.8 mmol Ca²⁺ in 10 mL (0.68 mmol/mL)<br>
            <em>Note: mmol refers to calcium ions (Ca²⁺), the clinically useful measure.</em>
          </small>
        </div>
      </div>
    `;

    function compute() {
      const in_mmol = num($("#in_mmol", container).value);

      if (in_mmol === null || in_mmol <= 0) {
        clear();
        return;
      }

      // Calculate for Calcium Gluconate
      const ml_gluconate = in_mmol / GLUCONATE_CONC;
      const vials_gluconate = Math.ceil(ml_gluconate / GLUCONATE_ML);

      // Calculate for Calcium Chloride
      const ml_chloride = in_mmol / CHLORIDE_CONC;
      const vials_chloride = Math.ceil(ml_chloride / CHLORIDE_ML);

      $("#out_gluconate_vials", container).textContent = vials_gluconate;
      $("#out_gluconate_ml", container).textContent = fmt(ml_gluconate, 1) + " mL";
      
      $("#out_chloride_vials", container).textContent = vials_chloride;
      $("#out_chloride_ml", container).textContent = fmt(ml_chloride, 1) + " mL";
    }

    function clear() {
      $("#out_gluconate_vials", container).textContent = "—";
      $("#out_gluconate_ml", container).textContent = "—";
      $("#out_chloride_vials", container).textContent = "—";
      $("#out_chloride_ml", container).textContent = "—";
    }

    $("#in_mmol", container).addEventListener("input", compute);
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
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function init() {
    styles();
    document.querySelectorAll(".ca-converter").forEach(ui);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
