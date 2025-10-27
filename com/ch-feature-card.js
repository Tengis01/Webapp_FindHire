class ChFeatureCard extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        re
    }

        render() {
            this.innerHTML=`<article class="feature">
        <p class="badge">3</p>
        <h3>Итгэлтэй</h3>
        <p>Үнэлгээ, сэтгэгдэлд тулгуурлан шийдвэрээ итгэлтэй гарга.</p>
      </article>`;
        }
    disconnectedCallback() {
    }

    attributeChangedCallback(name, oldVal, newVal) {
    }

    adoptedCallback() {
    }

}

window.customElements.define('ch-feature-card', ChFeatureCard);