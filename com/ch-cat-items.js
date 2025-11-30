class ChCatItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["name", "icon", "submenu"];
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
    const submenu = this.getAttribute("submenu")
      ? this.getAttribute("submenu").split(", ")
      : [];

    this.shadowRoot.innerHTML = /*html*/`
      <style>
        .cat {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 10px;
          box-shadow: var(--shadow);
          padding: 12px 8px;
          position: relative;
          cursor: pointer;
        }

        /* --- ХЭМЖЭЭГ ЗӨВ БОЛГОСОН ГОЛ ЗАСВАР --- */
        .cat img {
          width: 22px;
          height: 22px;
          display: block;
          object-fit: contain;
        }

        .cat span {
          font-size: 12px;
        }

        .submenu {
          position: absolute;
          left: 50%;
          top: calc(100% + 10px);
          transform: translateX(-50%) translateY(6px);
          min-width: 180px;
          padding: 10px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 10px;
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
          font-size: 14px;
          padding: 6px 8px;
          border-radius: 6px;
        }

        .submenu a:hover {
          background: var(--soft);
          color: var(--brand);
        }

        .cat:hover .submenu {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
      </style>

      <button class="cat" type="button">
        <img src="${icon}" alt="${name}"/>
        <span>${name}</span>
        <ul class="submenu">
          ${submenu.map((item) => `<li><a href="#">${item}</a></li>`).join("")}
        </ul>
      </button>
    `;
  }
}

customElements.define("cat-item", ChCatItem);
