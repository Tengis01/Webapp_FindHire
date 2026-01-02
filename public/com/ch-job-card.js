console.log("CH-JOB-CARD JS LOADED");

class ChJobCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.workers = [];
    this.currentIndex = 0;
    this.autoTimer = null;
  }

  connectedCallback() {
    this.parseWorkers();
    this.render();
    this.startAutoSlide();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stopAutoSlide();
      } else {
        this.startAutoSlide();
      }
    });
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

    // ⭐ fallback
    if (this.workers.length === 0) {
      this.workers = [{
        worker: this.getAttribute("worker") || "Тодорхойгүй",
        completedJobs: this.getAttribute("completedJobs") || 0
      }];
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
</p> 
</div>
 </div>

        <div class="job-bottom">
          <button class="prev" ${this.workers.length <= 1 ? "disabled" : ""}>‹</button>
          <div class= "job-worker">
        <div class="job-worker-track">
        <div class="job-worker-slide">
            <p class="job-worker-name">${w.worker}</p>
            <p class="job-worker-meta">${w.completedJobs} ажил хийсэн</p>
          </div>
          </div>
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

    const card = this.shadowRoot.querySelector(".job");

    console.log("Hover target:", card);

    prev?.addEventListener("click", () => this.navigatePrev());
    next?.addEventListener("click", () => this.navigateNext());


  }


  navigateNext() {
    if (this.workers.length <= 1) return;

    this.currentIndex =
      (this.currentIndex + 1) % this.workers.length;
    this.updateWorker("next");
  }

  navigatePrev() {
    if (this.workers.length <= 1) return;

    this.currentIndex =
      (this.currentIndex - 1 + this.workers.length) % this.workers.length;
    this.updateWorker("prev");
  }



  updateWorker(direction = "next") {
    const track = this.shadowRoot.querySelector(".job-worker-track");
    const w = this.getCurrentWorker();

    // шинэ slide үүсгэнэ
    const slide = document.createElement("div");
    slide.className = "job-worker-slide";
    slide.innerHTML = `
    <p class="job-worker-name">${w.worker}</p>
    <p class="job-worker-meta">${w.completedJobs} ажил хийсэн</p>
  `;

    if (direction === "next") {
      track.appendChild(slide);
      track.style.transform = "translateX(-100%)";
    } else {
      track.insertBefore(slide, track.firstChild);
      track.style.transform = "translateX(-100%)";
      track.style.transition = "none";
      requestAnimationFrame(() => {
        track.style.transition = "transform 0.4s ease";
        track.style.transform = "translateX(0)";
      });
    }

    // animation дууссаны дараа cleanup
    setTimeout(() => {
      if (track.children.length > 1) {
        track.removeChild(track.children[0]);
      }
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      requestAnimationFrame(() => {
        track.style.transition = "transform  ease-all-in-out";
      });
    }, 400);
  }


  startAutoSlide() {
    if (this.autoTimer || this.workers.length <= 1) return;

    this.autoTimer = setInterval(() => {
      this.navigateNext();
    }, 1300); // ⏱ 2.5 секунд
  }

  stopAutoSlide() {
    clearInterval(this.autoTimer);
    this.autoTimer = null;
  }

}

customElements.define("ch-job-card", ChJobCard);
export { ChJobCard };
