class ChHiringModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.worker = null; // { id, name, category }
  }

  connectedCallback() {
    this.render();
  }

  open(worker) {
    this.worker = worker;
    const modal = this.shadowRoot.querySelector(".modal-overlay");
    if (modal) {
      // Update Title
      this.shadowRoot.querySelector("h2").textContent = `${worker.name}-д санал илгээх`;
      this.shadowRoot.querySelector(".category-badge").textContent = worker.category;
      
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
    
    // Reset Price
    const priceInput = this.shadowRoot.querySelector("#price-input");
    priceInput.disabled = false;
    priceInput.value = "";
    
    // Reset Feedback
    const feedback = this.shadowRoot.querySelector(".feedback");
    feedback.style.display = "none";
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector(".submit-btn");
    const feedback = this.shadowRoot.querySelector(".feedback");

    feedback.style.display = 'none';
    feedback.className = 'feedback';

    const formData = new FormData(form);
    
    // Mock Image Upload
    const fileInput = form.querySelector('input[type="file"]');
    let imagePath = "";
    if (fileInput.files.length > 0) {
        imagePath = "uploads/mock-request.jpg";
    }

    const data = {
      workerId: this.worker.id, // MongoDB _id
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("isDeal") === "on" ? 0 : formData.get("price"),
      date: formData.get("date"),
      image: imagePath
    };

    try {
      btn.textContent = "Илгээж байна...";
      btn.disabled = true;

      const res = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        feedback.textContent = "Санал амжилттай илгээгдлээ!";
        feedback.classList.add("success");
        feedback.style.display = "block";

        setTimeout(() => {
          this.close();
          const toast = document.querySelector('ch-toast');
          if(toast) toast.show('Ажлын санал илгээгдлээ!', 'success');
        }, 1500);

      } else {
        throw new Error(result.error || "Алдаа гарлаа");
      }
    } catch (err) {
      feedback.textContent = err.message;
      feedback.classList.add("error");
      feedback.style.display = "block";
    } finally {
      btn.textContent = "Илгээх";
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
          z-index: 2100; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease; backdrop-filter: blur(4px);
        }
        .modal-overlay.open { opacity: 1; pointer-events: auto; }
        
        .modal-content {
          background: white; width: 90%; max-width: 480px;
          border-radius: 16px; padding: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          position: relative; max-height: 90vh; overflow-y: auto;
          transform: translateY(20px); transition: transform 0.3s ease;
        }
        .modal-overlay.open .modal-content { transform: translateY(0); }
        
        h2 { margin: 0 0 5px; color: #213448; font-size: 22px; }
        .category-badge {
            display: inline-block; background: #e3f2fd; color: #1e88e5;
            padding: 4px 10px; border-radius: 12px; font-size: 13px; margin-bottom: 20px;
            font-weight: 600;
        }

        .close-btn {
          position: absolute; top: 20px; right: 20px;
          background: none; border: none; font-size: 24px; color: #888;
          cursor: pointer;
        }
        
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: 500; color: #333; font-size: 14px; }
        input, textarea {
          width: 100%; padding: 10px; border: 1px solid #ddd;
          border-radius: 8px; font-size: 15px; box-sizing: border-box;
          font-family: inherit;
        }
        input:focus, textarea:focus { outline: none; border-color: #213448; }
        
        input:disabled { background: #f5f5f5; color: #aaa; }

        .checkbox-row { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
        .checkbox-row input { width: auto; }
        .checkbox-row label { margin: 0; font-weight: normal; cursor: pointer; }

        .submit-btn {
          width: 100%; padding: 14px; background: #213448; color: white;
          border: none; border-radius: 8px; font-size: 16px; font-weight: bold;
          cursor: pointer; transition: background 0.2s; margin-top: 10px;
        }
        .submit-btn:hover { background: #1a2a3a; }
        .submit-btn:disabled { background: #ccc; cursor: not-allowed; }

        .feedback { margin-top: 10px; padding: 10px; border-radius: 6px; display: none; text-align: center; font-size: 14px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
      </style>

      <div class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn">&times;</button>
          <h2>Ажлын санал</h2>
          <span class="category-badge">Category</span>
          
          <form>
            <div class="form-group">
              <label>Ажлын гарчиг</label>
              <input type="text" name="title" placeholder="Тухайн ажлыг товч..." required />
            </div>

            <div class="form-group">
              <label>Хэзээ хийлгэх вэ?</label>
              <input type="date" name="date" required />
            </div>

            <div class="form-group">
              <label>Дэлгэрэнгүй тайлбар</label>
              <textarea name="description" rows="4" placeholder="Асуудлаа дэлгэрэнгүй бичнэ үү..." required></textarea>
            </div>

            <div class="form-group">
              <label>Санал болгох үнэ (₮)</label>
              <input type="number" id="price-input" name="price" placeholder="Жишээ: 50000" />
              <div class="checkbox-row">
                  <input type="checkbox" id="isDeal" name="isDeal">
                  <label for="isDeal">Үнэ тохиролцоно</label>
              </div>
            </div>

            <div class="form-group">
              <label>Зураг (Заавал биш)</label>
              <input type="file" accept="image/*" />
            </div>

            <button type="submit" class="submit-btn">Илгээх</button>
          </form>

          <div class="feedback"></div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector(".close-btn").addEventListener("click", () => this.close());
    this.shadowRoot.querySelector(".modal-overlay").addEventListener("click", (e) => {
        if (e.target.classList.contains("modal-overlay")) this.close();
    });

    // Price Toggle
    const isDeal = this.shadowRoot.querySelector("#isDeal");
    const priceInput = this.shadowRoot.querySelector("#price-input");
    
    isDeal.addEventListener("change", (e) => {
        if(e.target.checked) {
            priceInput.value = "";
            priceInput.disabled = true;
            priceInput.placeholder = "Үнэ тохиролцоно";
        } else {
            priceInput.disabled = false;
            priceInput.placeholder = "Жишээ: 50000";
        }
    });

    this.shadowRoot.querySelector("form").addEventListener("submit", (e) => this.handleSubmit(e));
  }
}

customElements.define("ch-hiring-modal", ChHiringModal);
