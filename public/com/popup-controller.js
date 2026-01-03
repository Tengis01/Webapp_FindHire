// com/popup-controller.js
// Popup-ийг удирдах бүх функцууд + URL routing

window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("profiles-popup");
  if (!popup) {
    console.error("profiles-popup олдсонгүй!");
    return;
  }

  let currentCategory = { main: '', sub: '' };

  // Filter component-ийг олох функц
  const getFilterComponent = () => {
    return popup.shadowRoot.querySelector("ch-filter");
  };

  // Filter-ийн утгуудыг авах функц
  function getFilterValues() {
    // Popup component-оос дуудах
    if (typeof popup.getFilterValues === 'function') {
      return popup.getFilterValues();
    }

    // Эсвэл шууд ch-filter component-оос дуудах
    const filterComponent = getFilterComponent();
    if (filterComponent && typeof filterComponent.getFilterValues === 'function') {
      return filterComponent.getFilterValues();
    }

    console.warn("Filter component эсвэл getFilterValues method олдсонгүй");
    return {
      rating: [],
      experience: [],
      budget: [],
      ratingRange: 3.0
    };
  }

  let cachedWorkers = [];
  let currentSort = 'default';

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
      if (worker.phone) card.setAttribute("phone", worker.phone);
      if (worker.reviews) card.setAttribute("reviews", JSON.stringify(worker.reviews));

      popup.appendChild(card);
    }
  }

  function applySortAndRender() {
    let sorted = [...cachedWorkers];

    if (currentSort === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'mn'));
    } else if (currentSort === 'rating-desc') {
      sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    renderCards(sorted);
  }

  async function fetchWorkers(updateURL = true) {
    try {
      const filterValues = getFilterValues();

      const apiParams = new URLSearchParams();
      apiParams.set('main', currentCategory.main);

      // 1) SUB: checkbox сонголт байвал түүгээр, байхгүй бол submenu-г default болгоно
      const selectedSubs =
        (filterValues.budget && filterValues.budget.length > 0)
          ? filterValues.budget
          : [currentCategory.sub];

      apiParams.set('sub', selectedSubs.join(','));

      // 2) Туршлага: ch-filter одоо experienceMin (нэг утга) өгнө
      if (filterValues.experienceMin) {
        apiParams.set('experience', filterValues.experienceMin);
      }

      // 3) Rating range: min rating
      if (filterValues.ratingRange != null) {
        apiParams.set('ratingRange', String(filterValues.ratingRange));
      }

      // 4) Availability
      if (filterValues.availability && filterValues.availability.length > 0) {
        apiParams.set('availability', filterValues.availability.join(','));
      }

      console.log('Fetching workers with params:', Object.fromEntries(apiParams));

      const res = await fetch(`/api/workers?${apiParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const workers = await res.json();
      console.log('Received workers:', workers.length);

      // Cache and Render
      cachedWorkers = workers;
      applySortAndRender();

      if (updateURL) {
        const url = new URL(window.location);
        url.searchParams.set('menu', currentCategory.main);
        url.searchParams.set('submenu', currentCategory.sub);

        // budget (сонгосон subcategories)-ийг URL-д хадгална (сэргээхэд хэрэгтэй)
        if (filterValues.budget && filterValues.budget.length > 0) {
          url.searchParams.set('budget', filterValues.budget.join(','));
        } else {
          url.searchParams.delete('budget');
        }

        // experienceMin
        if (filterValues.experienceMin) {
          url.searchParams.set('experience', filterValues.experienceMin);
        } else {
          url.searchParams.delete('experience');
        }

        // ratingRange
        if (filterValues.ratingRange != null) {
          url.searchParams.set('ratingRange', String(filterValues.ratingRange));
        } else {
          url.searchParams.delete('ratingRange');
        }

        // availability
        if (filterValues.availability && filterValues.availability.length > 0) {
          url.searchParams.set('availability', filterValues.availability.join(','));
        } else {
          url.searchParams.delete('availability');
        }

        // rating checkbox-ууд байхгүй болсон тул rating param хэрэггүй
        url.searchParams.delete('rating');

        window.history.replaceState(
          { menu: currentCategory.main, submenu: currentCategory.sub },
          '',
          url
        );
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
      cachedWorkers = [];
      applySortAndRender();
    }
  }


  // Filter changed event listener нэмэх
  popup.addEventListener('filter-changed', (e) => {
    console.log('Filter changed:', e.detail);
    fetchWorkers(true);
  });

  // Sort changed listener
  popup.addEventListener('sort-changed', (e) => {
    console.log('Sort changed:', e.detail);
    currentSort = e.detail.sort;
    applySortAndRender();
  });

  // URL-ээс параметрүүдийг уншиж popup нээх
  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const menu = params.get("menu");
    const submenu = params.get("submenu");

    if (menu && submenu) {
      console.log("Loading from URL:", { menu, submenu });

      // We don't have easy access to sibling subcategories from URL loading only
      // UNLESS we map them. For now, let's just open without dynamic subcats via URL
      // Or we could try to find the matching cat-item from DOM
      const catItem = Array.from(document.querySelectorAll("cat-item")).find(item =>
        item.getAttribute("category") === menu || item.getAttribute("name") === menu
      );

      let subOptions = [];
      if (catItem) {
        const submenuStr = catItem.getAttribute("submenu") || "";
        subOptions = submenuStr.split(",").map(s => s.trim()).filter(Boolean);
      }

      window.openWorkersPopup(menu, submenu, submenu, subOptions, false);
    }
  }

  // Global function to be called for opening workers popup
  window.openWorkersPopup = async function (
    main_category,
    sub_category,
    title = sub_category,
    availableSubcategories = [],
    updateURL = true
  ) {
    try {
      console.log("Opening popup:", { main_category, sub_category, availableSubcategories });

      currentCategory = { main: main_category, sub: sub_category };

      // Change title if available
      const titleElement = popup.shadowRoot.querySelector("h3");
      if (titleElement) titleElement.textContent = title;

      // Update filter subcategories
      const filterComponent = popup.shadowRoot.querySelector("ch-filter");
      if (filterComponent && typeof filterComponent.setSubcategoryOptions === 'function') {
        // Automatically check the selected sub_category
        filterComponent.setSubcategoryOptions(availableSubcategories, [sub_category]);
        // Also clear other filters? Maybe optional.
        // filterComponent.clearFilters(); // Don't clear because it might clear the just-set subcat
      }

      popup.open();

      await fetchWorkers(updateURL);
    } catch (err) {
      console.error("Error opening popup:", err);
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

  // Browser back/forward товч дарахад
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.menu && event.state.submenu) {
      console.log("Browser navigation:", event.state);
      window.openWorkersPopup(
        event.state.menu,
        event.state.submenu,
        event.state.submenu,
        [], // TODO: Pass subcategories here too if possible
        false
      );
    } else {
      popup.close();
      console.log("Back to home");
    }
  });

  // Popup хаахад URL цэвэрлэх
  const originalClose = popup.close.bind(popup);
  popup.close = function () {
    const url = new URL(window.location);
    if (url.searchParams.has("menu") || url.searchParams.has("submenu")) {
      url.searchParams.delete("menu");
      url.searchParams.delete("submenu");
      url.searchParams.delete("rating");
      url.searchParams.delete("experience");
      url.searchParams.delete("budget");
      url.searchParams.delete("ratingRange");
      url.searchParams.delete("availability");
      window.history.pushState({}, "", url);
      console.log("URL cleared");
    }
    originalClose();
  };

  // Category link handler
  const catItems = document.querySelectorAll("cat-item");

  catItems.forEach((item) => {
    // Get subcategories from the parent item
    const submenuStr = item.getAttribute("submenu") || "";
    const subCategories = submenuStr.split(",").map(s => s.trim()).filter(Boolean);

    const links = item.shadowRoot?.querySelectorAll(".submenu a") ?? [];
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const mainCat = link.dataset.main || link.getAttribute("data-main");
        const subCat = link.dataset.sub || link.getAttribute("data-sub");
        const title = link.textContent.trim();

        console.log("Link clicked:", { mainCat, subCat, title });

        if (mainCat && subCat) {
          window.openWorkersPopup(mainCat, subCat, title, subCategories);
        } else {
          popup.open();
        }
      });
    });
  });

  loadFromURL();
});