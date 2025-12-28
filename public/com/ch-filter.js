class ChFilter extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = /* html */ `
      <style>
        :host {
          display: block;
        }

        .filters {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        h3, h4 {
          font-size: 14px;
          margin: 0 0 6px;
          color: #6b7280;
          font-weight: 600;
        }

        h4 {
          font-size: 13px;
          margin-bottom: 8px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        input[type="checkbox"] {
          cursor: pointer;
        }

        label {
          font-size: 13px;
          color: #374151;
          cursor: pointer;
        }

        .range-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        input[type="range"] {
          width: 100%;
          cursor: pointer;
        }

        .range-value {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }
      </style>

      <div class="filters">
        <h3>Фильтер</h3>

        <div class="filter-group">
          <h4>Засвар төрөл</h4>
          <div id="subcat-options"></div>
          </div>
        </div>

        <div class="filter-group">
          <h4>Туршлага</h4>
          <div class="checkbox-item">
            <input type="checkbox" id="filter-experience-2" value="2" />
            <label for="filter-experience-2">2+ жил</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="filter-experience-5" value="5" />
            <label for="filter-experience-5">5+ жил</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="filter-experience-10" value="10" />
            <label for="filter-experience-10">10+ жил</label>
          </div>
        </div>

        <div class="range-group">
          <h4>Үнэлгээний хүрээ</h4>
          <input type="range" id="rating-range" min="1" max="5" step="0.1" value="3.0" />
          <div class="range-value">
            <span id="rating-range-value">3.0</span> одоос дээш
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Checkbox change event
    this.shadowRoot.addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        this.emitFilterChange();
      }
    });

    // Range input event
    const ratingRange = this.shadowRoot.querySelector("#rating-range");
    const ratingValue = this.shadowRoot.querySelector("#rating-range-value");

    if (ratingRange && ratingValue) {
      ratingRange.addEventListener("input", () => {
        ratingValue.textContent = ratingRange.value;
        this.emitFilterChange();
      });
    }
  }

  emitFilterChange() {
    const filterValues = this.getFilterValues();
    console.log("Emitting filter change:", filterValues);

    this.dispatchEvent(
      new CustomEvent("filter-changed", {
        detail: filterValues,
        bubbles: true,
        composed: true,
      })
    );
  }

  getFilterValues() {
    const filterValues = {
      budget: [], // subcategories
      experienceMin: "", // нэг утга
      ratingRange: 3.0,
    };

    // Динамик "Засвар төрөл" (name="subcat") checkbox-ууд
    this.shadowRoot
      .querySelectorAll('input[name="subcat"]:checked')
      .forEach((cb) => {
        filterValues.budget.push(cb.value);
      });

    // Туршлага (олон checkbox байж болох ч хамгийн ихийг нь min гэж үзье)
    const exp = Array.from(
      this.shadowRoot.querySelectorAll(
        'input[id^="filter-experience-"]:checked'
      )
    )
      .map((x) => Number(x.value))
      .filter(Number.isFinite);

    if (exp.length) filterValues.experienceMin = String(Math.max(...exp));

    // Rating range
    const ratingRange = this.shadowRoot.querySelector("#rating-range");
    if (ratingRange) filterValues.ratingRange = parseFloat(ratingRange.value);

    return filterValues;
  }

  setSubcategoryOptions(options = [], checkedValues = []) {
    const box = this.shadowRoot.querySelector("#subcat-options");
    if (!box) return;

    box.innerHTML = options
      .map((label) => {
        const checked = checkedValues.includes(label) ? "checked" : "";
        return `
      <div class="checkbox-item">
        <input type="checkbox" name="subcat" value="${label}" ${checked} />
        <label>${label}</label>
      </div>
    `;
      })
      .join("");
  }

  setRatingRange(value) {
    const r = this.shadowRoot.querySelector("#rating-range");
    const v = this.shadowRoot.querySelector("#rating-range-value");
    if (!r || !v) return;

    const num = Number(value);
    const safe = Number.isFinite(num) ? num : 3.0;
    r.value = String(safe);
    v.textContent = safe.toFixed(1);
  }

  setExperienceMin(value) {
    const v = String(value ?? "");
    const inputs = this.shadowRoot.querySelectorAll(
      'input[id^="filter-experience-"]'
    );
    inputs.forEach((el) => {
      el.checked = v !== "" && el.value === v;
    });
  }

  clearFilters() {
    this.shadowRoot
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    const ratingRange = this.shadowRoot.querySelector("#rating-range");
    const ratingValue = this.shadowRoot.querySelector("#rating-range-value");
    if (ratingRange && ratingValue) {
      ratingRange.value = "3.0";
      ratingValue.textContent = "3.0";
    }

    this.emitFilterChange();
  }
}

customElements.define("ch-filter", ChFilter);
