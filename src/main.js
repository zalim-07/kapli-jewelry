import './scss/main.scss';
import { initHeroSwiper } from './js/init-hero-swiper.js';
import { initProductCards } from './js/product-cards.js';
import { initCollections } from './js/collections.js';

if (document.querySelector('.hero-swiper')) {
  initHeroSwiper();
}

if (document.querySelector('.featured, .collections')) {
  initProductCards();
}

if (document.querySelector('.collections')) {
  initCollections();
}