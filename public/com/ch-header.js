class ChHeader extends HTMLElement {
  constructor() {
    super();
    this.user = null;
    this.balance = 0;
  }

  connectedCallback() {
    this.checkAuth();
  }

  async checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      this.user = data.user;

      // Fetch balance if logged in
      if (this.user) {
        await this.fetchBalance();
      }

      this.render();
    } catch (err) {
      console.error("Auth check failed", err);
      this.user = null;
      this.render();
    }
  }

  async fetchBalance() {
    try {
      const res = await fetch('/api/wallet/balance');
      const data = await res.json();
      this.balance = data.balance || 0;
    } catch (err) {
      console.error("Balance fetch failed", err);
      this.balance = 0;
    }
  }

  render() {
    const isLogged = !!this.user;

    // Determine what to show in the right side of nav
    let rightNavHtml = '';
    if (isLogged) {
      // Show Wallet + Profile Icon
      const initial = this.user.firstname ? this.user.firstname[0].toUpperCase() : 'U';
      const formattedBalance = this.balance.toLocaleString('en-US');
      rightNavHtml = `
            <li class="wallet-item">
                <button id="wallet-btn" class="wallet-btn" aria-label="Wallet">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                    <span class="balance-badge">${formattedBalance}₮</span>
                </button>
            </li>
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

    /* Wallet Button */
    .wallet-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: rgba(46, 125, 50, 0.1);
        border: 1px solid rgba(46, 125, 50, 0.3);
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s;
        color: #2e7d32;
        font-size: 14px;
        font-weight: 600;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4); }
        50% { box-shadow: 0 0 0 6px rgba(46, 125, 50, 0); }
    }

    .wallet-btn:hover {
        background: rgba(46, 125, 50, 0.15);
        border-color: rgba(46, 125, 50, 0.5);
        transform: translateY(-1px);
    }

    .balance-badge {
        white-space: nowrap;
    }

      /* Mobile Responsiveness */
      @media (max-width: 768px) {
        ch-header header {
          height: 60px;
          padding: 0 12px;
        }
        
        /* Hide About Us on Tablet/Mobile */
        .about-link {
          display: none;
        }

        .header-spacer {
          height: 60px;
        }

        ch-header .logo {
          left: 12px;
        }

        ch-header .logo img {
          width: 28px;
          height: 28px;
        }

        ch-header .logo a {
          font-size: 18px;
        }

        ch-header nav {
          padding-right: 0;
        }

        ch-header nav ul {
          gap: 10px; /* Reduced gap */
        }

        ch-header nav ul li a {
          font-size: 13px;
        }

        /* Compact buttons for mobile */
        ch-header .join-btn {
          padding: 8px 14px;
          font-size: 13px;
          white-space: nowrap;
        }
        
        ch-header nav ul li a.login-link {
            font-size: 13px;
            white-space: nowrap;
        }

        .profile-btn {
          width: 38px;
          height: 38px;
          font-size: 15px;
        }
      }

      @media (max-width: 480px) {
        /* Further adjustments for small screens */
        ch-header nav ul {
          gap: 8px;
        }

        ch-header .join-btn {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        ch-header nav ul li a.login-link {
           font-size: 12px;
           padding: 6px;
        }
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
            <li class="about-link">
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

    // Add Event Listeners
    if (isLogged) {
      // Wallet button
      const walletBtn = this.querySelector('#wallet-btn');
      if (walletBtn) {
        walletBtn.addEventListener('click', () => {
          const walletModal = document.querySelector('ch-wallet-modal');
          if (walletModal) {
            walletModal.open();
          } else {
            console.warn('Wallet modal not found in DOM');
          }
        });
      }

      // Profile button
      const profileBtn = this.querySelector('#profile-btn');
      if (profileBtn) {
        profileBtn.addEventListener('click', () => {
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
}

customElements.define("ch-header", ChHeader);
