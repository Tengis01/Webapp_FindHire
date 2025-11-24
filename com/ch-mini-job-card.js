class ChMiniJobCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const pic = this.getAttribute("pic") || "";
    const name = this.getAttribute("name") || "Ц. Дэлгэрмөрөн";
    const rating = parseFloat(this.getAttribute("rating") || "0");
    const jobs = this.getAttribute("jobs") || "30 🤝";
    const description =
      this.getAttribute("description") ||
      "Ажлын түүх: Дотор заслын ерөнхий мужаанаар 10 жил ажилсан туршлага";

    this.innerHTML = /* html */ `
    <article class="job mini-job">
      
      <div class="job-top">
        <div class="job-thumb">${pic}</div>
        <div class="job-main">
          <h4 class="job-title">${name}</h4>

          <p class="job-stats">
            ★ ${rating.toFixed(1)}
            <span class="job-jobs">${jobs}</span>
          </p>
        </div>
      </div>

      <hr class="job-divider" />

      <p class="job-description">${description}</p>

      <!-- Доош харсан товч — description ДООР байрлана -->
      <button class="job-nav job-nav-down" type="button">▼</button>

    </article>
  `;
  }
}

window.customElements.define("ch-mini-job-card", ChMiniJobCard);
