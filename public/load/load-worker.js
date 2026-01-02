async function loadWorkers() {
  const res = await fetch("/api/workers");
  const workers = await res.json();

  const container = document.querySelector("#workers");
  container.innerHTML = "";

  workers.forEach(w => {
    const card = document.createElement("ch-mini-job-card");

    card.setAttribute("name", w.name);
    card.setAttribute("rating", w.rating);
    card.setAttribute("jobs", `${w.jobs} ${w.emoji}`);
    card.setAttribute("description", w.description);
    card.setAttribute("category", w.category);
    card.setAttribute("experience", w.experience);
    card.setAttribute(
      "availability",
      JSON.stringify(w.availability)
    );

    if (w.phone) card.setAttribute("phone", w.phone);
    if (w.email) card.setAttribute("email", w.email);


    container.appendChild(card);
  });
}


