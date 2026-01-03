class ChFab extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.checkAuth();
    }

    async checkAuth() {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            this.user = data.user;

            this.render();

            // If Worker, hide completely
            if (this.user && (this.user.role === 'Worker' || !this.user.role)) {
                // Note: If user.role is missing but user exists, might be legacy, but plan says Workers hide.
                if (this.user.role === 'Worker') {
                    this.style.display = 'none';
                }
            }

        } catch (e) {
            console.error("Auth check failed", e);
            // Treat as guest -> Render (will redirect on click)
            this.render();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
        }

        .fab {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #213448; /* Brand Color */
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          border: none;
        }

        .fab:hover {
          transform: scale(1.1);
          background: #1a2a3a;
        }

        .fab svg {
          width: 30px;
          height: 30px;
        }
      </style>

      <button class="fab" aria-label="Post Job">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    `;

        this.shadowRoot.querySelector('.fab').addEventListener('click', () => {
            this.handleClick();
        });
    }

    handleClick() {
        if (!this.user) {
            // Guest -> Redirect to Sign In
            window.location.href = '/sign-in';
        } else if (this.user.role === 'User') {
            // User -> Open Work Request Component
            const requestForm = document.querySelector('ch-work-request');
            if (requestForm) {
                requestForm.open();
            } else {
                console.error("ch-work-request component not found in DOM");
            }
        }
    }
}

customElements.define('ch-fab', ChFab);
