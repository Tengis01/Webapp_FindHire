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
          gap: 6px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 10px;
          box-shadow: var(--shadow);
          padding: 12px 8px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cat:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: var(--brand);
        }

        .cat img {
          width: 22px;
          height: 22px;
          display: block;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .cat:hover img {
          transform: scale(1.1);
        }

        .cat span {
          font-size: 12px;
        }

        .submenu {
          position: absolute;
          left: 50%;
          top: calc(100% - 10px);
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
          list-style-position: outside;
          padding-left: 30px;
        }

        .submenu li {
          display: list-item;
          list-style-type: disc;
          padding: 2px 0;
          border-radius: 6px;
          transition: 0.2s ease;
        }

        .submenu li:hover {
          background: var(--soft);
          padding-left: 8px;
          margin-left: -8px;
        }

        .submenu a {
          color: var(--ink);
          text-decoration: none;
          font-size: 14px;
          padding: 6px 8px;
          border-radius: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: inline;
          transition: 0.2s ease;
        }

        .submenu a:hover {
          color: var(--brand);
          font-weight: 500;
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
  }

  _attachLinkListeners() {
    const links = this.shadowRoot.querySelectorAll(".submenu a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const mainCat = link.getAttribute("data-main");
        const subCat = link.getAttribute("data-sub");
        const title = link.textContent.trim();

        console.log("🔗 Category link clicked:", { mainCat, subCat, title });

        if (typeof window.openWorkersPopup === "function") {
          window.openWorkersPopup(mainCat, subCat, title);
        } else {
          console.error("❌ openWorkersPopup function not found!");
        }
      });
    });
  }
}

customElements.define("cat-item", ChCatItem);