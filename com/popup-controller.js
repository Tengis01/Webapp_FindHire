// com/popup-controller.js
window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("profiles-popup");
  if (!popup) return;

  // бүх cat-item авч, тэдний shadow доторх submenu-гийн <a>–уудыг олно
  const catItems = document.querySelectorAll("cat-item");

  catItems.forEach((item) => {
    const links = item.shadowRoot?.querySelectorAll(".submenu a") ?? [];
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();          // href="#"-ээс үсрэхгүй
        popup.open();                // бүх 21 товч нэг popup нээнэ
      });
    });
  });
popup.addEventListener("click", (e) => {
  const root = popup.shadowRoot;
  const wrapper = root.querySelector(".wrapper");

  // wrapper дээр дараагүй бол → маск дээр дарсан гэж үзээд хаана
  if (!wrapper.contains(e.target)) {
    popup.close();
  }
});

  // popup-ийн хар маск дээр дарахад хаах
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.close();
    }
  });
});
