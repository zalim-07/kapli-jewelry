import './scss/main.scss';
import { initProductCards } from './js/product-cards.js';
import { initCollections } from './js/collections.js';
import { initGiftPrices } from './js/gift.js';
import { initSidemenu } from './js/sidemenu.js';
import { initHeaderSticky } from './js/header-sticky.js';
import { initHeaderContacts } from './js/header-contacts.js';
import { initHeaderCart } from './js/header-cart.js';
import { initViewportScale } from './js/viewport-scale.js';
import { initAnchorScroll } from './js/anchor-scroll.js';
import { initProductTabs } from './js/product-tabs.js';
import { initCartPageItems } from './js/cart-page-items.js';
import { initUiRadio } from './js/ui-radio.js';
import { initUiCheckbox } from './js/ui-checkbox.js';
import { initCheckoutPayment } from './js/checkout-payment.js';

function initStaticHeaderTheme() {
  const header = document.querySelector('.site-header');

  if (!header || document.querySelector('.home-page')) {
    return;
  }

  header.dataset.theme = 'light';
  header.classList.remove('site-header--dark');
  header.classList.add('site-header--light');
}

initStaticHeaderTheme();
initHeaderSticky();
initHeaderContacts();
initHeaderCart();
initAnchorScroll();

if (document.querySelector('.featured, .collections, [data-collections], .product-related')) {
  initProductCards();
}

if (document.querySelector('[data-collections]')) {
  initCollections();
}

if (document.querySelector('[data-gift-prices]')) {
  initGiftPrices();
}

if (document.querySelector('#site-sidemenu')) {
  initSidemenu();
}

if (document.querySelector('.page-shell')) {
  initViewportScale();
}

if (document.querySelector('.product-tabs')) {
  initProductTabs();
}

if (document.querySelector('.cart-page .site-cart__item')) {
  initCartPageItems();
}

if (document.querySelector('.ui-radio')) {
  initUiRadio();
}

if (document.querySelector('.ui-checkbox')) {
  initUiCheckbox();
}

if (document.querySelector('[data-checkout-payment-card]')) {
  initCheckoutPayment();
}
