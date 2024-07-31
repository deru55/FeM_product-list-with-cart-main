const dessertCartContainer = document.getElementById("desserts-card-container");
const totalItemsCounts = document.getElementById("total-number-of-items");
const productsContainer = document.getElementById("products-container");
const orderContainer = document.getElementById("order-container");
const orderConfirmedMsg = document.getElementById("order-confirmed");
const confirmBtn = document.getElementById("confirm-btn");
const newOrderBtn = document.getElementById("new-order-btn");

(async (e) => {
  try {
    const res = await fetch("./data.json");
    const data = await res.json();
    showProducts(data);
  } catch (err) {
    console.error("Promise rejected");
  }
})();

const showProducts = (productsArr) => {
  productsArr.forEach(({ image, category, name, price }, index) => {
    dessertCartContainer.innerHTML += `
        <div id="dessert-card-${index}">
          <picture>
            <source media="(min-width:769px)" srcset="${image.desktop}">
            <source media="(min-width:426px)" srcset="${image.tablet}">
            <img src="${image.mobile}" class="product-img" />
          </picture>

          <div class="btn-states">
            <button class="btn btn--add-to-cart btn--default-state | flex-row" onclick="cart.addItemBtn('${name}', ${price}, ${index}, '${
      image.thumbnail
    }')">
              <img src="./assets/images/icon-add-to-cart.svg" />
              Add to Cart
            </button>

            <div class="btn btn--qty-state | visibilityHidden">
              <button class="qty-btn qty-btn--decrement" onclick="cart.incrDecrQtyBtns(${index}, ${price}, 'decrement')">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="var(--fill-clr, #fff)" d="M0 .375h10v1.25H0V.375Z"/></svg>
              </button>

              <span class="product-count"></span>

              <button class="qty-btn qty-btn--increment"  onclick="cart.incrDecrQtyBtns(${index}, ${price}, 'increment')">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="var(--fill-clr, #fff)" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
              </button>
            </div>
          </div>

          <p class="txt-neutral-4 fs-300">${category}</p>
          <h3 class="fw-medium">${name}</h3>
          <p class="txt-primary-1 fw-medium">$${price.toFixed(2)}</p>
        </div>
    `;
  });
};

class ShoppingCart {
  constructor() {
    this.items = {};
    this.prices = {};
  }

  addItemBtn(name, price, id, image) {
    btnQtyState(id, true);

    productsContainer.innerHTML += `
      <div id="dessert-${id}" class="product product--grid-area-cart">
        <p class="product--grid-area-cart--item1 | fw-bold">${name}</p>

        <div class="product--grid-area-cart--item2 | flex-row fw-medium">
          <p class="txt-primary-1"><span class="product-count"></span>x</p>
          <span class="txt-neutral-3">@ $${price.toFixed(2)}</span>
          <p class="txt-neutral-5">$<span class="total-product-price"></span></p>
        </div>

        <button onclick="cart.deleteEntry(${id}, ${price})" class="product--grid-area-cart--item3 qty-btn qty-btn--delete"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="var(--fill-clr, #caafa7)" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg></button>
      </div>
    `;

    orderContainer.innerHTML += `
      <div id="order-product-${id}" class="product product--grid-area-order-confirmed">
        <img src="${image}" class="product--grid-area-order-confirmed--item1 | thumbnail-img" />

        <p class="product--grid-area-order-confirmed--item2 | fw-bold fs-300 txt-overflow">${name}</p>

        <div class="product--grid-area-order-confirmed--item3 | flex-row fw-medium fs-300">
          <p class="txt-primary-1"><span class="product-count"></span>x</p>
          <span class="txt-neutral-3">@ $${price.toFixed(2)}</span>
        </div>

        <p class="product--grid-area-order-confirmed--item4 fw-bold">$<span class="total-product-price padding-right"></span></p>
      </div>
    `;

    this.items[id] = (this.items[id] || 0) + 1;
    this.prices[id] = price;

    this.updateOutputs(id, price);
  }

  incrDecrQtyBtns(id, price, action) {
    if (action === "decrement") {
      this.items[id] = this.items[id] - 1;
      if (this.items[id] === 0) {
        this.deleteEntry(id);
        return;
      }
    } else if (action === "increment") {
      this.items[id] = this.items[id] + 1;
    }

    this.updateOutputs(id, price);
  }

  updateOutputs(id, price) {
    const currentProductCountBtn = document.querySelector(
      `#dessert-card-${id} .product-count`
    );
    const productCountCartSpan = document.querySelector(
      `#dessert-${id} .product-count`
    );
    const productPriceCartSpan = document.querySelector(
      `#dessert-${id} .total-product-price`
    );
    const totalOrderSpan = document.getElementsByClassName("total-order");
    const productCountOrderSpan = document.querySelector(
      `#order-product-${id} .product-count`
    );
    const productPriceOrderSpan = document.querySelector(
      `#order-product-${id} .total-product-price`
    );

    currentProductCountBtn.textContent = this.items[id];

    cartState();
    totalItemsCounts.textContent = this.getTotalItemsCounts();
    if (productCountCartSpan && productPriceCartSpan) {
      productCountCartSpan.textContent = this.items[id];
      productPriceCartSpan.textContent = this.getTotalProductPrice(
        id,
        price
      ).toFixed(2);
    }

    [...totalOrderSpan].forEach((item) => {
      item.textContent = `$${this.calculateTotal().toFixed(2)}`;
    });

    if (productCountOrderSpan && productPriceOrderSpan) {
      productCountOrderSpan.textContent = this.items[id];
      productPriceOrderSpan.textContent = this.getTotalProductPrice(
        id,
        price
      ).toFixed(2);
    }
  }

  getTotalProductPrice(id, price) {
    return this.items[id] * price;
  }

  getTotalItemsCounts() {
    let total = 0;

    for (let i in this.items) {
      total += this.items[i];
    }
    return total;
  }

  calculateTotal() {
    let total = 0;

    for (let i in this.prices) {
      total += this.items[i] * this.prices[i];
    }
    return total;
  }

  deleteEntry(id) {
    btnQtyState(id, false);
    document.getElementById(`dessert-${id}`).remove();
    delete this.items[id];
    delete this.prices[id];
    document.getElementById(`order-product-${id}`).remove();

    this.updateOutputs(id);
  }

  reset() {
    location.reload();
  }
}

const cart = new ShoppingCart();

const btnQtyState = (id, isBtnQtyStateShowing) => {
  const productImg = document.querySelector(`#dessert-card-${id} .product-img`);
  const homeState = document.querySelector(
    `#dessert-card-${id} .btn--default-state`
  );
  const qtyState = document.querySelector(
    `#dessert-card-${id} .btn--qty-state`
  );

  isBtnQtyStateShowing
    ? (qtyState.classList.remove("visibilityHidden"),
      (homeState.disabled = true),
      productImg.classList.add("product-selected"))
    : (qtyState.classList.add("visibilityHidden"),
      (homeState.disabled = false),
      productImg.classList.remove("product-selected"));
};

const cartState = () => {
  const homeState = document.getElementById("cart-section--default-state");
  const orderState = document.getElementById("cart-section--order-state");

  cart.getTotalItemsCounts() > 0
    ? (orderState.classList.remove("displayHidden"),
      homeState.classList.add("displayHidden"))
    : (orderState.classList.add("displayHidden"),
      homeState.classList.remove("displayHidden"));
};

confirmBtn.addEventListener("click", () => {
  orderConfirmedMsg.classList.remove("displayHidden");
  document.querySelector("body").style.overflowY = "hidden";
});

newOrderBtn.addEventListener("click", cart.reset);
