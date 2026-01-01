class ChCatItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["name", "icon", "submenu", "category"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute("name") ?? "";
    const icon = this.getAttribute("icon") ?? "";
    const category = this.getAttribute("category") ?? name;
    const submenu = this.getAttribute("submenu")
      ? this.getAttribute("submenu").split(", ")
      : [];

    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        .cat {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 16px 12px;
          position: relative;
          cursor: pointer;
        }

        .cat img {
          width: 28px;
          height: 28px;
          display: block;
          object-fit: contain;
        }

        .cat span {
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .cat:hover span {
          font-weight: 600;
          color: var(--brand);
        }

        .submenu {
          position: absolute;
          left: 50%;
          top: calc(100% - 12px);
          transform: translateX(-50%) translateY(8px);
          min-width: 220px;
          padding: 12px 12px 12px 36px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 12px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          visibility: hidden;
          transition: 0.18s ease;
          z-index: 5;
        }

        .submenu a {
          color: var(--ink);
          text-decoration: none;
          font-size: 16px;
          padding: 8px 10px;
          border-radius: 8px;
        }

        .submenu a:hover {
          color: var(--brand);
        }

        .cat:hover .submenu {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .cat {
            padding: 18px 14px;
            min-height: 44px;
            min-width: 44px;
          }

          .cat img {
            width: 32px;
            height: 32px;
          }

          .cat span {
            font-size: 14px;
          }

          .submenu {
            min-width: 200px;
            padding: 10px 10px 10px 30px;
          }

          .submenu a {
            font-size: 14px;
            padding: 6px 8px;
          }
        }

        @media (max-width: 480px) {
          .cat {
            padding: 16px 10px;
          }

          .cat img {
            width: 28px;
            height: 28px;
          }

          .cat span {
            font-size: 13px;
          }

          .submenu {
            min-width: 180px;
            left: 0;
            transform: translateX(0) translateY(8px);
          }

          .cat:hover .submenu {
            transform: translateX(0) translateY(0);
          }

          .submenu a {
            font-size: 13px;
          }
        }

        /* Touch device support - make submenu tap-based on mobile */
        @media (hover: none) and (pointer: coarse) {
          .cat {
            cursor: pointer;
          }

          .submenu {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }

          .cat.active .submenu {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(-50%) translateY(0);
          }

          @media (max-width: 480px) {
            .cat.active .submenu {
              transform: translateX(0) translateY(0);
            }
          }
        }
      </style>

      <button class="cat" type="button">
        <img src="${icon}" alt="${name}"/>
        <span>${name}</span>
        <ul class="submenu">
          ${submenu
        .map(
          (item) =>
            `<li><a href="#" data-main="${category}" data-sub="${item.trim()}">${item}</a></li>`
        )
        .join("")}
        </ul>
      </button>
    `;

    this._attachLinkListeners();
    this._attachMobileTapToggle();
  }

  _attachMobileTapToggle() {
    // For touch devices, toggle submenu on tap
    const catButton = this.shadowRoot.querySelector('.cat');
    if (catButton) {
      catButton.addEventListener('click', (e) => {
        // Only toggle on touch devices
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
          e.stopPropagation();
          catButton.classList.toggle('active');

          // Close other active category menus
          document.querySelectorAll('cat-item').forEach(item => {
            if (item !== this) {
              const otherButton = item.shadowRoot?.querySelector('.cat');
              if (otherButton) {
                otherButton.classList.remove('active');
              }
            }
          });
        }
      });
    }

    // Close submenu when clicking outside on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      document.addEventListener('click', (e) => {
        const catButton = this.shadowRoot.querySelector('.cat');
        if (catButton && !e.composedPath().includes(this)) {
          catButton.classList.remove('active');
        }
      });
    }
  }

  _attachLinkListeners() {
    const links = this.shadowRoot.querySelectorAll(".submenu a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const mainCat = link.getAttribute("data-main");
        const subCat = link.getAttribute("data-sub");
        const title = link.textContent.trim();

        console.log("Category link clicked:", { mainCat, subCat, title });

        if (typeof window.openWorkersPopup === "function") {
          window.openWorkersPopup(mainCat, subCat, title);
        } else {
          console.error("openWorkersPopup function not found!");
        }
      });
    });
  }
}

customElements.define("cat-item", ChCatItem);