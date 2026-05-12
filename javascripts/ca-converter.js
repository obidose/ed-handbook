// Calcium converter for clinical use
// Convert between different calcium preparations and units

(() => {
  // Standard preparation specifications
  const PREPS = {
    gluconate: {
      name: "Calcium Gluconate 10%",
      mmolPerML: 0.223,  // 2.23 mmol Ca²⁺ in 10 mL
      mgPerML: 9.3,      // elemental calcium
      vialML: 10
    },
    chloride: {
      name: "Calcium Chloride 10%",
      mmolPerML: 0.68,   // 6.8 mmol Ca²⁺ in 10 mL
      mgPerML: 27.2,     // elemental calcium
      vialML: 10
    }
  };

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
        <!-- Input Section -->
        <div class="ca-input-section">
          <label class="ca-section-label">📝 Enter dose (choose one)</label>
          
          <div class="ca-input-grid">
            <div class="mg-row">
              <input id="in_mmol" type="number" step="0.01" placeholder="e.g., 4.5">
              <span class="mg-unit">mmol Ca²⁺</span>
            </div>
            
            <div class="mg-row">
              <input id="in_mg" type="number" step="1" placeholder="e.g., 180">
              <span class="mg-unit">mg elemental calcium</span>
            </div>
            
            <div class="mg-row">
              <input id="in_gluconate_ml" type="number" step="0.1" placeholder="e.g., 10">
              <span class="mg-unit">mL Gluconate 10%</span>
            </div>
            
            <div class="mg-row">
              <input id="in_chloride_ml" type="number" step="0.1" placeholder="e.g., 10">
              <span class="mg-unit">mL Chloride 10%</span>
            </div>
          </div>
        </div>

        <!-- Output Sections -->
        <div class="ca-output-container">
          <div class="ca-output-section">
            <label class="ca-section-label">🎯 Equivalent Doses</label>
            <div class="mg-results">
              <div class="mg-result-row">
                <span class="mg-label">mmol Ca²⁺:</span>
                <span class="mg-value" id="out_mmol">—</span>
              </div>
              <div class="mg-result-row">
                <span class="mg-label">mg elemental Ca:</span>
                <span class="mg-value" id="out_mg">—</span>
              </div>
            </div>
          </div>

          <div class="ca-output-section">
            <label class="ca-section-label">💊 Calcium Gluconate 10%</label>
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

          <div class="ca-output-section">
            <label class="ca-section-label">💊 Calcium Chloride 10%</label>
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
            💡 <strong>Standard preparations:</strong><br>
            • <strong>Calcium Gluconate 10%:</strong> 2.23 mmol Ca²⁺ (93 mg) in 10 mL (0.223 mmol/mL)<br>
            • <strong>Calcium Chloride 10%:</strong> 6.8 mmol Ca²⁺ (272 mg) in 10 mL (0.68 mmol/mL)<br>
            <em>Note: mmol refers to calcium ions (Ca²⁺)</em>
          </small>
        </div>
      </div>
    `;

    let computing = false;

    function compute(sourceId) {
      if (computing) return;
      computing = true;

      // Clear other inputs
      const inputs = ["in_mmol", "in_mg", "in_gluconate_ml", "in_chloride_ml"];
      inputs.forEach(id => {
        if (id !== sourceId) {
          $("#" + id, container).value = "";
        }
      });

      // Get the source value
      const sourceValue = num($("#" + sourceId, container).value);

      if (sourceValue === null || sourceValue <= 0) {
        clear();
        computing = false;
        return;
      }

      // Convert to mmol Ca²⁺
      let mmol_ca;
      switch (sourceId) {
        case "in_mmol":
          mmol_ca = sourceValue;
          break;
        case "in_mg":
          mmol_ca = sourceValue / 40.08; // Atomic weight of calcium
          break;
        case "in_gluconate_ml":
          mmol_ca = sourceValue * PREPS.gluconate.mmolPerML;
          break;
        case "in_chloride_ml":
          mmol_ca = sourceValue * PREPS.chloride.mmolPerML;
          break;
      }

      // Calculate all outputs
      const mg_ca = mmol_ca * 40.08;

      // Gluconate calculations
      const ml_gluconate = mmol_ca / PREPS.gluconate.mmolPerML;
      const vials_gluconate = Math.ceil(ml_gluconate / PREPS.gluconate.vialML);

      // Chloride calculations
      const ml_chloride = mmol_ca / PREPS.chloride.mmolPerML;
      const vials_chloride = Math.ceil(ml_chloride / PREPS.chloride.vialML);

      // Update outputs
      $("#out_mmol", container).textContent = fmt(mmol_ca, 2) + " mmol";
      $("#out_mg", container).textContent = fmt(mg_ca, 0) + " mg";

      $("#out_gluconate_vials", container).textContent = vials_gluconate;
      $("#out_gluconate_ml", container).textContent = fmt(ml_gluconate, 1) + " mL";
      
      $("#out_chloride_vials", container).textContent = vials_chloride;
      $("#out_chloride_ml", container).textContent = fmt(ml_chloride, 1) + " mL";

      computing = false;
    }

    function clear() {
      $("#out_mmol", container).textContent = "—";
      $("#out_mg", container).textContent = "—";
      $("#out_gluconate_vials", container).textContent = "—";
      $("#out_gluconate_ml", container).textContent = "—";
      $("#out_chloride_vials", container).textContent = "—";
      $("#out_chloride_ml", container).textContent = "—";
    }

    // Add event listeners to all inputs
    $("#in_mmol", container).addEventListener("input", () => compute("in_mmol"));
    $("#in_mg", container).addEventListener("input", () => compute("in_mg"));
    $("#in_gluconate_ml", container).addEventListener("input", () => compute("in_gluconate_ml"));
    $("#in_chloride_ml", container).addEventListener("input", () => compute("in_chloride_ml"));
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
      
      /* Input Section */
      .ca-input-section {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid var(--md-default-fg-color--lightest);
      }
      .ca-section-label {
        display: block;
        font-weight: 600;
        margin-bottom: 1rem;
        font-size: 1.1rem;
      }
      .ca-input-grid {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      
      /* Output Container */
      .ca-output-container {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        margin-bottom: 1rem;
      }
      .ca-output-section {
        min-width: 0; /* Prevent grid overflow */
      }
      
      /* Common row styling */
      .mg-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .mg-row input {
        flex: 1;
        min-width: 0; /* Prevent overflow */
        padding: 0.5rem;
        border: 1px solid var(--md-default-fg-color--lighter);
        border-radius: 4px;
        background: var(--md-default-bg-color);
        color: var(--md-default-fg-color);
        font-size: 0.9rem;
      }
      .mg-unit {
        flex: 0 0 auto;
        white-space: nowrap;
        font-size: 0.85rem;
        opacity: 0.8;
      }
      
      /* Results styling */
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
        gap: 1rem;
      }
      .mg-result-row:last-child {
        border-bottom: none;
      }
      .mg-label {
        font-weight: 500;
        opacity: 0.9;
        white-space: nowrap;
      }
      .mg-value {
        font-weight: 600;
        color: var(--md-accent-fg-color);
        font-family: monospace;
        text-align: right;
        white-space: nowrap;
      }
      .mg-highlight {
        background: var(--md-accent-fg-color--transparent);
        margin: 0.5rem -0.5rem 0;
        padding: 0.6rem 0.5rem !important;
        border-radius: 4px;
      }
      
      /* Footer */
      .mg-footer {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid var(--md-default-fg-color--lightest);
        opacity: 0.8;
      }
      
      /* Dark mode support */
      [data-md-color-scheme="slate"] .mg-row input {
        background: var(--md-code-bg-color);
      }
    `;
    if (document.getElementById("ed-handbook-ca-converter-styles")) return;
    const style = document.createElement("style");
    style.id = "ed-handbook-ca-converter-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function boot() {
    styles();
    document.querySelectorAll(".ca-converter").forEach(ui);
  }

  if (typeof document$ !== "undefined" && document$ && typeof document$.subscribe === "function") {
    document$.subscribe(boot);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
