/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

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
      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createEle..*/
      thisProduct.element = utils.createDOMFromHTML(generateHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
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

    //   const app = {

    //     initMenu: function () {
    //       const thisApp = this;

    //       console.log('thisApp.data:', thisApp.data);
    //       for (let productData in thisApp.data.products) {
    //         new Product(productData, thisApp.data.products[productData]);
    //       }
    //     },

    //     init: function () {
    //       const thisApp = this;
    //       console.log('*** App starting ***');
    //       console.log('thisApp:', thisApp);
    //       console.log('classNames:', classNames);
    //       console.log('settings:', settings);
    //       console.log('templates:', templates);

    //       thisApp.initData();
    //       thisApp.initMenu();
    //     },

    //     initData: function () {
    //       const thisApp = this;

    //       thisApp.data = dataSource;
    //     }
    //   };



    //   app.init();
    // }
  }
}
