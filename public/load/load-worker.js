const list = document.getElementById("job-list");
const modal = document.getElementById("profileModal");
const profileBody = document.getElementById("profileBody");
const closeModal = document.getElementById("closeModal");

let workers = [];

fetch("/api/workers.json")
  .then(res => res.json())
  .then(data => {
    workers = data.workers;
    renderCards(workers);
  });
