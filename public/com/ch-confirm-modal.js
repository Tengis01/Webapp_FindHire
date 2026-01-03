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
      const modal = this.shadowRoot.querySelector('.confirm-modal');
      const messageEl = this.shadowRoot.querySelector('.confirm-message');
      messageEl.textContent = message;
      modal.classList.add('show');
    });
  }

  handleConfirm() {
    this.close();
    if (this.resolvePromise) this.resolvePromise(true);
  }

  handleCancel() {
    this.close();
    if (this.resolvePromise) this.resolvePromise(false);
  }

  close() {
    const modal = this.shadowRoot.querySelector('.confirm-modal');
    modal.classList.remove('show');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .confirm-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .confirm-modal.show {
          opacity: 1;
          pointer-events: auto;
        }

        .confirm-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          transform: scale(0.9);
          transition: transform 0.2s ease;
        }

        .confirm-modal.show .confirm-content {
          transform: scale(1);
        }

        .confirm-message {
          font-size: 16px;
          color: #213448;
          margin-bottom: 24px;
          line-height: 1.5;
          text-align: center;
        }

        .confirm-buttons {
          display: flex;
          gap: 12px;
        }

        .confirm-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .confirm-btn.ok {
          background: #213448;
          color: white;
        }

        .confirm-btn.ok:hover {
          background: #334b63;
          transform: translateY(-1px);
        }

        .confirm-btn.cancel {
          background: #E2E8F0;
          color: #475569;
        }

        .confirm-btn.cancel:hover {
          background: #CBD5E1;
        }
      </style>

      <div class="confirm-modal">
        <div class="confirm-content">
          <div class="confirm-message"></div>
          <div class="confirm-buttons">
            <button class="confirm-btn cancel">Цуцлах</button>
            <button class="confirm-btn ok">Тийм</button>
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
