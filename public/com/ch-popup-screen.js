// com/ch-popup-screen.js
class ChPopupScreen extends HTMLElement {
  constructor() {
    super();

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = /* html */ `
      <style>
        :host {
          font-family: inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          box-sizing: border-box;
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 40;
          opacity: 0;
          pointer-events: none;
          background: rgba(15, 23, 42, 0);
          transition:
            opacity 0.25s ease-out,
            background-color 0.25s ease-out;
        }

        :host([open]) {
          opacity: 1;
          pointer-events: auto;
          background: rgba(15, 23, 42, 0.45);
        }

        .wrapper {
          width: min(1100px, 100% - 32px);
          height: 640px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.25);
          overflow: hidden;
          display: flex;
          transform: translateY(16px) scale(0.97);
          opacity: 0.9;
          transition:
            transform 0.24s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.24s ease-out;
        }

        :host([open]) .wrapper {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        aside.filters {
          width: 260px;
          background: #f9fafb;
          border-right: 1px solid #e5e7eb;
          padding: 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        section.mini_profile {
          flex: 1;
          min-width: 0;
          padding: 16px 20px;
          box-sizing: border-box;
          background: #fff;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          grid-auto-rows: auto;
          gap: 12px;
          overflow-y: auto;
          align-content: flex-start;
        }

        ::slotted(ch-mini-job-card) {
          height: auto;
        }

        @media (max-width: 900px) {
          section.mini_profile {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .wrapper {
            width: min(1100px, 100vw - 24px);
            max-height: 90vh;
          }

          aside.filters {
            width: 240px;
          }

          section.mini_profile {
            padding: 14px 16px;
            gap: 14px;
          }
        }

        @media (max-width: 640px) {
          .wrapper {
            flex-direction: column;
            height: auto;
            max-height: 90vh;
          }
          aside.filters {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            max-height: 40vh;
            overflow-y: auto; /* Enable vertical scrolling */
          }
          section.mini_profile {
            grid-template-columns: 1fr;
            height: auto;
            max-height: 50vh;
          }
        }

        @media (max-width: 480px) {
          .wrapper {
            width: calc(100vw - 16px);
          }

          aside.filters {
            padding: 14px;
          }

          section.mini_profile {
            padding: 12px;
            gap: 12px;
          }
        }
      </style>

      <div class="wrapper" role="dialog" aria-modal="true">
        <aside class="filters">
          <ch-filter></ch-filter>
        </aside>

        <section class="mini_profile" aria-label="Ажилчдын профайл">
          <slot></slot>
        </section>
      </div>
    `;

    this.wrapper = this.shadowRoot.querySelector(".wrapper");
    this.filterComponent = null;

    // Backdrop click handler
    this.addEventListener("click", (e) => {
      const path = e.composedPath();
      const clickedInsideWrapper = path.includes(this.wrapper);

      if (!clickedInsideWrapper) {
        this.close();
      }
    });

    // Filter changed event listener
    this.addEventListener('filter-changed', (e) => {
      console.log("Filter changed in popup:", e.detail);
    });

    // Sort changed event listener
    this.addEventListener('sort-changed', (e) => {
      console.log("Sort changed in popup:", e.detail);
    });
  }

  connectedCallback() {
    // Component DOM-д нэмэгдсэний дараа filter component-ийг олох
    requestAnimationFrame(() => {
      this.filterComponent = this.shadowRoot.querySelector("ch-filter");
      if (this.filterComponent) {
        console.log("Filter component found:", this.filterComponent);
      } else {
        console.warn("Filter component not found in shadow DOM");
      }
    });
  }

  // Public method - filter утгуудыг авах
  getFilterValues() {
    // Filter component-ийг дахин шалгах
    if (!this.filterComponent) {
      this.filterComponent = this.shadowRoot.querySelector("ch-filter");
    }

    if (!this.filterComponent) {
      console.warn("Filter component not found");
      return {
        rating: [],
        experience: [],
        budget: [],
        ratingRange: 3.0
      };
    }

    // getFilterValues method байгаа эсэхийг шалгах
    if (typeof this.filterComponent.getFilterValues !== 'function') {
      console.error("getFilterValues method not found on filter component");
      return {
        rating: [],
        experience: [],
        budget: [],
        ratingRange: 3.0
      };
    }

    const values = this.filterComponent.getFilterValues();
    console.log("Got filter values:", values);
    return values;
  }

  open() {
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
  }
}

customElements.define("ch-popup-screen", ChPopupScreen);