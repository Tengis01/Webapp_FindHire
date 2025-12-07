// sign-in.js файл
class Signin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
            @import './sign-in.css';
        </style>
            
            <div class="container">
                <!-- Нэвтрэх хэсэг -->
                <div class="form-box active" id="box">
                    <form id="login-form">
                        <h2>Нэвтрэх</h2>
                        <input type="email" name="email" placeholder="Мэйл хаяг" required>
                        <input type="password" name="password" placeholder="Нууц үг" required>
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
                        <input type="text" name="lastname" placeholder="Овог" required>
                        <input type="text" name="firstname" placeholder="Нэр" required>
                        <input type="tel" name="phone" placeholder="Утасны дугаар" required>
                        <input type="text" name="address" placeholder="Хаяг" required>
                        <input type="email" name="Email" placeholder="Email" requiered>
                        <input type="password" name="password" placeholder="Нууц үг" required>
                        <select name="role" required> 
                            <option value="" disabled selected>Ажилчин эсвэл хэрэглэгч</option>
                            <option value="Ажилчин">Ажилчин</option>
                            <option value="Хэрэглэгч">Хэрэглэгч</option>
                        </select> 
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

customElements.define("sign-in", Signin);
