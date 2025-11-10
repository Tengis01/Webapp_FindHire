class ChCategories extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="categories" aria-label="Ангилал">
        <ul class="cat-grid">
          <cat-item name="Дотор засал" icon="./icon/paint-roller-2-svgrepo-com.svg" submenu="Будалт · өнгө, Хана/тааз засвар, Шал, плита"></cat-item>
          <cat-item name="Тавилга угсралт" icon="./icon/wrench-svgrepo-com.svg" submenu="Гэр ахуйн, Оффис суурилуулалт, Зөөвөр/угсрах"></cat-item>
          <cat-item name="Цэвэрлэгээ" icon="./icon/cleaning-svgrepo-com.svg" submenu="Ерөнхий их, Орон сууц/байшин, Оффис, объект"></cat-item>
          <cat-item name="Нүүлгэлт" icon="./icon/moving-truck-svgrepo-com.svg" submenu="Сав баглаа, Ажлын хүч, Хот дотор/хооронд"></cat-item>
          <cat-item name="Сантехник" icon="./icon/plumber-svgrepo-com.svg" submenu="Дотоод шугам, Гал тогоо/угаалтуур, Суултуур, ванн"></cat-item>
          <cat-item name="Гадна талбай" icon="./icon/gardening-grass-svgrepo-com.svg" submenu="Зүлэг хадах, Цас цэвэрлэх, Явган зам/хашаа"></cat-item>
          <cat-item name="Цахилгаан" icon="./icon/lightning-svgrepo-com.svg" submenu="Гэрэлтүүлэг, Розетка/унтраалга, Засвар үйлчилгээ"></cat-item>
        </ul>
      </section>
    `;
  }
}

customElements.define("ch-categories", ChCategories);
