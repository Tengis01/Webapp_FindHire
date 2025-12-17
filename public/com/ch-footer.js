class CHFooter extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.render();}
    render() {
    this.innerHTML = `
    <style>
    .site-footer {
  background-color: #213448 ;
  color: #ffffff;
  font-family: Arial, sans-serif;;
}

.footer-container {
  max-width: 1100px;
  margin: auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 30px;
}

.footer-about h3 {
  font-size: 22px;
  margin-bottom: 10px;
}

.footer-about p {
  font-size: 14px;
  line-height: 1.6;
  color: #cbd5e1;
}

.footer-links h4,
.footer-contact h4 {
  margin-bottom: 12px;
  font-size: 16px;
}

.footer-links ul {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
}

.footer-links a:hover {
  color: #38bdf8;
}

.footer-contact p {
  font-size: 14px;
  margin-bottom: 6px;
  color: #cbd5e1;
}

.footer-bottom {
  background-color: #213448;;
  text-align: center;
  padding: 15px;
  font-size: 13px;
  color: #9ca3af;
}
</style>
    <footer class="site-footer">
  <div class="footer-container">

    <div class="footer-about">
      <h3>MyWebsite</h3>
      <p>
        Чанартай үйлчилгээ, найдвартай гүйцэтгэл.
        Бид таны ажлыг хялбар болгоно.
      </p>
    </div>

    <div class="footer-links">
      <h4>Холбоосууд</h4>
      <ul>
        <li><a href="#">Нүүр</a></li>
        <li><a href="#">Үйлчилгээ</a></li>
        <li><a href="#">Ажлууд</a></li>
        <li><a href="#">Холбоо барих</a></li>
      </ul>
    </div>

    <div class="footer-contact">
      <h4>Холбоо барих</h4>
      <p>📍 Улаанбаатар, Монгол улс</p>
      <p>📞 +976 7000-0000</p>
      <p>✉️ info@findhire.mn</p>
    </div>

  </div>

  <div class="footer-bottom">
    © 2025 MyWebsite. Бүх эрх хуулиар хамгаалагдсан.
  </div>
</footer>


    


      `
    }
}
customElements.define("ch-footer", CHFooter);
