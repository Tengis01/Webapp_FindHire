class ChToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Queue to handle multiple toasts effectively if needed
    this.queue = [];
    this.isShowing = false;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          pointer-events: none;
        }

        .toast-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
        }

        .toast {
          min-width: 250px;
          max-width: 400px;
          padding: 16px 24px;
          border-radius: 50px; /* More rounded for center pill look */
          background: white;
          color: #333;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          transform: translateY(-200%); /* Start from above */
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
          opacity: 0;
          pointer-events: auto;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          border: 1px solid rgba(0,0,0,0.05); /* Subtle border instead of side border */
        }

        .toast.show {
          transform: translateY(0);
          opacity: 1;
        }

        .toast.success {
          background: #ECFDF5;
          color: #065F46;
          border-color: #A7F3D0;
        }
        .toast.success .icon {
          color: #10B981;
        }

        .toast.error {
          background: #FEF2F2;
          color: #991B1B;
          border-color: #FECACA;
        }
        .toast.error .icon {
          color: #EF4444;
        }

        .icon {
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .message {
          flex: 1;
          line-height: 1.4;
          font-weight: 500;
        }
      </style>
      <div class="toast-container" id="container"></div>
    `;
  }

  /**
   * Show a toast message
   * @param {string} message - The text to display
   * @param {'success'|'error'|'info'} type - The type of toast
   * @param {number} duration - How long to show in ms (default 3000)
   */
  show(message, type = 'info', duration = 3000) {
    if (!this.shadowRoot) return;

    const container = this.shadowRoot.getElementById('container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Choose icon based on type
    let iconHTML = '';
    if (type === 'success') iconHTML = '✓'; // Simple checkmark
    else if (type === 'error') iconHTML = '!'; // Exclamation
    else iconHTML = 'i'; // Info

    toast.innerHTML = `
      <div class="icon">${iconHTML}</div>
      <div class="message">${message}</div>
    `;

    container.appendChild(toast);

    // Trigger reflow to enable transition
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      // Wait for transition to finish before removing from DOM
      toast.addEventListener('transitionend', () => {
        if (toast.parentElement) {
          toast.remove();
        }
      });
    }, duration);
  }
}

customElements.define("ch-toast", ChToast);
