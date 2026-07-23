import './scss/main.scss';
import { initHeroSwiper } from './js/init-hero-swiper.js';
import { initProductCards } from './js/product-cards.js';
import { initCollections } from './js/collections.js';
import { initJourneySections } from './js/journey.js';



if (document.querySelector('.hero-swiper')) {
  initHeroSwiper();
}

if (document.querySelector('.featured, .collections')) {
  initProductCards();
}

if (document.querySelector('.collections')) {
  initCollections();
}

if (document.querySelector('.journey')) {
  initJourneySections();
}