class Profile extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.setupRating();
    this.setupModal();   // <<< Popup ажиллуулах
  }

  render() {
    this.innerHTML = `
      <header>
        <div class="logo">
          <img src="./flower.png" alt="Logo">
          <a href="#">FindHire</a>
        </div>
        <nav>
          <ul>
            <li><a href="#">Бидний тухай</a></li>
            <li><a href="#" class="login-link">Нэвтрэх / Бүртгүүлэх</a></li>
            <li><button>Ажилд орох</button></li>
          </ul>
        </nav>
      </header>

      <main>
        <div class="left-panel">
          <div class="taniltsuulga">Танилцуулга</div>
          <div class="info-row">
            <div class="info-box">Хүйс</div>
            <div class="info-age">Насны бүлэг</div>
          </div>

          <div class="ajliin-tuuh">Ажлын түүх</div>

          <section class="feedback-container">
            ${[1,2,3].map(()=>`
              <div class="feedback-box">
                <div class="box ajliin-tuuh feedback-section">
                  <strong>Сэтгэгдэл</strong>
                  <p class="feedback-text">Сэтгэгдэл бичих жишээ...</p>
                </div>
              </div>
            `).join('')}
          </section>
        </div>

        <aside>
          <img id="profile-img" src="./plumber.png" alt="Profile Image">
          <div class="name-box">Нэр</div>
          
          <button id="request-btn">Хүсэлт илгээх</button>
          <button id="request-btn">Холбоо барих</button>
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
          <input type="text" id="req-name" placeholder="Нэрээ оруулна уу">

          <label>Утасны дугаар</label>
          <input type="text" id="req-phone" placeholder="Утас оруулна уу">

          <label>Хүсэлт / мессеж</label>
          <textarea id="req-message" placeholder="Хүсэлтээ бичнэ үү"></textarea>
          <input type="file" name="zurag">

          <button id="send-request">Илгээх</button>
        </div>
      </div>
    `;
  }

  setupRating() {
    const stars = this.querySelectorAll('.star');
    const currentRatingText = this.querySelector('.current_rating');

    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        const rating = index + 1;
        currentRatingText.textContent = `${rating} of 5`;

        stars.forEach((s, i) => {
          s.innerHTML = i < rating ? '&#9733;' : '&#9734;';
        });
      });
    });
  }

  setupModal() {
    const modal = this.querySelector("#request-modal");
    const openBtn = this.querySelector("#request-btn");
    const closeBtn = this.querySelector(".close");
    const sendBtn = this.querySelector("#send-request");

    openBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    sendBtn.addEventListener("click", () => {
      const data = {
        name: this.querySelector("#req-name").value,
        phone: this.querySelector("#req-phone").value,
        message: this.querySelector("#req-message").value
      };

      console.log("Хүсэлт:", data);
      alert("Хүсэлт илгээгдлээ!");
      modal.style.display = "none";
    });
  }
}

window.customElements.define('profile-component', Profile);
