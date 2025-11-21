// EDACS (Emergency Department Assessment of Chest pain Score) Calculator
// Clinical decision tool for low-risk chest pain

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => root.querySelectorAll(sel);

  function ui(container) {
    container.innerHTML = `
      <div class="mg-card">
        <div class="edacs-grid">
          <!-- Left Column: Inputs -->
          <div class="edacs-left">
            <!-- Age & Sex in one row -->
            <div class="edacs-compact-row">
              <div class="edacs-field-inline">
                <label class="edacs-label">Age</label>
                <input id="age" type="number" min="18" max="120" placeholder="Age">
              </div>
              <div class="edacs-field-inline">
                <label class="edacs-label">Sex</label>
                <div class="edacs-radio-group">
                  <label class="edacs-radio">
                    <input type="radio" name="sex" value="male">
                    <span>M</span>
                  </label>
                  <label class="edacs-radio">
                    <input type="radio" name="sex" value="female">
                    <span>F</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Risk Factors -->
            <div class="edacs-section">
              <label class="edacs-label-section">Risk Factors</label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="risk_known_cad">
                <span>Known CAD/CVD/PAD</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="risk_htn">
                <span>Hypertension</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="risk_hyperlipidemia">
                <span>Hyperlipidemia</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="risk_diabetes">
                <span>Diabetes</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="risk_smoking">
                <span>Smoking</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="risk_family_hx">
                <span>Family Hx premature CAD</span>
              </label>
            </div>

            <!-- Symptoms -->
            <div class="edacs-section">
              <label class="edacs-label-section">Symptoms</label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="symptom_diaphoresis">
                <span>Diaphoresis</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="symptom_radiates">
                <span>Radiates to arm/shoulder/neck/jaw</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="symptom_vomiting">
                <span>Vomiting</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="symptom_occurred">
                <span>Worse with inspiration</span>
              </label>
              <label class="edacs-checkbox">
                <input type="checkbox" id="symptom_palpable">
                <span>Reproducible on palpation</span>
              </label>
            </div>
          </div>

          <!-- Right Column: Results -->
          <div class="edacs-right">
            <div class="edacs-score-box">
              <div class="edacs-score-main">
                <div class="edacs-score-label">EDACS Score</div>
                <div class="edacs-score-value" id="total_score">—</div>
              </div>
              <div class="edacs-risk" id="risk_category">Enter details to calculate</div>
            </div>
            
            <div class="edacs-interpretation-box" id="interpretation">
              <p class="edacs-info">Complete age and sex to calculate score</p>
            </div>
          </div>
        </div>

        <div class="mg-footer">
          <small>
            <strong>Scoring:</strong> Age: &lt;50=2, 50-54=4, 55-59=6, 60-64=8, 65-69=10, 70-74=12, 75-79=14, ≥80=16 | Male=+6 | CAD/CVD/PAD=+8 | ≥3 risk factors=+4 (HTN, hyperlipidemia, DM, smoking, family Hx) | Diaphoresis=+3 | Radiates=+5 | Vomiting=+2 | Inspiration=-4 | Palpable=-6
          </small>
        </div>
      </div>
    `;

    function getAgePoints(age) {
      if (age < 50) return 2;
      if (age < 55) return 4;
      if (age < 60) return 6;
      if (age < 65) return 8;
      if (age < 70) return 10;
      if (age < 75) return 12;
      if (age < 80) return 14;
      return 16;
    }

    function calculate() {
      const age = parseInt($("#age", container).value);
      const sex = container.querySelector('input[name="sex"]:checked')?.value;
      
      if (!age || !sex) {
        clear();
        return;
      }

      let score = 0;

      // Age points
      score += getAgePoints(age);

      // Sex
      if (sex === 'male') score += 6;

      // Risk factors
      if ($("#risk_known_cad", container).checked) score += 8;
      
      // Count individual risk factors (≥3 = +4 points)
      let riskFactorCount = 0;
      if ($("#risk_htn", container).checked) riskFactorCount++;
      if ($("#risk_hyperlipidemia", container).checked) riskFactorCount++;
      if ($("#risk_diabetes", container).checked) riskFactorCount++;
      if ($("#risk_smoking", container).checked) riskFactorCount++;
      if ($("#risk_family_hx", container).checked) riskFactorCount++;
      if (riskFactorCount >= 3) score += 4;

      // Symptoms (positive)
      if ($("#symptom_diaphoresis", container).checked) score += 3;
      if ($("#symptom_radiates", container).checked) score += 5;
      if ($("#symptom_vomiting", container).checked) score += 2;

      // Symptoms (negative)
      if ($("#symptom_occurred", container).checked) score -= 4;
      if ($("#symptom_palpable", container).checked) score -= 6;

      // Display score
      $("#total_score", container).textContent = score;

      // Risk category and interpretation
      let category, interpretation, categoryClass;
      if (score < 16) {
        category = "Low Risk";
        categoryClass = "edacs-low";
        interpretation = `
          <p class="edacs-result-text edacs-low-text">
            <strong>✓ Low Risk</strong><br>
            30-day MACE &lt;1% when combined with negative ECG and troponins.
          </p>
        `;
      } else {
        category = "Not Low Risk";
        categoryClass = "edacs-high";
        interpretation = `
          <p class="edacs-result-text edacs-high-text">
            <strong>⚠ Not Low Risk</strong><br>
            Consider admission/observation with serial troponins.
          </p>
        `;
      }

      const categoryEl = $("#risk_category", container);
      categoryEl.textContent = category;
      categoryEl.className = `edacs-risk ${categoryClass}`;
      $("#interpretation", container).innerHTML = interpretation;
    }

    function clear() {
      $("#total_score", container).textContent = "—";
      $("#risk_category", container).textContent = "Enter details to calculate";
      $("#risk_category", container).className = "edacs-risk";
      $("#interpretation", container).innerHTML = '<p class="edacs-info">Complete age and sex to calculate score</p>';
    }

    // Event listeners
    $("#age", container).addEventListener("input", calculate);
    $$('input[name="sex"]', container).forEach(el => el.addEventListener("change", calculate));
    $$('input[type="checkbox"]', container).forEach(el => el.addEventListener("change", calculate));
  }

  function styles() {
    const css = `
      /* Two-column grid layout */
      .edacs-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      @media (max-width: 768px) {
        .edacs-grid {
          grid-template-columns: 1fr;
        }
      }
      
      /* Left column styling */
      .edacs-left {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .edacs-compact-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      .edacs-field-inline {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .edacs-field-inline input[type="number"] {
        padding: 0.4rem;
        border: 1px solid var(--md-default-fg-color--lighter);
        border-radius: 4px;
        background: var(--md-default-bg-color);
        color: var(--md-default-fg-color);
        font-size: 0.9rem;
      }
      .edacs-section {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        padding: 0.5rem;
        background: var(--md-default-bg-color);
        border: 1px solid var(--md-default-fg-color--lightest);
        border-radius: 4px;
      }
      .edacs-label {
        font-weight: 600;
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
      }
      .edacs-label-section {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }
      .edacs-radio-group {
        display: flex;
        gap: 0.5rem;
      }
      .edacs-radio {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        cursor: pointer;
        padding: 0.35rem 0.6rem;
        border: 1px solid var(--md-default-fg-color--lighter);
        border-radius: 4px;
        background: var(--md-default-bg-color);
        transition: all 0.2s;
        font-size: 0.85rem;
      }
      .edacs-radio:hover {
        background: var(--md-accent-fg-color--transparent);
      }
      .edacs-radio input[type="radio"] {
        margin: 0;
      }
      .edacs-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 0.4rem;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 3px;
        transition: background 0.2s;
        font-size: 0.85rem;
      }
      .edacs-checkbox:hover {
        background: var(--md-accent-fg-color--transparent);
      }
      .edacs-checkbox input[type="checkbox"] {
        margin-top: 0.2rem;
      }
      
      /* Right column styling */
      .edacs-right {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .edacs-score-box {
        background: var(--md-default-bg-color);
        border: 2px solid var(--md-accent-fg-color);
        border-radius: 6px;
        padding: 1rem;
      }
      .edacs-score-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .edacs-score-label {
        font-weight: 600;
        font-size: 1rem;
      }
      .edacs-score-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--md-accent-fg-color);
        font-family: monospace;
      }
      .edacs-risk {
        font-size: 0.95rem;
        font-weight: 500;
        padding: 0.5rem;
        border-radius: 4px;
        text-align: center;
      }
      .edacs-interpretation-box {
        background: var(--md-default-bg-color);
        border: 1px solid var(--md-default-fg-color--lightest);
        border-radius: 6px;
        padding: 1rem;
      }
      .edacs-info {
        margin: 0;
        opacity: 0.7;
        font-style: italic;
        font-size: 0.9rem;
      }
      .edacs-result-text {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.5;
      }
      .edacs-result-text strong {
        font-size: 1rem;
      }
      
      /* Risk category colors */
      .edacs-low {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .edacs-high {
        background: #ffebee;
        color: #c62828;
      }
      .edacs-low-text {
        color: #2e7d32;
      }
      .edacs-high-text {
        color: #c62828;
      }
      [data-md-color-scheme="slate"] .edacs-low {
        background: #1b5e20;
        color: #a5d6a7;
      }
      [data-md-color-scheme="slate"] .edacs-high {
        background: #b71c1c;
        color: #ffcdd2;
      }
      [data-md-color-scheme="slate"] .edacs-low-text {
        color: #a5d6a7;
      }
      [data-md-color-scheme="slate"] .edacs-high-text {
        color: #ffcdd2;
      }
      [data-md-color-scheme="slate"] .edacs-field-inline input[type="number"],
      [data-md-color-scheme="slate"] .edacs-radio,
      [data-md-color-scheme="slate"] .edacs-section {
        background: var(--md-code-bg-color);
      }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function init() {
    styles();
    document.querySelectorAll(".edacs-calculator").forEach(ui);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
