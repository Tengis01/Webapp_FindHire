// com/ch-mini-job-card.js
class ChMiniJobCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }
  static get observedAttributes() {
  return ["phone", "name", "rating", "jobs", "description"];
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
  padding: 10px 12px;          /* босоо + хэвтээ зайг ялгав */
  border-radius: 7px;         /* илүү зөөлөн */
  border: 1px solid #1f2937; ;
  background: #f3f4f6;        /* зөөлөн саарал */
  margin-top: 14px;
  color: #000000ff;
  cursor: pointer;

  font-size: 14px;             /* уншихад илүү сайн */
  font-weight: 500;

  transition: background 0.2s ease,
              transform 0.15s ease,
              box-shadow 0.15s ease;
}

    button.profile-btn:hover {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

button.profile-btn:active {
  transform: translateY(0);
  box-shadow: none;
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
          max-height: 85vh;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          overflow: hidden;

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
          margin-bottom: 4px;
          font-size: 20px;
        }

        .modal header {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }

        .modal .meta {
          color: #555;
          font-size: 14px;
        }

        .modal .desc {
          color: #374151;
          margin: 0 0 16px 0;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
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
          margin: 16px 0;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .socials a {
          margin-right: 16px;
          display: inline-block;
          padding: 8px 16px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 14px;
          transition: background 0.2s;
        }

        .socials a:hover {
          background: #e5e7eb;
        }

        h4 {
          margin-top: 20px;
          margin-bottom: 12px;
          font-size: 16px;
          color: #111;
        }

        .no-reviews {
          color: #9ca3af;
          font-style: italic;
        }

    .review p {
  margin: 0;
  color: #555;
  font-size: 14px;
  line-height: 1.5;

 
}
        .review:last-of-type {
          margin-bottom: 0;
        }
.reviews-container {
  max-height: 90px;
  overflow-y: auto;
  padding-right: 6px;

  display: flex;
  flex-direction: column;
  gap: 12px;

  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
.contact-info {
  margin: 10px 0;
  font-size: 15px;
  font-weight: 500;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.contact-info a {
  color: #111;
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}



/* Scrollbar – цэвэрхэн харагдана */
.reviews-container::-webkit-scrollbar {
  width: 6px;
}

.reviews-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.reviews-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.contact-info {
  margin: 12px 0;
  font-size: 15px;
  font-weight: 500;
}

.contact-info a {
  color: #111;
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}
.review {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f9fafb;
}
.review b {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: #111;
}

.review p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
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


        <button class="profile-btn">Мэдээлэл харах</button>
      </article>

      <div class="modal-backdrop">
        <div class="modal">
          <button class="close" aria-label="Close">✕</button>

          <header>
            <figure>${pic ? `<img src="${pic}" alt="${name}" />` : ""}</figure>
            <div>
              <h3>${name}</h3>
              <div class="meta">★ ${rating} · ${jobs}</div>
                ${phone ? `<div class="meta">📞 ${phone}</div>` : ""}

            </div>
          </header>

          ${description ? `<p class="desc">${description}</p>` : ""}
        
        
          <h4>Сэтгэгдлүүд</h4>
<div class="reviews-container">
  ${reviews.length === 0
      ? "<p class='no-reviews'>Сэтгэгдэл алга</p>"
      : reviews
          .map(
            (r) => `.
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