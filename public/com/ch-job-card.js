class ChJobCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute("title") || "Ажлын нэр";
    const views = this.getAttribute("searches") || "500";
    const rating = parseFloat(this.getAttribute("rating") || "0");
    const worker = this.getAttribute("worker") || "Ц. Дэлгэрмөрөн";
    const jobs = this.getAttribute("jobs") || "";
    const img = this.getAttribute("img") || "";

    this.innerHTML = /* html */ `
      <article class="job">
        <div class="job-top">
          <div class="job-thumb">
            <img src="${img}" alt="${title}">
          </div>

          <div class="job-main">
            <h4 class="job-title">${title}</h4>
            <p class="job-stats">
              <span class="job-views">${views}</span>
              <span class="job-eye">👁</span>
              <span class="job-rating">
                ${rating.toFixed(1)} <span class="rating-star">★</span>
              </span>
            </p>
          </div>
        </div>

        <hr class="job-divider" />

        <div class="job-bottom">
          <button class="job-nav job-nav-prev">‹</button>

          <div class="job-worker">
            <p class="job-worker-name">${worker}</p>
            <p class="job-worker-meta">${jobs}</p>
          </div>

          <button class="job-nav job-nav-next">›</button>
        </div>
      </article>
    `;
  }
}

customElements.define("ch-job-card", ChJobCard);
