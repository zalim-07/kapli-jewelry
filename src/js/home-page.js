import { initHeroSwiper } from './init-hero-swiper.js';
import { initJourneySections } from './journey.js';
import { initNumbersSwiper } from './init-numbers-swiper.js';
import { initJournalSwiper } from './init-journal-swiper.js';
import { scheduleScrollTriggerRefresh } from './scroll-trigger-refresh.js';
import { syncGiftModalAmount } from './gift-modal-sync.js';

if (document.querySelector('.hero-swiper')) {
  const startHero = () => initHeroSwiper();

  if (document.fonts?.ready) {
    document.fonts.ready.then(startHero);
  } else {
    startHero();
  }
}

if (document.querySelector('.journey')) {
  initJourneySections();
}

if (document.querySelector('.numbers-swiper')) {
  initNumbersSwiper();
}

if (document.querySelector('.journal-swiper')) {
  initJournalSwiper();
}

window.addEventListener('load', () => {
  scheduleScrollTriggerRefresh();
}, { once: true });

syncGiftModalAmount();
