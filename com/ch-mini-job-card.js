// com/ch-mini-job-card.js
class ChMiniJobCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const pic = this.getAttribute("pic") || "";
    const name = this.getAttribute("name") || "Нэр оруулаагүй";
    const rating = this.getAttribute("rating") || "0.0";
    const jobs = this.getAttribute("jobs") || "0 🤝";
    const description =
      this.getAttribute("description") || "Тайлбар оруулаагүй.";

    this.shadowRoot.innerHTML = /* html */ `
      <style>
        :host {
          display: block;
          height: auto;             /* grid мөрийг хүчээр сунгахгүй */
          font-family: system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        article.card {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 15px 35px rgba(15, 23, 42, 0.10);
          padding: 12px 14px 8px;
          display: flex;
          position: relative;
          flex-direction: column;
          padding-bottom: 36px; 
        }

        header.top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        figure.avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #111827;
          margin: 0;
          flex-shrink: 0;
          overflow: hidden;
        }

        figure.avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        h3.name {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }

        p.meta {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }

        p.meta span.star {
          color: #fbbf24;
          margin-right: 4px;
        }

        hr {
          border: 0;
          border-top: 1px solid #e5e7eb;
          margin: 10px -4px 8px;
        }

                .desc-wrapper {
          position: relative;
          font-size: 14px;
          color: #374151;
          line-height: 1.5;
          max-height: 70px;
          overflow: hidden;
          transition: max-height 0.2s ease;
          margin-bottom: 0;       /* доош суманд зай үлдээгээд байна гэж үгүй болгоё */
        }

        :host([expanded]) .desc-wrapper {
          max-height: 200px;
          overflow-y: auto;
        }

        .desc-wrapper p {
          margin: 0;
        }

        button.toggle {
          position: absolute;     /* картын дотор тогтмол байрлалтай болно */
          left: 50%;
          bottom: 10px;
          transform: translateX(-50%);
          border: none;
          background: none;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          color: #4b5563;
          padding: 0;
        }

        button.toggle:hover {
          color: #111827;
        }

      </style>

      <article class="card">
        <header class="top">
          <figure class="avatar">
            ${pic ? `<img src="${pic}" alt="${name} зураг" />` : ""}
          </figure>
          <section>
            <h3 class="name">${name}</h3>
            <p class="meta">
              <span class="star">★</span>${rating}
              &nbsp;&nbsp;${jobs}
            </p>
          </section>
        </header>

        <hr />

        <div class="desc-wrapper">
          <p>${description}</p>
        </div>

        <button class="toggle" type="button" aria-label="Дэлгэрүүлэх">
          ▼
        </button>
      </article>
    `;

    const button = this.shadowRoot.querySelector("button.toggle");
    button.addEventListener("click", () => {
      const expanded = this.hasAttribute("expanded");
      if (expanded) {
        this.removeAttribute("expanded");
        button.textContent = "▼";
      } else {
        this.setAttribute("expanded", "");
        button.textContent = "▲";
      }
    });
  }
}

customElements.define("ch-mini-job-card", ChMiniJobCard);
