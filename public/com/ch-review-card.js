class ChReviewCard extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.render();
    }
    render() {
        const text = this.getAttribute('text') || '';
        const rating = parseInt(this.getAttribute('rating')) || 0;
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<span class="filled">★</span>';
            } else {
                starsHtml += '★';
            }
        }
        this.innerHTML = `
            <div class="review-text">${text}</div>
            <div class="review-rating">${starsHtml}</div>
        `;
    }
}
window.customElements.define('ch-review-card', ChReviewCard);