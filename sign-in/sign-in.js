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
                            <input type="email" id="reg-email" name="Email" placeholder="abc@example.com" required>
                        </div>
                        <div class="full-width">
                            <label for="reg-password">Нууц үг</label>
                            <input type="password" id="reg-password" name="password" placeholder="Нууц үг" required>
                        </div>
                        <div class="full-width">
                            <label for="reg-role">Төрөл сонгох</label>
                            <select id="reg-role" name="role" required> 
                                <option value="" disabled selected>Ажилчин эсвэл хэрэглэгч</option>
                                <option value="Ажилчин">Ажилчин</option>
                                <option value="Хэрэглэгч">Хэрэглэгч</option>
                            </select>
                        </div>
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

  handleLogin(form) {
    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    // Энд логик нэмэх (API call, validation гэх мэт)
    console.log("Нэвтрэх:", { email, password });
    alert("Нэвтрэх амжилттай!");
  }

  handleRegister(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Энд логик нэмэх (API call, validation гэх мэт)
    console.log("Бүртгүүлэх:", data);
    alert("Бүртгүүлэх амжилттай!");
  }
}

console.log('Defining sign-in custom element');
customElements.define("sign-in", Signin);
console.log('sign-in custom element defined');
