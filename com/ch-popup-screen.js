// com/ch-popup-screen.js
class ChPopupScreen extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });

    root.innerHTML = /* html */ `
      <style>
        :host {
          box-sizing: border-box;
          position: fixed;
          inset: 0;
          display: flex;                    /* үргэлж flex, харин харагдах/үл харагдахыг opacity-оор барина */
          align-items: center;
          justify-content: center;
          z-index: 40;

          opacity: 0;
          pointer-events: none;             /* хаалттай үед дарж болохгүй */
          background: rgba(15, 23, 42, 0);  /* background байхгүй мэт */

          transition:
            opacity 0.25s ease-out,
            background-color 0.25s ease-out;
        }

        :host([open]) {
          opacity: 1;
          pointer-events: auto;
          background: rgba(15, 23, 42, 0.45);  /* харанхуй маск аажуухан гараад ирнэ */
        }

        .wrapper {
          width: min(1100px, 100% - 32px);
          height: 640px;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.25);
          overflow: hidden;
          display: flex;

          transform: translateY(16px) scale(0.97);   /* эхэндээ доошоо, жаахан жижиг */
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
        }

        aside.filters::before {
          content: "Фильтер (дараа хийх)";
          font-size: 14px;
          color: #9ca3af;
        }

        section.mini_profile {
          flex: 1;
          min-width: 0;
          padding: 16px 20px;
          box-sizing: border-box;
          background: #ffffff;

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
        <aside class="filters"></aside>

        <section class="mini_profile" aria-label="Ажилчдын профайл">
          <slot></slot>
        </section>
      </div>
    `;
  }

  open() {
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
  }
}

customElements.define("ch-popup-screen", ChPopupScreen);
