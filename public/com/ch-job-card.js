class ChJobCard extends HTMLElement {
  constructor() {
    super();
    this.workers = [];
    this.currentIndex = 0;
  }

  connectedCallback() {
    this.parseWorkers();
    this.render();
    this.attachEventListeners();
  }

  parseWorkers() {
    // Parse worker data from attributes
    const workerData = this.getAttribute("workers");
    if (workerData) {
      try {
        this.workers = JSON.parse(workerData);
        this.currentIndex = 0;
      } catch (e) {
        console.error("Invalid workers data:", e);
      }
    }
    
    // Fallback to single worker if no workers array provided
    if (this.workers.length === 0) {
      const worker = this.getAttribute("worker");
      const completedJobs = this.getAttribute("completedJobs");
      
      if (worker) {
        this.workers = [{
          worker: worker,
          completedJobs: completedJobs ? parseInt(completedJobs) : 0
        }];
      }
    }
  }

  getCurrentWorker() {
    return this.workers[this.currentIndex] || this.workers[0];
  }

  render() {
    const title = this.getAttribute("title") || "Ажлын нэр";
    const searches = this.getAttribute("searches") || "500";
    const rating = parseFloat(this.getAttribute("rating") || "0");
    const img = this.getAttribute("img") || "";
    const currentWorker = this.getCurrentWorker();

    this.innerHTML = /* html */ `
      <article class="job">
        <div class="job-top">
          <div class="job-thumb">
            <img src="${img}" alt="${title}">
          </div>

          <div class="job-main">
            <h4 class="job-title">${title}</h4>
            <p class="job-stats">
              <span class="job-views">${searches}</span>
              <span class="job-eye">👁</span>
              <span class="job-rating">
                ${rating.toFixed(1)} <span class="rating-star">★</span>
              </span>
            </p>
          </div>
        </div>

        <hr class="job-divider" />

        <div class="job-bottom">
          <button class="job-nav job-nav-prev" ${this.workers.length <= 1 ? 'disabled' : ''}>‹</button>

          <div class="job-worker">
            <p class="job-worker-name">${currentWorker.worker}</p>
            <p class="job-worker-meta">${currentWorker.completedJobs} ажил хийсэн</p>
          </div>

          <button class="job-nav job-nav-next" ${this.workers.length <= 1 ? 'disabled' : ''}>›</button>
        </div>
      </article>
    `;
  }

  attachEventListeners() {
    const prevBtn = this.querySelector(".job-nav-prev");
    const nextBtn = this.querySelector(".job-nav-next");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.navigatePrev());
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.navigateNext());
    }
  }

  navigatePrev() {
    if (this.workers.length <= 1) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.workers.length) % this.workers.length;
    this.updateWorkerDisplay();
  }

  navigateNext() {
    if (this.workers.length <= 1) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.workers.length;
    this.updateWorkerDisplay();
  }

  updateWorkerDisplay() {
    const currentWorker = this.getCurrentWorker();
    const workerNameEl = this.querySelector(".job-worker-name");
    const workerMetaEl = this.querySelector(".job-worker-meta");

    if (workerNameEl) {
      workerNameEl.textContent = currentWorker.worker;
    }
    if (workerMetaEl) {
      workerMetaEl.textContent = `${currentWorker.completedJobs} ажил хийсэн`;
    }
  }
}

customElements.define("ch-job-card", ChJobCard);

export { ChJobCard };