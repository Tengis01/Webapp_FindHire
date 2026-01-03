class ChReview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.fetchReviews();
  }

  async fetchReviews() {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const reviews = await res.json();
      this.renderReviews(reviews);
    } catch (err) {
      console.error('Error loading reviews:', err);
      this.shadowRoot.innerHTML = `<p style="text-align:center; color:#888;">Сэтгэгдэл ачааллахад алдаа гарлаа.</p>`;
    }
  }

  renderReviews(reviews) {
    const container = this.shadowRoot.querySelector('.review-track');
    if (!container) return; // Should not happen

    // Create cards
    const cards = reviews.map(r => this.createCard(r));
    
    // Append original cards
    cards.forEach(card => container.appendChild(card));

    // Append clone of cards for seamless infinite scroll
    // Depending on width, we might need more clones. 
    // Double the content is usually enough for simple marquee.
    const clones = reviews.map(r => this.createCard(r));
    clones.forEach(card => {
        card.setAttribute('aria-hidden', 'true');
        container.appendChild(card);
    });
  }

  createCard(r) {
    const el = document.createElement('div');
    el.className = 'review-card';
    el.innerHTML = `
      <div class="user">
        <div class="avatar">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#555" width="24" height="24">
             <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
           </svg>
        </div>
        <div class="info">
          <h4>${r.user}</h4>
          <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        </div>
      </div>
      <p class="text">${r.text}</p>
    `;
    return el;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          overflow: hidden;
          padding: 60px 0;
          background: #fdfdfd; 
          font-family: 'Inter', sans-serif;
        }

        .viewport {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        /* Fade masks */
        .viewport::before,
        .viewport::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100px;
          z-index: 2;
          pointer-events: none;
        }

        .viewport::before {
          left: 0;
          background: linear-gradient(to right, #fdfdfd, transparent);
        }

        .viewport::after {
          right: 0;
          background: linear-gradient(to left, #fdfdfd, transparent);
        }

        .review-track {
          display: flex;
          gap: 30px;
          width: max-content;
          animation: scrollLeft 350s linear infinite;
          padding: 20px 0; /* Space for shadows */
        }

        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .review-track:hover {
          animation-play-state: paused;
        }

        .review-card {
          width: 320px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.02);
          border: 1px solid rgba(255, 255, 255, 0.6);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease;
          position: relative;
        }

        .review-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 50px rgba(0,0,0,0.12);
          z-index: 10;
          background: #fff;
        }

        .user {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .avatar {
          width: 50px;
          height: 50px;
          background: #eee;
          color: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none;
        }

        .info {
          display: flex;
          flex-direction: column;
        }

        .info h4 {
          margin: 0;
          font-size: 17px;
          font-weight: 600;
          color: #2D3748;
          letter-spacing: -0.02em;
        }

        .stars {
          color: #F6AD55;
          font-size: 15px;
          margin-top: 4px;
          letter-spacing: 2px;
        }

        .text {
          margin: 0;
          color: #4A5568;
          line-height: 1.6;
          font-size: 15px;
          font-weight: 400;
        }
        
        /* Quote decoration */
        .text::before {
          content: "“";
          font-family: serif;
          font-size: 40px;
          color: #E2E8F0;
          position: absolute;
          top: 20px;
          right: 24px;
          line-height: 1;
        }
      </style>

      <div class="viewport">
        <div class="review-track">
          <!-- Reviews will be injected here -->
        </div>
      </div>
    `;
  }
}

customElements.define('ch-review', ChReview);
