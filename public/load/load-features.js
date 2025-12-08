async function loadFeatures() {
    const res = await fetch("./data/features.json");
    const data = await res.json();

    const container = document.getElementById("features-section");
    container.innerHTML = ""; // clear

    data.features.forEach(f => {
      const card = document.createElement("ch-feature-card");

      card.setAttribute("badge", f.badge);
      card.setAttribute("title", f.title);
      card.setAttribute("desc", f.desc);

      container.appendChild(card);
    });
  }

  loadFeatures();
