const popup = document.getElementById("profiles-popup");
const titleEl = popup.shadowRoot.querySelector("h3") || popup.shadowRoot.querySelector(".filters h3"); // Some might not have h3
const nameInput = popup.shadowRoot.querySelector("#filter-name");
const ratingSelect = popup.shadowRoot.querySelector("#filter-rating");
const expSelect = popup.shadowRoot.querySelector("#filter-experience");

let currentWorkers = [];

// Helper function to render cards
function renderCards(workers) {
  // 1. Remove all old cards from popup
  for (const card of popup.childNodes) {
    card.remove();
  }

  // 2. Add new cards inside <ch-popup-screen> (automatically slots into the custom element)
  for (const worker of workers) {
    const card = document.createElement("ch-mini-job-card");
    card.setAttribute("name", worker.name);
    card.setAttribute("rating", worker.rating);
    card.setAttribute("jobs", worker.jobs);
    card.setAttribute("description", worker.description);
    if (worker.pic) card.setAttribute("pic", worker.pic);

    popup.appendChild(card); // This line adds the card to the popup
  }
}

// Apply filters to workers
function applyFilters() {
  let filtered = [...currentWorkers];

  filtered = filterByName(filtered);
  filtered = filterByRating(filtered);
  filtered = filterByExperience(filtered);

  renderCards(filtered);
}

// Filter workers by name
function filterByName(filtered) {
  const name = nameInput.value.trim().toLowerCase();
  if (name) {
    return filtered.filter(w => w.name.toLowerCase().includes(name));
  }
  return filtered;
}

// Filter workers by rating
function filterByRating(filtered) {
  const rating = ratingSelect.value;
  if (rating) {
    return filtered.filter(w => Number(w.rating) >= Number(rating));
  }
  return filtered;
}

// Filter workers by experience
function filterByExperience(filtered) {
  const exp = expSelect.value;
  if (exp) {
    return filtered.filter(w => {
      const years = w.description.match(/(\d+)\s*жил/i);
      const expYears = years ? Number.parseInt(years[1]) : 0;
      return expYears >= Number(exp);
    });
  }
  return filtered;
}

// Global function to be called for opening workers popup
globalThis.openWorkersPopup = async function(main_category, sub_category, title = sub_category) {
  try {
    const res = await fetch(`/api/workers?main=${encodeURIComponent(main_category)}&sub=${encodeURIComponent(sub_category)}`);
    const workers = await res.json();

    currentWorkers = workers;

    // Change title if available
    const titleElement = popup.shadowRoot.querySelector("h3");
    if (titleElement) titleElement.textContent = title;

    renderCards(workers);
    popup.open();

    // Set up filter event listeners
    nameInput.value = "";
    ratingSelect.value = "";
    expSelect.value = "";
    nameInput.oninput = applyFilters;
    ratingSelect.onchange = applyFilters;
    expSelect.onchange = applyFilters;

  } catch (err) {
    console.error("Error:", err);
    while (popup.firstChild) popup.firstChild.remove();
    popup.open();
  }
};
