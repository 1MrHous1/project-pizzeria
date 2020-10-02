// import { select, classNames, templates } from '../settings.js';
// import { utils } from '../utils.js';
// import { AmountWidget } from './AmountWidget.js';
// export 
const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product', // CODE ADDED
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount', // CODE CHANGED
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
  // CODE ADDED START
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
  // CODE ADDED END
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  // CODE ADDED START
  cart: {
    wrapperActive: 'active',
  },
  // CODE ADDED END
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  }, // CODE CHANGED
  // CODE ADDED START
  cart: {
    defaultDeliveryFee: 20,
  },
  // CODE ADDED END
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  // CODE ADDED START
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
};



class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    console.log('new Cart', thisCart);
  }


  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
  }

  initCart: function () {
  const thisApp = this;
  const cartElem = document.querySelector(select.containerOf.cart);
  thisApp.cart = new Cart(cartElem);
}
add(menuProduct){
  console.log('adding product', menuProduct);
}
}



class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.initAccordion();
    thisProduct.initActions();
    app.cart.add(thisProduct);
    //console.log('new Product:', thisProduct);
  }
  renderInMenu() {
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data); /* generate HTML based on template */
    //console.log('generatedHTML', generatedHTML);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML); /* create element using utils.createElementFromHTML */
    const menuContainer = document.querySelector(select.containerOf.menu); /* find menu container */
    menuContainer.appendChild(thisProduct.element); /* add element to menu */
  }
  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    thisProduct.thisCart.dom.toggleTrigger = thisProduct.element.querySelector(select.thisCart.dom.wrapper);
  }

  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
  }

  initAccordion() {
    const thisProduct = this;
    // const clicableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); /* find the clicable trigger (the element that should react to clicking) */
    //console.log(clicableTrigger);
    // console.log('thisProduct', thisProduct);
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* START: click event listener to trigger */
      event.preventDefault(); /*prevent default action for event */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); /* toggle active class on element of thisProduct */
      // console.log('clicked');
      // console.log(thisProduct.element);
      const activeProducts = document.querySelectorAll(select.all.menuProducts); /* find all active products */
      // console.log(activeProducts);
      for (let activeProduct of activeProducts) {
        /* START LOOP: for each active product */
        if (activeProduct != thisProduct.element) {
          /* START: if the active product isn't the element of thisProduct */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive); /* remove class active for the active product */
        } /* END: if the active product isn't the elemnt of thisProduct */
      } /* END LOOP: for each active product */
    }); /* END: click event listener to trigger */
  }
  initOrderForm() {
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });
    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();

      thisProduct.processOrder();
      thisProduct.addToCart();
    });
    // console.log('initOrderForm - thisProduct', thisProduct);
  }
  processOrder() {
    const thisProduct = this;
    thisProduct.params = {};
    const formData = utils.serializeFormToObject(thisProduct.form);
    let price = thisProduct.data.price;
    for (let paramId in thisProduct.data.params) {
      // console.log(thisProduct.data.params[paramId]);
      const param = thisProduct.data.params[paramId];
      // console.log('param', param);
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        // console.log(optionSelected);
        if (optionSelected && !option.default) {
          price += option.price;
          // console.log('price', price);
        } else if (!optionSelected && option.default) {
          price -= option.price;
          // console.log('price', price);
        }
        const activeImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        // console.log('activeImages', activeImages);
        if (optionSelected) {
          if (!thisProduct.param[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].option[optionId] = option.label;
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for (let activeImage of activeImages) {
            activeImage.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let activeImage of activeImages) {
            activeImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }
  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}