const basketBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartList = document.querySelector(".cart-list");
const productsDom = document.querySelector("#products-dom");

let buttonsDom = [];
let cart = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch(`https://64120b066e3ca31753052a96.mockapi.io/products`);
      let data = await result.json();
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
            <div class="col-lg-4 col-md-6">
            <div class="product">
              <div class="product-image">
                <img src="${product.image}" alt="product" />
              </div>
              <div class="product-hover">
                <span class="product-title">${product.title}</span>
                <span class="product-price">$${product.price}</span>
                <button class="btn-add-to-cart" data-id=${product.id}>
                  <i class="fas fa-cart-shopping"></i>
                </button>
              </div>
            </div>
          </div>
            `;
    });
    productsDom.innerHTML = result;
  }
  getClickButton() {
    const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
    buttonsDom = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.setAttribute("disabled", "disabled");
        button.style.opacity = ".3";
      } else {
        button.addEventListener("click", (event) => {
          event.target.disabled = true;
          event.target.style.opacity = ".3";
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.saveCartValues(cart);
          this.addCartItem(cartItem);
          this.showCart();
        });
      }
    });
  }
  saveCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(cart) {
    const li = document.createElement("li");
    li.classList.add("cart-list-item");
    li.innerHTML = `
     <div class="cart-left">
     <div class="cart-left-image">
       <img src="${cart.image}" alt="product" />
     </div>
     <div class="cart-left-info">
       <a class="cart-left-info-title" href="#">${cart.title}</a>
       <span class="cart-left-info-price">$${cart.price}</span>
     </div>
   </div>
   <div class="cart-right">
     <div class="cart-right-quantity">
       <button class="quantity-minus" data-id=${cart.id}>
         <i class="fas fa-minus"></i>
       </button>
       <span class="quantity">${cart.amount}</span>
       <button class="quantity-plus" data-id=${cart.id}>
         <i class="fas fa-plus"></i>
       </button>
     </div>
     <div class="cart-right-remove">
       <button class="cart-remove-btn" data-id=${cart.id}>
         <i class="fas fa-trash"></i>
       </button>
     </div>
   </div>
     `;
    cartList.appendChild(li);
  }
  showCart() {
    basketBtn.click();
  }
  setupAPP() {
    cart = Storage.getCart();
    this.saveCartValues(cart);
    this.populateCart(cart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartList.addEventListener("click", (event) => {
      if (event.target.classList.contains("cart-remove-btn")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        removeItem.parentElement.parentElement.parentElement.remove();
        this.removeItem(id);
      } else if (event.target.classList.contains("quantity-minus")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.saveCartValues(cart);
          lowerAmount.nextElementSibling.innerText = tempItem.amount;
        } else {
          lowerAmount.parentElement.parentElement.parentElement.remove();
          this.removeItem(id);
        }
      } else if (event.target.classList.contains("quantity-plus")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.saveCartValues(cart);
        addAmount.previousElementSibling.innerText = tempItem.amount;
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartList.children.length > 0) {
      cartList.removeChild(cartList.children[0]);
    }
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.saveCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.style.opacity = "1";
  }
  getSingleButton(id) {
    return buttonsDom.find((button) => button.dataset.id === id);
  }
}
class Storage {
  static saveProducts(products) {
    localStorage.setItem("veriler", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("veriler"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getClickButton();
      ui.cartLogic();
    });
});
