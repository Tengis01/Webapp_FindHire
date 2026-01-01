class ChHeader extends HTMLElement {
  constructor() {
    super();
    this.user = null;
  }

  connectedCallback() {
    this.checkAuth();
  }

  async checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      this.user = data.user;
      this.render();
    } catch (err) {
      console.error("Auth check failed", err);
      this.user = null; // Treat as logged out
      this.render();
    }
  }

  render() {
    const isLogged = !!this.user;

    // Determine what to show in the right side of nav
    let rightNavHtml = '';
    if (isLogged) {
      // Show Profile Icon
      const initial = this.user.firstname ? this.user.firstname[0].toUpperCase() : 'U';
      rightNavHtml = `
            <li class="profile-item">
                <button id="profile-btn" class="profile-btn" aria-label="Profile">
                    ${initial}
                </button>
            </li>
        `;
    } else {
      // Show Login/Join
      rightNavHtml = `
            <li>
              <a href="/sign-in/sign-in.html" class="login-link">Нэвтрэх</a>
            </li>
            <li>
              <a href="/ajild-oroh/ajild-oroh.html">
                <button class="join-btn">Ажилд орох</button>
              </a>
            </li>
        `;
    }

    this.innerHTML = `
    <style>
    ch-header header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 70px;
      /* background-color: white; */
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding:0;
      margin:0;
      display:flex;
      justify-content:flex-end; /* Push nav to right since logo is absolute */
      align-items:center;
      z-index: 50; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      font-family: 'Inter', sans-serif;
    }

    /* Spacer to prevent content hiding behind fixed header */
    .header-spacer {
        height: 70px;
        width: 100%;
    }

    ch-header header img{
      width:32px;
      height:32px;
    }

    ch-header .logo{
      position: absolute; /* Absolute positioning */
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      display:flex;
      align-items:center;
      gap:12px;
      /* padding-left removed */
    }

    ch-header .logo a{
      text-decoration:none;
      font-size:20px;
      color:#213448;
      font-weight:700;
      letter-spacing: -0.5px;
    }

    ch-header nav{
      padding-right: 5%;
      margin-left: auto; /* Ensure it stays right */
    }

    ch-header nav ul{
      list-style-type:none;
      margin:0;
      padding:0;
      display:flex;
      gap:20px;
      align-items:center;
    }

    ch-header nav ul li a{
      text-decoration:none;
      color:#64748B;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    ch-header nav ul li a:hover{
      color: #213448;
    }

    /* Login Link specific style override if needed */
    ch-header nav ul li a.login-link {
        color: #213448;
        font-weight: 600;
    }
    
    /* Join Button */
    ch-header .join-btn {
      padding:10px 24px;
      border:none;
      background-color:#213448;
      color:white;
      cursor:pointer;
      border-radius:8px;
      font-weight: 600;
      font-size: 14px;
      transition:all 0.2s ease;
    }

    ch-header .join-btn:hover{
      background-color:#334b63;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(33, 52, 72, 0.15);
    }

    /* Profile Button */
    .profile-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #F1F5F9;
        color: #213448;
        border: 2px solid #E2E8F0;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .profile-btn:hover {
        background-color: #E2E8F0;
        border-color: #CBD5E1;
    }

    </style>

    <header>
      <div class="logo">
        <img src="/public/icon/flower.png" alt="FindHire logo">
        <a href="/">FindHire</a>
      </div>
      <div>
        <nav>
          <ul>
            <li>
              <a href="/about-us/about-us.html">Бидний тухай</a>
            </li>
            ${rightNavHtml}
          </ul>
        </nav>
      </div>
    </header>
    <!-- We inject a spacer so page content isn't covered by fixed header -->
    <div class="header-spacer"></div>
    `;

    // Add Event Listener to Profile Button
    if (isLogged) {
      const btn = this.querySelector('#profile-btn');
      btn.addEventListener('click', () => {
        // Dispatch event or find popup directly
        // Option 1: find custom element in DOM
        const popup = document.querySelector('ch-profile-popup');
        if (popup) {
          popup.open(this.user);
        } else {
          console.warn('Profile popup component not found in DOM');
        }
      });
    }
  }
}

customElements.define("ch-header", ChHeader);
