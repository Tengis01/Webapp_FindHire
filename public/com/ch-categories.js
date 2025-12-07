class ChCategories extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = /*html*/`
      <section class="categories" aria-label="Ангилал">
        <ul class="cat-grid">
          <cat-item name="Дотор засал" icon="./icon/paint-roller-2-svgrepo-com.svg" submenu="Будаг, Хана тааз засвар, Шал"></cat-item>
          <cat-item name="Тавилга угсралт" icon="./icon/wrench-svgrepo-com.svg" submenu="Гэр ахуйн, Оффис, Зөөвөр угсрах"></cat-item>
          <cat-item name="Цэвэрлэгээ" icon="./icon/cleaning-svgrepo-com.svg" submenu="Ерөнхий их, Орон сууц/байшин, Оффис"></cat-item>
          <cat-item name="Нүүлгэлт" icon="./icon/moving-truck-svgrepo-com.svg" submenu="Оффис нүүлгэлт, Том овор хүнд даац, Гэр нүүлгэлт"></cat-item>
          <cat-item name="Сантехник" icon="./icon/plumber-svgrepo-com.svg" submenu="Дотоод шугам, Гал тогоо/угаалтуур, Ариун цэврийн өрөө"></cat-item>
          <cat-item name="Гадна талбай" icon="./icon/gardening-grass-svgrepo-com.svg" submenu="Зүлэг хадах, Цас цэвэрлэх, Явган зам/хашаа"></cat-item>
          <cat-item name="Цахилгаан" icon="./icon/lightning-svgrepo-com.svg" submenu="Гэрэлтүүлэг, Розетка/унтраалга, Засвар үйлчилгээ"></cat-item>
        </ul>
      </section>
    `;
  }
}

customElements.define("ch-categories", ChCategories);
