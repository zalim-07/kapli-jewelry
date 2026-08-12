import Swiper from 'swiper';
import { Autoplay, EffectFade } from 'swiper/modules';
import { createCircularPagination } from './circular-pagination.js';

import 'swiper/css';
import 'swiper/css/effect-fade';

const header = document.querySelector('.site-header');

function applyHeaderTheme(theme) {
  if (!header) {
    return;
  }

  const resolvedTheme = theme === 'light' ? 'light' : 'dark';

  header.classList.remove(
    'site-header--light',
    'site-header--dark',
  );

  header.classList.add(
    resolvedTheme === 'light'
      ? 'site-header--light'
      : 'site-header--dark',
  );

  header.dataset.theme = resolvedTheme;
}

function isHeroInteractiveTarget(target) {
  return Boolean(
    target.closest(
      'a, button, input, textarea, select, label, .hero-swiper__pagination',
    ),
  );
}

function initHeroSlideClickNavigation(
  heroSwiperEl,
  getSwiper,
) {
  const clickZoneWidth = 300;

  heroSwiperEl.addEventListener('click', (event) => {
    if (isHeroInteractiveTarget(event.target)) {
      return;
    }

    const slide = event.target.closest(
      '.hero-slide.swiper-slide-active',
    );

    if (!slide || !heroSwiperEl.contains(slide)) {
      return;
    }

    const swiper = getSwiper();

    if (!swiper) {
      return;
    }

    const { left, width } = slide.getBoundingClientRect();
    const clickX = event.clientX - left;

    if (clickX <= clickZoneWidth) {
      swiper.slidePrev();
      return;
    }

    if (clickX >= width - clickZoneWidth) {
      swiper.slideNext();
    }
  });
}

export function initHeroSwiper() {
  const heroSwiperEl =
    document.querySelector('.hero-swiper');

  if (!heroSwiperEl) {
    return;
  }

  const paginationEl = heroSwiperEl.querySelector(
    '.hero-swiper__pagination',
  );

  const slides = [
    ...heroSwiperEl.querySelectorAll('.hero-slide'),
  ];

  const slideThemes = slides.map(
    (slide) => slide.dataset.theme || 'dark',
  );

  let heroSwiper = null;
  let circularPagination = null;

  function updateHeroTheme(swiperInstance) {
    const theme =
      slideThemes[swiperInstance.realIndex] || 'dark';

    applyHeaderTheme(theme);
    heroSwiperEl.dataset.theme = theme;
  }

  if (paginationEl) {
    circularPagination = createCircularPagination({
      element: paginationEl,
      slidesCount: slides.length,
      getSwiper: () => heroSwiper,
    });
  }

  heroSwiper = new Swiper(heroSwiperEl, {
    modules: [Autoplay, EffectFade],

    loop: true,
    speed: 700,

    autoplay: {
      delay: 60000,
      disableOnInteraction: false,
    },

    effect: 'fade',

    simulateTouch: false,

    fadeEffect: {
      crossFade: true,
    },

    on: {
      init(swiperInstance) {
        updateHeroTheme(swiperInstance);

        circularPagination?.render(
          swiperInstance.realIndex,
        );

        requestAnimationFrame(() => {
          swiperInstance.update();
        });
      },

      realIndexChange(swiperInstance) {
        updateHeroTheme(swiperInstance);

        circularPagination?.update(
          swiperInstance.realIndex,
        );
      },
    },
  });

  initHeroSlideClickNavigation(
    heroSwiperEl,
    () => heroSwiper,
  );
}