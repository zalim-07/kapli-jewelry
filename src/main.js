import './scss/main.scss';
import { initHeroSwiper } from './js/init-hero-swiper.js';
import { initProductCards } from './js/product-cards.js';
import { initCollections } from './js/collections.js';
import { initJourneySections } from './js/journey.js';
import { initGiftPrices } from './js/gift.js';
import { initSidemenu } from './js/sidemenu.js';
import { initViewportScale } from './js/viewport-scale.js';
import { initNumbersSwiper } from './js/init-numbers-swiper.js';
import { initJournalSwiper } from './js/init-journal-swiper.js';

import { initProductTabs } from './js/product-tabs.js';

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

if (document.querySelector('.journal-swiper, .product-related-swiper')) {
  initJournalSwiper();
}

if (document.querySelector('.product-tabs')) {
  initProductTabs();
}