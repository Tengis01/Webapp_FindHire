console.log("CH-JOB-CARD JS LOADED");

class ChJobCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.workers = [];
    this.currentIndex = 0;
  }

  connectedCallback() {
    this.parseWorkers();
    this.render();
  }

  parseWorkers() {
    const workerData = this.getAttribute("workers");
    if (workerData) {
      try {
        this.workers = JSON.parse(workerData);
        this.currentIndex = 0;
      } catch (e) {
        console.error("Invalid workers data:", e);
      }
    }
  }

  getCurrentWorker() {
    return this.workers[this.currentIndex];
  }

  render() {
    const title = this.getAttribute("title") || "Ажлын нэр";
    const searches = this.getAttribute("searches") || "500";
    const rating = parseFloat(this.getAttribute("rating") || "0");
    const img = this.getAttribute("img") || "";
    const w = this.getCurrentWorker();

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles.css">

      <article class="job">
      <div class="job-top">
      <div class="job-thumb">
        <img src="${img}" alt="${title}">
        </div>
        <div class="job-main">
        <h4 class="job-title">${title}</h4>
        <p class= "job-stats">
        <span class="job-views">${searches}</span> 
        <span class="job-eye">👁</span> 
        <span class="job-rating"> ⭐ ${rating.toFixed(1)}</span>
</span> 
</p> </div> </div>



        <div class="job-bottom">
          <button class="prev" ${this.workers.length <= 1 ? "disabled" : ""}>‹</button>
          <div class= "job-worker">

            <p class="job-worker-name">${w.worker}</p>
            <p class="job-worker-meta">${w.completedJobs} ажил хийсэн</p>
          </div>

          <button class="next" ${this.workers.length <= 1 ? "disabled" : ""}>›</button>
        </div>
      </article>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const prev = this.shadowRoot.querySelector(".prev");
    const next = this.shadowRoot.querySelector(".next");

    console.log("Prev:", prev, "Next:", next);

    prev?.addEventListener("click", () => this.navigatePrev());
    next?.addEventListener("click", () => this.navigateNext());
  }

  navigatePrev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.workers.length) % this.workers.length;
    this.updateWorker();
  }

  navigateNext() {
    this.currentIndex =
      (this.currentIndex + 1) % this.workers.length;
    this.updateWorker();
  }

  updateWorker() {
    const w = this.getCurrentWorker();
    this.shadowRoot.querySelector(".job-worker-name").textContent = w.worker;
    this.shadowRoot.querySelector(".job-worker-meta").textContent =
      `${w.completedJobs} ажил хийсэн`;
  }
}

customElements.define("ch-job-card", ChJobCard);
export { ChJobCard };
