class ChFilter extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = /* html */ `
      <style>
        :host {
          display: block;
          font-family: 'Inter', sans-serif;
          height: 100%;
          overflow: hidden;
        }

        .filters {
          display: flex;
          flex-direction: column;
          gap: 24px;
          background: #fff;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          height: 100%;
          box-sizing: border-box;
          overflow-y: auto;
        }

        h3 {
          font-size: 16px;
          margin: 0 0 12px;
          color: #111827;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .clear-btn {
          font-size: 12px;
          color: #EF4444;
          cursor: pointer;
          font-weight: 500;
          display: none;
        }
        
        .clear-btn:hover {
          text-decoration: underline;
        }

        h4 {
          font-size: 14px;
          margin: 0 0 12px;
          color: #374151;
          font-weight: 600;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 20px;
        }
        
        .filter-group:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        input[type="checkbox"] {
          cursor: pointer;
          width: 16px;
          height: 16px;
          accent-color: #2563EB;
          border-radius: 4px;
        }

        label {
          font-size: 14px;
          color: #4B5563;
          cursor: pointer;
          user-select: none;
        }
        
        label:hover {
          color: #111827;
        }

        .range-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input[type="range"] {
          width: 100%;
          cursor: pointer;
          accent-color: #2563EB;
        }

        .range-value {
          font-size: 14px;
          color: #4B5563;
          font-weight: 500;
          display: flex;
          justify-content: space-between;
        }
        
        .rating-num {
          color: #2563EB;
          font-weight: 700;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .filters {
            padding: 18px;
            gap: 22px;
          }

          input[type="checkbox"] {
            width: 20px;
            height: 20px;
          }

          label {
            font-size: 15px;
            padding: 4px 0;
          }

          .checkbox-item {
            gap: 12px;
            padding: 2px 0;
          }

          h4 {
            font-size: 15px;
          }

          input[type="range"] {
            height: 8px;
          }
        }

        @media (max-width: 480px) {
          .filters {
            padding: 16px;
            gap: 20px;
          }

          h3 {
            font-size: 15px;
          }

          input[type="checkbox"] {
            width: 22px;
            height: 22px;
          }

          label {
            font-size: 16px;
          }

          .checkbox-item {
            min-height: 44px;
            align-items: center;
          }
        }
      </style>

      <div class="filters">
        <h3>
          Шүүлтүүр
          <span class="clear-btn" id="clear-btn">Цэвэрлэх</span>
        </h3>

        <div class="filter-group" id="subcat-group" style="display: none;">
          <h4>Засвар төрөл</h4>
          <div id="subcat-options"></div>
        </div>

        <div class="filter-group">
          <h4>Чөлөөт цаг (Боломжтой өдөр)</h4>
          <div class="checkbox-item"><input type="checkbox" name="availability" value="Даваа" id="day-1"><label for="day-1">Даваа</label></div>
          <div class="checkbox-item"><input type="checkbox" name="availability" value="Мягмар" id="day-2"><label for="day-2">Мягмар</label></div>
          <div class="checkbox-item"><input type="checkbox" name="availability" value="Лхагва" id="day-3"><label for="day-3">Лхагва</label></div>
          <div class="checkbox-item"><input type="checkbox" name="availability" value="Пүрэв" id="day-4"><label for="day-4">Пүрэв</label></div>
          <div class="checkbox-item"><input type="checkbox" name="availability" value="Баасан" id="day-5"><label for="day-5">Баасан</label></div>
          <div class="checkbox-item"><input type="checkbox" name="availability" value="Бямба" id="day-6"><label for="day-6">Бямба</label></div>
          <div class="checkbox-item"><input type="checkbox" name="availability" value="Ням" id="day-7"><label for="day-7">Ням</label></div>
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

        <div class="range-group filter-group">
          <h4>Үнэлгээний хүрээ</h4>
          <input type="range" id="rating-range" min="1" max="5" step="0.5" value="3" />
          <div class="range-value">
            <span>Доод тал нь:</span>
            <span class="rating-num"><span id="rating-range-value">3.0</span> ★</span>
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
        this.toggleClearButton();
      }
    });

    // Range input event
    const ratingRange = this.shadowRoot.querySelector("#rating-range");
    const ratingValue = this.shadowRoot.querySelector("#rating-range-value");

    if (ratingRange && ratingValue) {
      ratingRange.addEventListener("input", () => {
        ratingValue.textContent = ratingRange.value;
        this.emitFilterChange();
        this.toggleClearButton();
      });
    }

    // Clear btn
    const clearBtn = this.shadowRoot.querySelector("#clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearFilters();
      });
    }
  }

  toggleClearButton() {
    // Optional: Logic to show/hide clear button if any filter is active
    const clearBtn = this.shadowRoot.querySelector("#clear-btn");
    if (clearBtn) clearBtn.style.display = 'block';
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
      availability: [],
      experienceMin: "",
      ratingRange: 3.0,
    };

    // Динамик "Засвар төрөл" (name="subcat") checkbox-ууд
    this.shadowRoot
      .querySelectorAll('input[name="subcat"]:checked')
      .forEach((cb) => {
        filterValues.budget.push(cb.value);
      });

    // Availability
    this.shadowRoot
      .querySelectorAll('input[name="availability"]:checked')
      .forEach((cb) => {
        filterValues.availability.push(cb.value);
      });

    // Туршлага
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
    const group = this.shadowRoot.querySelector("#subcat-group");
    if (!box || !group) return;

    if (!options || options.length === 0) {
      group.style.display = "none";
      box.innerHTML = "";
      return;
    }

    group.style.display = "flex";
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

    // Re-attach listeners for new dynamic inputs
    box.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', () => {
        this.emitFilterChange();
        this.toggleClearButton();
      });
    });
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

    // Hide clear button
    const clearBtn = this.shadowRoot.querySelector("#clear-btn");
    if (clearBtn) clearBtn.style.display = 'none';
  }
}

customElements.define("ch-filter", ChFilter);
