class ChWorkRequest extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Hardcoded Categories matching ch-cat-items/ch-categories
    this.categories = [
      { name: "Дотор засал", sub: ["Будаг", "Хана тааз засвар", "Шал"] },
      { name: "Тавилга угсралт", sub: ["Гэр ахуйн", "Оффис", "Зөөвөр угсрах"] },
      { name: "Цэвэрлэгээ", sub: ["Ерөнхий их", "Орон сууц/байшин", "Оффис"] },
      { name: "Нүүлгэлт", sub: ["Оффис нүүлгэлт", "Том овор хүнд даац", "Гэр нүүлгэлт"] },
      { name: "Сантехник", sub: ["Дотоод шугам", "Гал тогоо/угаалтуур", "Ариун цэврийн өрөө"] },
      { name: "Гадна талбай", sub: ["Зүлэг хадах", "Цас цэвэрлэх", "Явган зам/хашаа"] },
      { name: "Цахилгаан", sub: ["Гэрэлтүүлэг", "Розетка/унтраалга", "Засвар үйлчилгээ"] },
      { name: "Бусад", sub: [] }
    ];
  }

  connectedCallback() {
    this.render();
  }

  open() {
    const modal = this.shadowRoot.querySelector(".modal-overlay");
    if (modal) {
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }

  close() {
    const modal = this.shadowRoot.querySelector(".modal-overlay");
    if (modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
      this.resetForm();
    }
  }

  resetForm() {
    const form = this.shadowRoot.querySelector("form");
    if (form) form.reset();

    // Reset Custom UI
    this.shadowRoot.querySelector("#subcategory-container").innerHTML = "";
    this.shadowRoot.querySelector("#price-input").disabled = false;

    const feedback = this.shadowRoot.querySelector(".feedback");
    if (feedback) feedback.style.display = "none";
  }

  handleCategoryChange(e) {
    const selectedCat = e.target.value;
    const container = this.shadowRoot.querySelector("#subcategory-container");
    container.innerHTML = ""; // Clear old checkboxes

    if (!selectedCat) return;

    const catData = this.categories.find(c => c.name === selectedCat);
    if (catData && catData.sub.length > 0) {
      const title = document.createElement("label");
      title.textContent = "Дэд ангилал (Сонгохгүй байж болно)";
      title.style.fontSize = "14px";
      title.style.marginBottom = "8px";
      container.appendChild(title);

      const group = document.createElement("div");
      group.className = "checkbox-grid";

      catData.sub.forEach(sub => {
        const label = document.createElement("label");
        label.className = "checkbox-label";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "subcategories";
        input.value = sub;

        label.appendChild(input);
        label.appendChild(document.createTextNode(sub));
        group.appendChild(label);
      });
      container.appendChild(group);
    }
  }

  handleDealChange(e) {
    const priceInput = this.shadowRoot.querySelector("#price-input");
    if (e.target.checked) {
      priceInput.value = "";
      priceInput.disabled = true;
      priceInput.placeholder = "Үнэ тохиролцоно";
    } else {
      priceInput.disabled = false;
      priceInput.placeholder = "Жишээ: 50000";
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector(".submit-btn");
    const feedback = this.shadowRoot.querySelector(".feedback");

    feedback.style.display = 'none';
    feedback.className = 'feedback';

    const formData = new FormData(form);

    // Collect Subcategories
    const subChecks = form.querySelectorAll('input[name="subcategories"]:checked');
    const subcategories = Array.from(subChecks).map(cb => cb.value);

    // Image Validation (Client Side)
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const maxSize = 8 * 1024 * 1024; // 8MB
      if (file.size > maxSize) {
        feedback.textContent = "Зураг хэт том байна! 8MB-аас бага хэмжээтэй зураг оруулна уу.";
        feedback.classList.add("error");
        feedback.style.display = "block";
        return;
      }
    }

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      subcategories: subcategories,
      price: formData.get("price"),
      isDeal: formData.get("isDeal") === "on",
      hasFood: formData.get("hasFood") === "on",
      image: ""
    };

    // Simulate Image Upload
    if (fileInput.files.length > 0) {
      data.image = "uploads/mock-image.jpg";
    }

    try {
      btn.textContent = "Уншиж байна...";
      btn.disabled = true;

      const res = await fetch("/api/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        feedback.textContent = "Ажлын зар амжилттай нийтлэгдлээ!";
        feedback.classList.add("success");
        feedback.style.display = "block";

        setTimeout(() => {
          this.close();
          const event = new CustomEvent('job-posted');
          document.dispatchEvent(event);
        }, 1500);

      } else {
        throw new Error(result.error || "Зар оруулахад алдаа гарлаа");
      }
    } catch (err) {
      feedback.textContent = err.message;
      feedback.classList.add("error");
      feedback.style.display = "block";
    } finally {
      btn.textContent = "Зар оруулах";
      btn.disabled = false;
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease; backdrop-filter: blur(4px);
        }
        .modal-overlay.open { opacity: 1; pointer-events: auto; }
        .modal-content {
          background: white; width: 90%; max-width: 500px;
          border-radius: 16px; padding: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          position: relative; max-height: 90vh; overflow-y: auto;
          transform: translateY(20px); transition: transform 0.3s ease;
        }
        .modal-overlay.open .modal-content { transform: translateY(0); }
        h2 { margin: 0 0 20px; color: #213448; font-size: 24px; }
        .close-btn {
          position: absolute; top: 20px; right: 20px;
          background: none; border: none; font-size: 24px; color: #888;
          cursor: pointer;
        }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: 500; color: #333; }
        input, select, textarea {
          width: 100%; padding: 10px; border: 1px solid #ddd;
          border-radius: 8px; font-size: 16px; box-sizing: border-box;
        }
        input:disabled { background: #f5f5f5; color: #aaa; cursor: not-allowed; }
        input[type="file"] { border: 1px dashed #ddd; padding: 20px; text-align: center; }
        
        /* Checkbox customization */
        .checkbox-row { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
        .checkbox-row input { width: auto; }
        .checkbox-row label { margin: 0; font-weight: normal; cursor: pointer; }

        .checkbox-grid {
             display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
             background: #f9f9f9; padding: 10px; border-radius: 8px;
        }
        .checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
        .checkbox-label input { width: auto; margin: 0; }

        .submit-btn {
          width: 100%; padding: 14px; background: #213448; color: white;
          border: none; border-radius: 8px; font-size: 16px; font-weight: bold;
          cursor: pointer; transition: background 0.2s; margin-top: 10px;
        }
        .submit-btn:hover { background: #1a2a3a; }
        .feedback { margin-top: 10px; padding: 10px; border-radius: 6px; display: none; text-align: center; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
      </style>

      <div class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn">&times;</button>
          <h2>Ажлын зар оруулах</h2>
          
          <form>
            <!-- Category Selection (First) -->
            <div class="form-group">
                <label>Ангилал</label>
                <select name="category" id="category-select" required>
                    <option value="" disabled selected>-- Ангилал сонгох --</option>
                    ${this.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                </select>
            </div>

            <!-- Subcategories (Dynamic) -->
            <div class="form-group" id="subcategory-container"></div>

            <div class="form-group">
              <label>Ажлын нэр</label>
              <input type="text" name="title" placeholder="Жишээ: Крант засах, Цэвэрлэгээ хийх..." required />
            </div>

            <div class="form-group">
              <label>Дэлгэрэнгүй тайлбар / Заавар</label>
              <textarea name="description" rows="4" placeholder="Асуудлаа дэлгэрэнгүй бичнэ үү..." required></textarea>
            </div>

            <div class="form-group">
              <label>Үнэ (₮)</label>
              <input type="number" id="price-input" name="price" placeholder="Жишээ: 50000" />
              <div class="checkbox-row">
                  <input type="checkbox" id="isDeal" name="isDeal">
                  <label for="isDeal">Үнэ тохиролцоно</label>
              </div>
            </div>

            <div class="form-group">
              <label>Зураг (Дээд хэмжээ 8MB)</label>
              <input type="file" accept="image/*" />
            </div>

            <div class="checkbox-row">
               <input type="checkbox" id="hasFood" name="hasFood" />
               <label for="hasFood">Хоол өгөх боломжтой</label>
            </div>

            <button type="submit" class="submit-btn">Зар оруулах</button>
          </form>

          <div class="feedback"></div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector(".close-btn").addEventListener("click", () => this.close());
    this.shadowRoot.querySelector(".modal-overlay").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) this.close();
    });

    // Listeners
    this.shadowRoot.querySelector("#category-select").addEventListener("change", (e) => this.handleCategoryChange(e));
    this.shadowRoot.querySelector("#isDeal").addEventListener("change", (e) => this.handleDealChange(e));

    this.shadowRoot.querySelector("form").addEventListener("submit", (e) => this.handleSubmit(e));
  }
}

customElements.define("ch-work-request", ChWorkRequest);
