class ChFeatureCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const badge = this.getAttribute("badge") || "";
    const title = this.getAttribute("title") || "";
    const desc = this.getAttribute("desc") || "";

    this.innerHTML = `
      <article class="feature">
        <div class="feature-header">
          <p class="badge">${badge}</p>
          <h3>${title}</h3>
        </div>
        <p class="feature-desc">${desc}</p>
      </article>
    `;
  }

  disconnectedCallback() {}
  attributeChangedCallback() {}
  adoptedCallback() {}
}

window.customElements.define("ch-feature-card", ChFeatureCard);
