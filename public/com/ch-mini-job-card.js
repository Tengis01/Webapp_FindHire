// com/ch-mini-job-card.js
class ChMiniJobCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  openModal() {
    this.modal.classList.add("active");
    document.addEventListener("keydown", this.onKeyDown);
  }

  closeModal() {
    this.modal.classList.remove("active");
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown(e) {
    if (e.key === "Escape") this.closeModal();
  }

  render() {
    const pic = this.getAttribute("pic") || "";
    const name = this.getAttribute("name") || "Нэр оруулаагүй";
    const rating = this.getAttribute("rating") || "0.0";
    const jobs = this.getAttribute("jobs") || "0 🤝";
    const description = this.getAttribute("description") || "";
    const phone = this.getAttribute("phone") || "";
    const facebook = this.getAttribute("facebook") || "";
    const instagram = this.getAttribute("instagram") || "";
    const reviews = JSON.parse(this.getAttribute("reviews") || "[]");

    this.shadowRoot.innerHTML = /* html */ `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
        }

        article.card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 25px rgba(0,0,0,.1);
          padding: 16px;
          position: relative;
        }

        header {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        figure {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          overflow: hidden;
          background: #111;
          margin: 0;
        }

        figure img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        h3 {
          margin: 0;
          font-size: 18px;
        }

        .meta {
          color: #555;
          font-size: 14px;
        }

        .desc {
          margin: 10px 0;
          color: #374151;
        }

        button.profile-btn {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          border: none;
          background: #111827;
          color: #fff;
          cursor: pointer;
          font-size: 15px;
        }

        button.profile-btn:hover {
          background: #1f2937;
        }

        /* MODAL */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.5);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .modal-backdrop.active {
          display: flex;
        }

        .modal {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          width: 90%;
          max-width: 420px;
          position: relative;
          max-height: 85vh;
          overflow-y: auto;
        }

        .close {
          position: absolute;
          top: 12px;
          right: 16px;
          border: none;
          background: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          line-height: 1;
        }

        .close:hover {
          color: #111;
        }

        .modal h3 {
          margin-top: 0;
          margin-bottom: 8px;
        }

        .modal p {
          margin: 8px 0;
        }

        .modal a {
          color: #2563eb;
          text-decoration: none;
        }

        .modal a:hover {
          text-decoration: underline;
        }

        .socials {
          margin: 12px 0;
        }

        .socials a {
          margin-right: 12px;
          display: inline-block;
        }

        h4 {
          margin-top: 20px;
          margin-bottom: 10px;
          font-size: 16px;
        }

        .review {
          border-top: 1px solid #eee;
          margin-top: 12px;
          padding-top: 12px;
        }

        .review:first-of-type {
          margin-top: 8px;
        }

        .review b {
          display: block;
          margin-bottom: 4px;
        }

        .review p {
          margin: 4px 0 0 0;
          color: #555;
        }
      </style>

      <article class="card">
        <header>
          <figure>${pic ? `<img src="${pic}" alt="${name}" />` : ""}</figure>
          <div>
            <h3>${name}</h3>
            <div class="meta">★ ${rating} · ${jobs}</div>
          </div>
        </header>

        <p class="desc">${description}</p>

        <button class="profile-btn">Профайл харах</button>
      </article>

      <div class="modal-backdrop">
        <div class="modal">
          <button class="close" aria-label="Close">✕</button>

          <h3>${name}</h3>
          <p>★ ${rating} · ${jobs}</p>

          ${phone ? `<p>📞 <a href="tel:${phone}">${phone}</a></p>` : ""}

          ${facebook || instagram ? `
            <div class="socials">
              ${facebook ? `<a href="${facebook}" target="_blank" rel="noopener">Facebook</a>` : ""}
              ${instagram ? `<a href="${instagram}" target="_blank" rel="noopener">Instagram</a>` : ""}
            </div>
          ` : ""}

          <h4>Сэтгэгдлүүд</h4>
          ${
            reviews.length === 0
              ? "<p>Сэтгэгдэл алга</p>"
              : reviews
                  .map(
                    (r) => `
                <div class="review">
                  <b>${r.user} ★${r.rating}</b>
                  <p>${r.comment}</p>
                </div>
              `
                  )
                  .join("")
          }
        </div>
      </div>
    `;

    this.modal = this.shadowRoot.querySelector(".modal-backdrop");
    this.openBtn = this.shadowRoot.querySelector(".profile-btn");
    this.closeBtn = this.shadowRoot.querySelector(".close");

    this.openBtn.onclick = this.openModal;
    this.closeBtn.onclick = this.closeModal;
    this.modal.onclick = (e) => e.target === this.modal && this.closeModal();
  }
}

customElements.define("ch-mini-job-card", ChMiniJobCard);