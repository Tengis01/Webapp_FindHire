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
      height: 10%;
      background-color: white;
      padding:0;
      margin:0;
      display:flex;
      justify-content:space-between;
      align-items:center;
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
    }

    ch-header nav ul li a.login-link{
      border-radius:4px;
      padding:8px 12px;
      cursor:pointer;
      background-color:rgb(255, 255, 255);
      border:none;
      transition:all 0.3s ease-in;
    }

    ch-header nav ul li a.login-link:hover{
      background-color:#213448;
      color:white;
    }

    ch-header button{
      padding:8px 12px;
      border:none;
      background-color:#213448;
      color:white;
      cursor:pointer;
      border-radius:4px;
    }

    ch-header button:hover{
      background-color:#ffffff;
      color:black;
      transition:all 0.3s ease-in-out;
    }

    </style>

    <header>
      <div class="logo">
        <img src="./flower.png" alt="">
        <a href="">FindHire</a>
      </div>
      <div>
        <nav>
          <ul>
            <li>
              <a href="">Бидний тухай</a>
            </li>
            <li>
              <a href="" class="login-link">Нэвтрэх/Бүртгүүлэх</a>
            </li>
            <li>
              <a href="">
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
