class ChMiniJobCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  static get observedAttributes() {
    return ["phone", "name", "rating", "jobs", "description", "reviews", "pic"];
  }

  attributeChangedCallback() {
    this.render();
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

  /* =========================
     RENDER HELPERS
     ========================= */

  renderHeader({ pic, name, rating, jobs, phone }) {
    return `
      <header>
        <figure>${pic ? `<img src="${pic}" alt="${name}" />` : ""}</figure>
        <div>
          <h3>${name}</h3>
          <div class="meta">★ ${rating} · ${jobs}</div>
          ${phone ? `<div class="meta">📞 ${phone}</div>` : ""}
        </div>
      </header>
    `;
  }

  renderReviews(reviews) {
    if (!reviews || reviews.length === 0) {
      return `<p class="no-reviews">Сэтгэгдэл алга</p>`;
    }

    return reviews
      .map(
        (r) => `
          <div class="review">
            <b>${r.user} ★${r.rating}</b>
            <p>${r.comment}</p>
            <p>${r.phone}</p>
          </div>
        `
      )
      .join("");
  }

  renderCard(headerHtml) {
    return `
      <article class="card">
        ${headerHtml}
        <button class="profile-btn">Мэдээлэл харах</button>
      </article>
    `;
  }

  renderModal({ headerHtml, description, reviewsHtml }) {
    return `
      <div class="modal-backdrop">
        <div class="modal">
          <button class="close" aria-label="Close">✕</button>

          ${headerHtml}

          ${description ? `<p class="desc">${description}</p>` : ""}

          <h4>Сэтгэгдлүүд</h4>
          <div class="reviews-container">
            ${reviewsHtml}
          </div>
        </div>
      </div>
    `;
  }

  /* =========================
     MAIN RENDER
     ========================= */

  render() {
    const data = {
      pic: this.getAttribute("pic") || "",
      name: this.getAttribute("name") || "Нэр оруулаагүй",
      rating: this.getAttribute("rating") || "0.0",
      jobs: this.getAttribute("jobs") || "0 🤝",
      description: this.getAttribute("description") || "",
      phone: this.getAttribute("phone") || "",
      reviews: JSON.parse(this.getAttribute("reviews") || "[]"),
    };

    const headerHtml = this.renderHeader(data);
    const reviewsHtml = this.renderReviews(data.reviews);

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; font-family: system-ui, sans-serif; }

        article.card {
          background:#fff;
          border-radius:13px;
          border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(0,0,0,.1);
          padding:16px;
        }

        header { display:flex; gap:12px; align-items:center; }
        figure {
          width:60px; height:60px; border-radius:10px;
          overflow:hidden; background:#111; margin:0;
        }
        figure img { width:100%; height:100%; object-fit:cover; }

        h3 { margin:0; font-size:18px; }
        .meta { color:#555; font-size:14px; }

        button.profile-btn {
          width:100%;
          margin-top:14px;
          padding:10px 12px;
          border-radius:7px;
          border:1px solid #1f2937;
          background:#f3f4f6;
          cursor:pointer;
          transition:.2s;
        }
        button.profile-btn:hover { background:#1f2937; color:#fff; }

        .modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);

  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.30s ease;
}

.modal-backdrop.active {
  opacity: 1;
  pointer-events: auto;
}

.modal {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  width: 90%;
  max-width: 420px;

  transform: scale(0.88) translateY(10px);
  opacity: 0;
  transition:
    transform 0.30s ease,
    opacity 0.30s ease;
}

.modal-backdrop.active .modal {
  transform: scale(1) translateY(0);
  opacity: 1;
}

    
        .close {
          position:absolute; top:12px; right:16px;
          background:none; border:none;
          font-size:24px; cursor:pointer;
        }

        .desc {
          margin:12px 0;
          padding-bottom:12px;
          border-bottom:1px solid #e5e7eb;
        }

        h4 { margin:16px 0 10px; }

        .reviews-container {
          max-height:90px;
          overflow-y:auto;
          display:flex;
          flex-direction:column;
          gap:12px;
        }

        .review {
          padding:8px 10px;
          background:#f9fafb;
          border-radius:8px;
        }

        .review b { display:block; margin-bottom:4px; }
        .review p { margin:0; font-size:14px; color:#555; }

        .no-reviews { color:#9ca3af; font-style:italic; }
      </style>

      ${this.renderCard(headerHtml)}
      ${this.renderModal({
        headerHtml,
        description: data.description,
        reviewsHtml,
      })}
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
