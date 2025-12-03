async function loadReviews() {
    try {
      const res = await fetch("./data/review.json"); //
      const data = await res.json();

      const container = document.getElementById("reviews-section");
      if (!container) return;

      container.innerHTML = "";

      data.reviews.forEach(r => {
        const card = document.createElement("ch-review-card");
        card.setAttribute("text", r.text);
        card.setAttribute("rating", r.rating);
        container.appendChild(card);
      });

    } catch (err) {
      console.error("Reviews load error:", err);
    }
  }

  loadReviews();