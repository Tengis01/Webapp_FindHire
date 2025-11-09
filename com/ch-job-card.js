class ChJobCard extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.render();
    }
    render() {
        const title = this.getAttribute('title') || '';
        const searches = this.getAttribute('searches') || '';
        const rating = parseInt(this.getAttribute('rating')) || 0;
        this.innerHTML = `
        <article class="job">
            <figure>
                <div class="thumb" role="img" aria-label="Ажлын зураг"></div>
                <figcaption>
                    <h4>${title}</h4>
                    <p class="meta">${searches} · ${rating.toFixed(1)}</p>
                </figcaption>
            </figure>
        </article>`;
    }
}
window.customElements.define('ch-job-card', ChJobCard);