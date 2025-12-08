// com/ch-popup-screen.js
class ChPopupScreen extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = /* html */ `
      <style>
        :host {
        @import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap");

         font-family: inter,system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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

        aside.filters h3 {
          font-size: 14px;
          margin: 0 0 6px;
          color: #6b7280;
        }

        aside.filters input,
        aside.filters select {
          width:90%;
          padding: 8px 10px;
          font-size: 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fff;
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

        @media (max-width: 640px) {
          .wrapper {
            flex-direction: column;
            height: auto;
          }
          aside.filters {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
          section.mini_profile {
            grid-template-columns: 1fr;
            height: 420px;
          }
        }
      </style>

      <div class="wrapper" role="dialog" aria-modal="true">
        <aside class="filters">
          <h3>Фильтер</h3>

          <input type="text" id="filter-name" placeholder="Нэрээр хайх..." />

          <select id="filter-rating">
            <option value="">Үнэлгээ</option>
            <option value="4.5">4.5+</option>
            <option value="4.0">4.0+</option>
            <option value="3.5">3.5+</option>
          </select>

          <select id="filter-experience">
            <option value="">Туршлага</option>
            <option value="2">2+ жил</option>
            <option value="5">5+ жил</option>
            <option value="10">10+ жил</option>
          </select>
        </aside>

        <section class="mini_profile" aria-label="Ажилчдын профайл">
          <slot></slot>
        </section>
      </div>
    `;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this.shadowRoot.addEventListener('click', (e) => {
      this.close();
    });
  }

  open() { this.setAttribute("open", ""); }
  close() { this.removeAttribute("open"); }
}

customElements.define("ch-popup-screen", ChPopupScreen);
