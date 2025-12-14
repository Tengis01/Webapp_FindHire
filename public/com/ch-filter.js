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

        <div class="filter-group">
          <h4>Засвар төрөл</h4>
          <div class="checkbox-item">
            <input type="checkbox" id="filter-budget-paint" value="paint" />
            <label for="filter-budget-paint">Будаг</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="filter-budget-wall-ceiling" value="wall-ceiling" />
            <label for="filter-budget-wall-ceiling">Хана, Тааз Засвар</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="filter-budget-floor" value="floor" />
            <label for="filter-budget-floor">Шал Засвар</label>
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
    
    this.dispatchEvent(new CustomEvent("filter-changed", {
      detail: filterValues,
      bubbles: true,
      composed: true
    }));
  }

  getFilterValues() {
    const filterValues = {
      rating: [],
      experience: [],
      budget: [],
      ratingRange: 3.0
    };

    // Rating checkboxes
    this.shadowRoot.querySelectorAll('input[id^="filter-rating-"]:checked').forEach((checkbox) => {
      filterValues.rating.push(checkbox.value);
    });

    // Experience checkboxes
    this.shadowRoot.querySelectorAll('input[id^="filter-experience-"]:checked').forEach((checkbox) => {
      filterValues.experience.push(checkbox.value);
    });

    // Budget/type checkboxes
    this.shadowRoot.querySelectorAll('input[id^="filter-budget-"]:checked').forEach((checkbox) => {
      filterValues.budget.push(checkbox.value);
    });

    // Rating range
    const ratingRange = this.shadowRoot.querySelector("#rating-range");
    if (ratingRange) {
      filterValues.ratingRange = parseFloat(ratingRange.value);
    }

    return filterValues;
  }

  clearFilters() {
    this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
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