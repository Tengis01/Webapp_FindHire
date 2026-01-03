// com/ch-mini-job-card.js
class ChMiniJobCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
  }

  static get observedAttributes() {
    return ["phone", "name", "rating", "jobs", "description", "pic", "facebook", "instagram", "reviews"];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.onKeyDown);
    // Clean up event listeners
    if (this.openBtn) {
      this.openBtn.removeEventListener('click', this.openModal);
    }
    if (this.closeBtn) {
      this.closeBtn.removeEventListener('click', this.closeModal);
    }
    if (this.modal) {
      this.modal.removeEventListener('click', this.handleBackdropClick);
    }
  }

  openModal() {
    this.modal.classList.add("active");
    document.addEventListener("keydown", this.onKeyDown);
    
    // Focus management for accessibility
    const firstFocusable = this.shadowRoot.querySelector('.close');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove("active");
    document.removeEventListener("keydown", this.onKeyDown);
    
    // Return focus to trigger button
    if (this.openBtn) {
      this.openBtn.focus();
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  handleBackdropClick(e) {
    if (e.target === this.modal) {
      this.closeModal();
    }
  }

  onKeyDown(e) {
    if (e.key === "Escape") {
      this.closeModal();
    }
  }

  // Sanitize text content to prevent XSS
  sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    const pic = this.getAttribute("pic") || "";
    const name = this.sanitizeText(this.getAttribute("name") || "Нэр оруулаагүй");
    const rating = this.sanitizeText(this.getAttribute("rating") || "0.0");
    const jobs = this.sanitizeText(this.getAttribute("jobs") || "0 🤝");
    const description = this.sanitizeText(this.getAttribute("description") || "");
    const phone = this.getAttribute("phone") || ""; // Don't sanitize yet, check if exists first
    const facebook = this.getAttribute("facebook") || "";
    const instagram = this.getAttribute("instagram") || "";
    
    let reviews = [];
    try {
      reviews = JSON.parse(this.getAttribute("reviews") || "[]");
    } catch (e) {
      console.error('Invalid reviews JSON:', e);
    }
    
    // Debug: log phone value
    console.log('Phone attribute:', phone);

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
          flex-shrink: 0;
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
          padding: 10px 12px;
          border-radius: 7px;
          border: 1px solid #1f2937;
          background: #f3f4f6;
          margin-top: 14px;
          color: #000000ff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s ease,
                      transform 0.15s ease,
                      box-shadow 0.15s ease;
        }

        button.profile-btn:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        button.profile-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }

        button.profile-btn:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
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
          padding: 16px;
        }

        .modal-backdrop.active {
          display: flex;
        }

        .modal {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
          max-height: 85vh;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
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
          padding: 4px;
          border-radius: 4px;
        }

        .close:hover {
          color: #111;
          background: #f3f4f6;
        }

        .close:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
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
          color: #555;
          font-size: 14px;
          line-height: 1.5;
        }

        .reviews-container {
          max-height: 200px;
          overflow-y: auto;
          padding-right: 6px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        .contact-info {
          margin: 4px 0 0 0;
          font-size: 14px;
          font-weight: 400;
          color: #374151;
        }

        .contact-info a {
          color: #2563eb;
          text-decoration: none;
        }

        .contact-info a:hover {
          text-decoration: underline;
        }

        /* Scrollbar */
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

        @media (max-width: 480px) {
          .modal {
            padding: 20px;
            max-height: 90vh;
          }
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
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button class="close" aria-label="Close">✕</button>

          <header>
            <figure>${pic ? `<img src="${pic}" alt="${name}" />` : ""}</figure>
            <div style="flex: 1;">
              <h3 id="modal-title">${name}</h3>
              <div class="meta">★ ${rating} · ${jobs}</div>
              ${phone && phone.trim() ? `<div class="contact-info">📞 <a href="tel:${phone.replace(/\s/g, '')}">${this.sanitizeText(phone)}</a></div>` : '<div class="contact-info" style="color: red;">No phone</div>'}
            </div>
          </header>

          ${description ? `<p class="desc">${description}</p>` : ""}
          
          ${facebook || instagram ? `
            <div class="socials">
              ${facebook ? `<a href="${facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>` : ""}
              ${instagram ? `<a href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>` : ""}
            </div>
          ` : ""}
        
          <h4>Сэтгэгдлүүд</h4>
          <div class="reviews-container">
            ${reviews.length === 0
              ? "<p class='no-reviews'>Сэтгэгдэл алга</p>"
              : reviews
                  .map(r => {
                    const userName = this.sanitizeText(r.user || 'Anonymous');
                    const userRating = this.sanitizeText(String(r.rating || '0'));
                    const comment = this.sanitizeText(r.comment || '');
                    
                    return `
                      <div class="review">
                        <b>${userName} ★${userRating}</b>
                        <p>${comment}</p>
                      </div>
                    `;
                  })
                  .join("")
            }
          </div>
        </div>
      </div>
    `;

    // Set up event listeners
    this.modal = this.shadowRoot.querySelector(".modal-backdrop");
    this.openBtn = this.shadowRoot.querySelector(".profile-btn");
    this.closeBtn = this.shadowRoot.querySelector(".close");

    this.openBtn.addEventListener('click', this.openModal);
    this.closeBtn.addEventListener('click', this.closeModal);
    this.modal.addEventListener('click', this.handleBackdropClick);
  }
}

customElements.define("ch-mini-job-card", ChMiniJobCard);