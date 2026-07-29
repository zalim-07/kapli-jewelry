import './scss/main.scss';
import { initHeroSwiper } from './js/init-hero-swiper.js';
import { initProductCards } from './js/product-cards.js';
import { initCollections } from './js/collections.js';
import { initJourneySections } from './js/journey.js';
import { initGiftPrices } from './js/gift.js';



if (document.querySelector('.hero-swiper')) {
  const startHero = () => initHeroSwiper();

  if (document.fonts?.ready) {
    document.fonts.ready.then(startHero);
  } else {
    startHero();
  }
}

if (document.querySelector('.featured, .collections, [data-collections]')) {
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