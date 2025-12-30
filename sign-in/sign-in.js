// sign-in.js файл
class Signin extends HTMLElement {
  constructor() {
    super();
    console.log('Signin constructor called');
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    console.log('Signin connectedCallback called');
    this.render();
    this.setupEventListeners();
  }

  render() {
    console.log('Signin render called');
    this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="/sign-in/sign-in.css">
            
            <div class="container">
                <!-- Нэвтрэх хэсэг -->
                <div class="form-box active" id="box">
                    <form id="login-form">
                        <h2>Нэвтрэх</h2>
                        <div>
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" name="email" placeholder="abc@example.com" required>
                        </div>
                        <div>
                            <label for="login-password">Нууц үг</label>
                            <input type="password" id="login-password" name="password" placeholder="Нууц үг" required>
                        </div>
                        <button type="submit">Нэвтрэх</button>
                        <p>Шинээр хаяг үүсгэх үү? 
                            <a href="#" class="toggle-link">Бүртгүүлэх</a>
                        </p>
                    </form>
                </div>

                <!-- Бүртгүүлэх хэсэг -->
                <div class="form-box" id="burtguuleh">
                    <form id="register-form">
                        <h2>Бүртгүүлэх</h2>
                        <div>
                            <label for="reg-lastname">Овог</label>
                            <input type="text" id="reg-lastname" name="lastname" placeholder="Өөрийн овог" required>
                        </div>
                        <div>
                            <label for="reg-firstname">Нэр</label>
                            <input type="text" id="reg-firstname" name="firstname" placeholder="Өөрийн нэр" required>
                        </div>
                        <div>
                            <label for="reg-phone">Холбогдох утасны дугаар</label>
                            <input type="tel" id="reg-phone" name="phone" placeholder="99003322" maxlength="8" required>
                        </div>
                        <div>
                            <label for="reg-address">Хаяг</label>
                            <input type="text" id="reg-address" name="address" placeholder="Хаяг" required>
                        </div>
                        <div class="full-width">
                            <label for="reg-email">Email</label>
                            <input type="email" id="reg-email" name="email" placeholder="abc@example.com" required>
                        </div>
                        <div class="full-width">
                            <label for="reg-password">Нууц үг</label>
                            <input type="password" id="reg-password" name="password" placeholder="Нууц үг" required>
                        </div>
                        <!-- Role selector removed: User is default here -->
                        <button type="submit">Бүртгүүлэх</button>
                        <p>Хаягтай бол? 
                            <a href="#" class="toggle-link">Нэвтрэх</a>
                        </p>
                    </form>
                </div>
            </div>
        `;
  }

  setupEventListeners() {
    // Form солих event listener
    const toggleLinks = this.shadowRoot.querySelectorAll(".toggle-link");
    toggleLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleForms();
      });
    });

    // Form submit event listeners
    const loginForm = this.shadowRoot.getElementById("login-form");
    const registerForm = this.shadowRoot.getElementById("register-form");

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin(loginForm);
    });

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleRegister(registerForm);
    });
  }

  toggleForms() {
    const loginBox = this.shadowRoot.getElementById("box");
    const registerBox = this.shadowRoot.getElementById("burtguuleh");

    loginBox.classList.toggle("active");
    registerBox.classList.toggle("active");
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      // Success
      alert('Амжилттай нэвтэрлээ!');
      window.location.href = '/'; // Redirect to home
    } catch (err) {
      alert(err.message);
    }
  }

  async handleRegister(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      // API call to /api/auth/signup/user
      const response = await fetch('/api/auth/signup/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      alert('Бүртгүүлэх амжилттай!');
      window.location.href = '/'; // Redirect to home
    } catch (err) {
      alert(err.message);
    }
  }
}

console.log('Defining sign-in custom element');
customElements.define("sign-in", Signin);
console.log('sign-in custom element defined');
