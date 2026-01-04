class ChConfirmModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.resolvePromise = null;
  }

  connectedCallback() {
    this.render();
  }

  show(message) {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.mode = 'confirm';
      const modal = this.shadowRoot.querySelector('.confirm-modal');
      const messageEl = this.shadowRoot.querySelector('.confirm-message');
      const reviewArea = this.shadowRoot.querySelector('.review-area');
      
      messageEl.textContent = message;
      if(reviewArea) reviewArea.style.display = 'none';
      
      modal.classList.add('show');
    });
  }

  showReview(message) {
      return new Promise((resolve) => {
          this.resolvePromise = resolve;
          this.mode = 'review';
          this.rating = 5;
          
          const modal = this.shadowRoot.querySelector('.confirm-modal');
          const messageEl = this.shadowRoot.querySelector('.confirm-message');
          const reviewArea = this.shadowRoot.querySelector('.review-area');
          
          messageEl.textContent = "Та уг ажлыг дүгнэнэ үү:";
          
          // Reset Review UI
          this.renderStars(5);
          this.shadowRoot.querySelector('#review-comment').value = '';
          
          if(reviewArea) reviewArea.style.display = 'block';
          modal.classList.add('show');
      });
  }

  handleConfirm() {
    this.close();
    if (this.resolvePromise) {
        if (this.mode === 'review') {
            const comment = this.shadowRoot.querySelector('#review-comment').value;
            this.resolvePromise({ confirmed: true, rating: this.rating, comment });
        } else {
            this.resolvePromise(true);
        }
    }
  }

  handleCancel() {
    this.close();
    if (this.resolvePromise) {
        if (this.mode === 'review') {
            this.resolvePromise({ confirmed: false });
        } else {
            this.resolvePromise(false);
        }
    }
  }

  close() {
    const modal = this.shadowRoot.querySelector('.confirm-modal');
    modal.classList.remove('show');
  }
  
  setRating(r) {
      this.rating = r;
      this.renderStars(r);
  }
  
  renderStars(rating) {
      const container = this.shadowRoot.querySelector('.stars-container');
      if(!container) return;
      
      container.innerHTML = [1,2,3,4,5].map(i => `
        <span class="star ${i <= rating ? 'filled' : ''}" data-val="${i}">★</span>
      `).join('');
      
      container.querySelectorAll('.star').forEach(s => {
          s.onclick = () => this.setRating(parseInt(s.dataset.val));
      });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .confirm-modal {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center;
          z-index: 99999; opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
        }
        .confirm-modal.show { opacity: 1; pointer-events: auto; }
        .confirm-content {
          background: white; border-radius: 16px; padding: 24px; max-width: 400px; width: 90%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); transform: scale(0.9); transition: transform 0.2s ease;
        }
        .confirm-modal.show .confirm-content { transform: scale(1); }
        .confirm-message { font-size: 16px; color: #213448; margin-bottom: 24px; line-height: 1.5; text-align: center; font-weight: 500;}
        .confirm-buttons { display: flex; gap: 12px; }
        .confirm-btn {
          flex: 1; padding: 12px; border: none; border-radius: 8px;
          font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .confirm-btn.ok { background: #213448; color: white; }
        .confirm-btn.ok:hover { background: #334b63; transform: translateY(-1px); }
        .confirm-btn.cancel { background: #E2E8F0; color: #475569; }
        .confirm-btn.cancel:hover { background: #CBD5E1; }
        
        /* Review Styles */
        .review-area { text-align: center; margin-bottom: 20px; }
        .stars-container { font-size: 32px; color: #cbd5e1; cursor: pointer; margin-bottom: 10px; }
        .star.filled { color: #F59E0B; }
        .star { transition: color 0.1s; }
        .review-textarea {
            width: 100%; height: 80px; padding: 10px; border: 1px solid #e2e8f0;
            border-radius: 8px; font-family: inherit; font-size: 14px; resize: none; box-sizing: border-box;
        }
        .review-textarea:focus { outline: none; border-color: #213448; }
      </style>

      <div class="confirm-modal">
        <div class="confirm-content">
          <div class="confirm-message"></div>
          
          <div class="review-area" style="display:none;">
             <div class="stars-container"></div>
             <textarea id="review-comment" class="review-textarea" placeholder="Сэтгэгдэл бичих (сонголттой)..."></textarea>
          </div>
          
          <div class="confirm-buttons">
            <button class="confirm-btn cancel">Цуцлах</button>
            <button class="confirm-btn ok">Зөвшөөрөх</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.confirm-btn.ok').addEventListener('click', () => this.handleConfirm());
    this.shadowRoot.querySelector('.confirm-btn.cancel').addEventListener('click', () => this.handleCancel());
    
    // Close on backdrop click
    this.shadowRoot.querySelector('.confirm-modal').addEventListener('click', (e) => {
      if (e.target.classList.contains('confirm-modal')) {
        this.handleCancel();
      }
    });
  }
}

customElements.define('ch-confirm-modal', ChConfirmModal);
