class Profile extends HTMLElement {
  constructor() {
    super();
    this.isEditing = false;
    this.userData = {
      bio: "Сайн байна уу?",
      gender: "Эрэгтэй",
      ageGroup: "30-35 нас",
      workHistory: "",
      profileImg: "./plumber.png"
    };
    this.feedbacks = [];
    this.workImages = [];
  }

  async connectedCallback() {
    // 1. Эхлээд серверээс датагаа татаж авна
    await this.fetchUserProfile();
    // 2. Дата ирсний дараа render хийнэ (fetchUserProfile дотор render дуудагдаж байгаа)
  }

  // --- API ХОЛБОЛТУУД ---

  async fetchUserProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return this.render(); // Хэрэглэгчгүй бол шууд render

    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        this.userData = {
          bio: data.bio || this.userData.bio,
          gender: data.gender || this.userData.gender,
          ageGroup: data.ageGroup || this.userData.ageGroup,
          workHistory: data.workHistory || this.userData.workHistory,
          profileImg: data.profileImg || this.userData.profileImg
        };
      }
    } catch (err) {
      console.error("Дата авахад алдаа гарлаа:", err);
    }
    this.render(); 
  }

  async saveUserData() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Нэвтрэх шаардлагатай");

    const updatedFields = {
      bio: this.querySelector("#edit-bio").value,
      gender: this.querySelector("#edit-gender").value,
      ageGroup: this.querySelector("#edit-age").value,
      workHistory: this.querySelector("#edit-history").value
    };

    try {
      const response = await fetch(`http://localhost:3001/api/users/update/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });

      if (response.ok) {
        alert("Мэдээлэл амжилттай хадгалагдлаа!");
        this.userData = { ...this.userData, ...updatedFields };
        this.isEditing = false;
        this.render();
      }
    } catch (err) {
      alert("Хадгалахад алдаа гарлаа");
    }
  }

  async postFeedback() {
    const textInput = this.querySelector("#fb-text");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!textInput.value) return alert("Сэтгэгдэл бичнэ үү");

    const newFeedback = {
      userId: user?.id || "anonymous",
      name: user?.userName || this.querySelector("#fb-name").value || "Зочин",
      text: textInput.value,
      createdAt: new Date()
    };

    try {
      const response = await fetch('http://localhost:3001/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback)
      });

      if (response.ok) {
        this.feedbacks.unshift(newFeedback);
        this.render();
      }
    } catch (err) {
      console.error("Сэтгэгдэл илгээхэд алдаа гарлаа");
    }
  }

  // --- UI БҮТЭЦ ---

  render() {
    const user = JSON.parse(localStorage.getItem("user"));
    this.innerHTML = `
      <main>
        <div class="left-panel">
          <section class="info-card">
            <h3>Танилцуулга</h3>
            ${this.isEditing 
              ? `<textarea id="edit-bio">${this.userData.bio}</textarea>` 
              : `<div class="display-box">${this.userData.bio}</div>`}
          </section>

          <div class="info-row">
            <div class="info-box">
              <label>Хүйс:</label>
              ${this.isEditing 
                ? `<input type="text" id="edit-gender" value="${this.userData.gender}">` 
                : `<span>${this.userData.gender}</span>`}
            </div>
            <div class="info-age">
              <label>Нас:</label>
              ${this.isEditing 
                ? `<input type="text" id="edit-age" value="${this.userData.ageGroup}">` 
                : `<span>${this.userData.ageGroup}</span>`}
            </div>
          </div>

          <section class="info-card">
            <h3>Ажлын түүх</h3>
            ${this.isEditing 
              ? `<textarea id="edit-history">${this.userData.workHistory}</textarea>` 
              : `<div class="display-box">${this.userData.workHistory}</div>`}
          </section>

          <section class="info-card">
            <h3>Миний хийсэн ажлууд</h3>
            <div class="upload-controls">
              <input type="file" id="work-image-input" accept="image/*" style="display:none">
              <button id="add-work-btn" class="btn-green">+ Зураг нэмэх</button>
            </div>
            <div id="work-images-container" class="work-grid">
              ${this.workImages.map(img => `<div class="work-img-card"><img src="${img}"></div>`).join('')}
            </div>
          </section>

          <section class="info-card">
            <h3>Сэтгэгдэл</h3>
            <div class="feedback-form">
              <input type="text" id="fb-name" placeholder="Таны нэр" value="${user?.userName || ""}">
              <textarea id="fb-text" placeholder="Сэтгэгдэл бичих..."></textarea>
              <button id="submit-feedback">Илгээх</button>
            </div>
            <div id="feedback-list">
              ${this.feedbacks.map(fb => `
                <div class="feedback-item">
                  <strong>${fb.name}</strong>
                  <p>${fb.text}</p>
                </div>
              `).join('')}
            </div>
          </section>
        </div>

        <aside>
          <div class="profile-img-container">
            <img id="main-profile-img" src="${this.userData.profileImg}" alt="Profile">
            ${this.isEditing ? `<div class="img-overlay">Зураг солих</div>` : ''}
            
            <div id="avatar-picker" class="avatar-picker" style="display: none;">
               <p>Сонгох:</p>
               <div class="avatar-options">
                  <img class="avatar-opt" src="https://cdn-icons-png.flaticon.com/512/147/147144.png">
                  <img class="avatar-opt" src="https://cdn-icons-png.flaticon.com/512/1154/1154446.png">
                  <img class="avatar-opt" src="https://cdn-icons-png.flaticon.com/512/1154/1154452.png">
               </div>
               <hr>
               <input type="file" id="upload-custom-img" hidden>
               <button id="upload-trigger" class="btn-small">Өөрийн зураг</button>
            </div>
          </div>

          <div class="name-box">${user?.userName || "Нэр"}</div>

          <button id="edit-profile-btn" class="btn-edit">
            ${this.isEditing ? "💾 Хадгалах" : "⚙️ Профайл засах"}
          </button>
          
          <button id="request-btn">Хүсэлт илгээх</button>
          <button id="contact-btn">Холбоо барих</button>

          <div class="rating">
            ${[1,2,3,4,5].map(()=>'<button class="star">&#9734;</button>').join('')}
          </div>
          <p class="current_rating">0 of 5</p>
        </aside>
      </main>

      <div id="request-modal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Хүсэлт илгээх</h2>
          <label>Таны нэр</label>
          <input type="text" id="req-name" placeholder="Нэрээ оруулна уу" value="${user?.userName || ""}">
          <label>Утасны дугаар</label>
          <input type="text" id="req-phone" placeholder="Утас оруулна уу">
          <label>Хүсэлт / мессеж</label>
          <textarea id="req-message" placeholder="Хүсэлтээ бичнэ үү"></textarea>
          <button id="send-request">Илгээх</button>
        </div>
      </div>
    `;
    this.setupEvents();
  }

  setupEvents() {
    this.setupEditLogic();
    this.setupAvatarLogic();
    this.setupWorkGalleryLogic();
    this.setupRating();
    this.setupModal(); 
    
    // Feedback товчийг postFeedback-тэй холбох
    const fbBtn = this.querySelector("#submit-feedback");
    if (fbBtn) fbBtn.onclick = () => this.postFeedback();
  }

  setupEditLogic() {
    const editBtn = this.querySelector("#edit-profile-btn");
    editBtn.onclick = () => {
      if (this.isEditing) {
        // Хадгалах горимд байвал сервер рүү явуулна
        this.saveUserData();
      } else {
        // Засах горим руу шилжинэ
        this.isEditing = true;
        this.render();
      }
    };
  }

  // ... (setupAvatarLogic, setupWorkGalleryLogic, setupRating, setupModal функцууд таны бичсэнээр хэвээрээ ажиллана)
}

window.customElements.define('profile-component', Profile);