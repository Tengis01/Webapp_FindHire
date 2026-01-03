async function loadWorkers() {
  const res = await fetch("/api/workers");
  const workers = await res.json();

  const container = document.querySelector("#workers");
  container.innerHTML = "";

  workers.forEach(w => {
    const card = document.createElement("ch-mini-job-card");
    console.log("PHONE:", w.phone);
    
  

    card.setAttribute("name", w.name);
    card.setAttribute("rating", w.rating);
    card.setAttribute("jobs", `${w.jobs} ${w.emoji}`);
    card.setAttribute("description", w.description);
    card.setAttribute("category", w.category);
    card.setAttribute("experience", w.experience);
    card.setAttribute("phone", w.phone);

    card.setAttribute(
      "availability",
      JSON.stringify(w.availability)
    );
    container.appendChild(card);
  });
}


