class ChHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
    <style>
    ch-header header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: auto; /* allow natural height */
      background-color: white;
      padding:0;
      margin:0;
      display:flex;
      justify-content:space-between;
      align-items:center;
      z-index: 5; /* lowered so popup (z-index:40) appears above header */
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    ch-header header img{
      width:30px;
      height:30px;
    }

    ch-header .logo{
      display:flex;
      align-items:center;
      gap:10px;
      padding:10px 20px;
    }

    ch-header .logo a{
      text-decoration:none;
      font-size:24px;
      color:#213448;
      font-weight:bold;
    }

    ch-header nav{
      padding:10px 20px;
    }

    ch-header nav ul{
      list-style-type:none;
      margin:0;
      padding:10px;
      display:flex;
      gap:15px;
      align-items:center;
    }

    ch-header nav ul li a{
      text-decoration:none;
      color:#333;
      cursor:pointer;
      transition: all 0.3s ease;
    }

    ch-header nav ul li a:hover{
      color: #213448;
    }

    ch-header nav ul li a.login-link{
      border-radius:6px;
      padding:10px 20px;
      cursor:pointer;
      background-color:#fff;
      border: 2px solid #213448;
      color: #213448;
      font-weight: 500;
      transition:all 0.3s ease;
    }

    ch-header nav ul li a.login-link:hover{
      background-color:#213448;
      color:white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(33, 52, 72, 0.2);
    }

    ch-header button{
      padding:10px 20px;
      border:2px solid #213448;
      background-color:#213448;
      color:white;
      cursor:pointer;
      border-radius:6px;
      font-weight: 500;
      font-size: 14px;
      transition:all 0.3s ease;
    }

    ch-header button:hover{
      background-color:#ffffff;
      color:#213448;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(33, 52, 72, 0.2);
    }

    </style>

    <header>
      <div class="logo">
        <img src="/public/icon/flower.png" alt="FindHire logo">
        <a href="/public/index.html">FindHire</a>
      </div>
      <div>
        <nav>
          <ul>
            <li>
              <a href="/about-us/about-us.html">Бидний тухай</a>
            </li>
            <li>
              <a href="/sign-in/sign-in.html" class="login-link">Нэвтрэх</a>
            </li>
            <li>
              <a href="/ajild-oroh/ajild-oroh.html">
                <button>Ажилд орох</button>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    `;
  }
}

customElements.define("ch-header", ChHeader);
