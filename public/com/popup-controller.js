// com/popup-controller.js
// Popup-ийг удирдах бүх функцууд + URL routing

window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("profiles-popup");
  if (!popup) {
    console.error("profiles-popup олдсонгүй!");
    return;
  }

  const nameInput = popup.shadowRoot.querySelector("#filter-name");
  const ratingSelect = popup.shadowRoot.querySelector("#filter-rating");
  const expSelect = popup.shadowRoot.querySelector("#filter-experience");

  let currentWorkers = [];

  function renderCards(workers) {
    while (popup.firstChild) {
      popup.firstChild.remove();
    }

    console.log(`Rendering ${workers.length} cards`);

    for (const worker of workers) {
      const card = document.createElement("ch-mini-job-card");
      card.setAttribute("name", worker.name);
      card.setAttribute("rating", worker.rating);
      card.setAttribute("jobs", worker.jobs);
      card.setAttribute("description", worker.description);
      if (worker.pic) card.setAttribute("pic", worker.pic);

      popup.appendChild(card);
    }
  }

  function applyFilters(updateURL = true) {
    let filtered = [...currentWorkers];

    // Filter by name, rating, experience
    filtered = filterByName(filtered);
    filtered = filterByRating(filtered);
    filtered = filterByExperience(filtered);

    if (updateURL) {
      const url = new URL(window.location);
      const name = nameInput.value.trim();
      const rating = ratingSelect.value;
      const exp = expSelect.value;

      if (name) url.searchParams.set('search', name);
      else url.searchParams.delete('search');

      if (rating) url.searchParams.set('rating', rating);
      else url.searchParams.delete('rating');

      if (exp) url.searchParams.set('experience', exp);
      else url.searchParams.delete('experience');

      window.history.replaceState(
        { menu: url.searchParams.get('menu'), submenu: url.searchParams.get('submenu') },
        '',
        url
      );
    }

    renderCards(filtered);
  }

  function filterByName(filtered) {
    const name = nameInput.value.trim().toLowerCase();
    if (name) {
      return filtered.filter((w) => w.name.toLowerCase().includes(name));
    }
    return filtered;
  }

  function filterByRating(filtered) {
    const rating = ratingSelect.value;
    if (rating) {
      return filtered.filter((w) => {
        // rating нь string байгаа тул number болгож хөрвүүлнэ
        const workerRating =
          typeof w.rating === "string" ? parseFloat(w.rating) : w.rating;
        return workerRating >= Number(rating);
      });
    }
    return filtered;
  }

  function filterByExperience(filtered) {
    const exp = expSelect.value;
    if (exp) {
      return filtered.filter((w) => {
        // description-с жилийн тоо гаргаж авна
        const years = w.description.match(/(\d+)\s*жил/i);
        const expYears = years ? parseInt(years[1]) : 0;
        return expYears >= Number(exp);
      });
    }
    return filtered;
  }

  // URL-ээс параметрүүдийг уншиж popup нээх
  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const menu = params.get("menu");
    const submenu = params.get("submenu");
    const search = params.get("search");
    const rating = params.get("rating");
    const experience = params.get("experience");

    if (menu && submenu) {
      console.log("Loading from URL:", { menu, submenu, search, rating, experience });
      // URL аль хэдийн байгаа тул updateURL = false
      window.openWorkersPopup(menu, submenu, submenu, false).then(() => {
        if (search) nameInput.value = search;
        if (rating) ratingSelect.value = rating;
        if (experience) expSelect.value = experience;
        
        if (search || rating || experience) {
          applyFilters(false);
        }
      });
    }
  }

  // Global function to be called for opening workers popup
  // updateURL параметр нэмсэн (default: true)
  window.openWorkersPopup = async function (
    main_category,
    sub_category,
    title = sub_category,
    updateURL = true
  ) {
    try {
      console.log("Opening popup:", { main_category, sub_category });

      // URL update хийх
      if (updateURL) {
        const url = new URL(window.location);
        url.searchParams.set("menu", main_category);
        url.searchParams.set("submenu", sub_category);
        window.history.pushState(
          { menu: main_category, submenu: sub_category },
          "",
          url
        );
        console.log("URL updated:", url.search);
      }

      // API параметрүүдийг зөв илгээх - main болон sub гэж
      const res = await fetch(
        `/api/workers?main=${encodeURIComponent(
          main_category
        )}&sub=${encodeURIComponent(sub_category)}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const workers = await res.json();
      console.log("Received workers:", workers.length);

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
      console.error("Error opening popup:", err);
      // Show error message to user
      while (popup.firstChild) popup.firstChild.remove();

      const errorCard = document.createElement("ch-mini-job-card");
      errorCard.setAttribute("name", "Алдаа гарлаа");
      errorCard.setAttribute("rating", "0");
      errorCard.setAttribute("jobs", "0");
      errorCard.setAttribute(
        "description",
        `Мэдээлэл татахад алдаа гарлаа: ${err.message}`
      );
      popup.appendChild(errorCard);

      popup.open();
    }
  };

  //  Browser back/forward товч дарахад
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.menu && event.state.submenu) {
      console.log("Browser navigation:", event.state);
      // URL аль хэдийн өөрчлөгдсөн тул updateURL = false
      window.openWorkersPopup(
        event.state.menu,
        event.state.submenu,
        event.state.submenu,
        false
      );
    } else {
      // Үндсэн хуудас руу буцах
      popup.close();
      console.log("Back to home");
    }
  });

  //  Popup хаахад URL цэвэрлэх
  const originalClose = popup.close.bind(popup);
  popup.close = function () {
    const url = new URL(window.location);
    if (url.searchParams.has("menu") || url.searchParams.has("submenu")) {
      url.searchParams.delete("menu");
      url.searchParams.delete("submenu");
      url.searchParams.delete("search");
      url.searchParams.delete("rating");
      url.searchParams.delete("experience");
      window.history.pushState({}, "", url);
      console.log("URL cleared");
    }
    originalClose();
  };

  // бүх cat-item авч, тэдний shadow доторх submenu-гийн <a>–уудыг олно
  const catItems = document.querySelectorAll("cat-item");

  catItems.forEach((item) => {
    const links = item.shadowRoot?.querySelectorAll(".submenu a") ?? [];
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault(); // href="#"-ээс үсрэхгүй

        // Link-ийн data attribute-аас категори мэдээллийг авах
        const mainCat = link.dataset.main || link.getAttribute("data-main");
        const subCat = link.dataset.sub || link.getAttribute("data-sub");
        const title = link.textContent.trim();

        console.log("Link clicked:", { mainCat, subCat, title });

        // Хэрэв data attribute байвал popup нээх
        if (mainCat && subCat) {
          window.openWorkersPopup(mainCat, subCat, title); // updateURL = true (default)
        } else {
          // Хэрэв байхгүй бол зүгээр popup нээх (хуучин арга)
          popup.open();
        }
      });
    });
  });

  // Хуудас ачааллагдахад URL-ээс popup нээх
  loadFromURL();
});