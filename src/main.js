import './scss/main.scss';
import { initHeroSwiper } from './js/init-hero-swiper.js';
import { initProductCards } from './js/product-cards.js';
import { initCollections } from './js/collections.js';
import { initJourneySections } from './js/journey.js';
import { initGiftPrices } from './js/gift.js';
import { initSidemenu } from './js/sidemenu.js';
import { initHeaderSticky } from './js/header-sticky.js';
import { initHeaderContacts } from './js/header-contacts.js';
import { initHeaderCart } from './js/header-cart.js';
import { initViewportScale } from './js/viewport-scale.js';
import { initNumbersSwiper } from './js/init-numbers-swiper.js';
import { initJournalSwiper } from './js/init-journal-swiper.js';
import { initContentImageSlider } from './js/init-content-image-slider.js';
import { initProductGallery } from './js/init-product-gallery.js';
import { initAnchorScroll } from './js/anchor-scroll.js';
import { scheduleScrollTriggerRefresh } from './js/scroll-trigger-refresh.js';

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

if (document.querySelector('.hero-swiper')) {
  const startHero = () => initHeroSwiper();

  if (document.fonts?.ready) {
    document.fonts.ready.then(startHero);
  } else {
    startHero();
  }
}

if (document.querySelector('.featured, .collections, [data-collections], .product-related')) {
  initProductCards();
}

if (document.querySelector('[data-collections]')) {
  initCollections();
}

if (document.querySelector('.journey')) {
  initJourneySections();
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

if (document.querySelector('.numbers-swiper')) {
  initNumbersSwiper();
}

if (document.querySelector('.journal-swiper')) {
  initJournalSwiper();
}

if (document.querySelector('[data-content-image-slider]')) {
  initContentImageSlider();
}

if (document.querySelector('[data-product-gallery]')) {
  initProductGallery();
}

if (document.querySelector('.product-tabs')) {
  initProductTabs();
}

if (document.querySelector('.cart-page__item')) {
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

window.addEventListener('load', () => {
  scheduleScrollTriggerRefresh();
}, { once: true });