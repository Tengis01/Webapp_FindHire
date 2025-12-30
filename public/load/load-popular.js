async function loadPopularJobs() {
  const res = await fetch("./data/popular.json");
  const data = await res.json();

  const container = document.getElementById("popular-section");
  container.innerHTML = "";

  data.popularJobs.forEach((job) => {
    const card = document.createElement("ch-job-card");
    card.setAttribute("title", job.title);
    card.setAttribute("searches", job.searches);
    card.setAttribute("rating", job.rating);
    card.setAttribute("worker", job.worker);
    card.setAttribute("completedJobs", job.completedJobs);
    card.setAttribute("img", job.img);
    container.appendChild(card);
  });
}

loadPopularJobs();
