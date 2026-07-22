import Swiper from 'swiper';
import { Autoplay, EffectFade } from 'swiper/modules';

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

function modulo(value, total) {
  return ((value % total) + total) % total;
}

/**
 * Определяет кратчайшее направление перехода.
 *
 * Возвращает:
 *  1  — следующий слайд
 * -1  — предыдущий слайд
 */
function getCircularOffset(previousIndex, nextIndex, total) {
  if (previousIndex === nextIndex || total <= 1) {
    return 0;
  }

  const forward = modulo(nextIndex - previousIndex, total);
  const backward = forward - total;

  return Math.abs(forward) <= Math.abs(backward)
    ? forward
    : backward;
}

function createCircularPagination({
  element,
  slidesCount,
  getSwiper,
}) {
  const visibleBullets = 5;
  const bufferBullets = 2;
  const totalBullets = visibleBullets + bufferBullets * 2;

  const firstOffset = -Math.floor(totalBullets / 2);
  const lastOffset = Math.floor(totalBullets / 2);

  const track = document.createElement('div');
  track.className = 'hero-pagination__track';

  element.replaceChildren(track);

  let activeIndex = 0;
  let initialized = false;
  let requestedOffset = null;
  let resetTimer = null;

  function getStep() {
    const styles = getComputedStyle(element);

    return (
      Number.parseFloat(
        styles.getPropertyValue('--hero-pagination-step'),
      ) || 16
    );
  }

  function getInitialTranslate() {
    return -bufferBullets * getStep();
  }

  function setBulletState(button, relativeOffset) {
    const distance = Math.min(
      Math.abs(relativeOffset),
      bufferBullets + 1,
    );

    const isActive = relativeOffset === 0;
    const isVisible =
      Math.abs(relativeOffset) <=
      Math.floor(visibleBullets / 2);

    button.dataset.distance = String(distance);
    button.classList.toggle('is-active', isActive);
    button.tabIndex = isVisible ? 0 : -1;

    if (isActive) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  }

  function createBullet(relativeOffset, index) {
    const button = document.createElement('button');
    const dot = document.createElement('span');

    const targetIndex = modulo(
      index + relativeOffset,
      slidesCount,
    );

    button.className = 'hero-pagination__bullet';
    button.type = 'button';

    button.dataset.offset = String(relativeOffset);
    button.dataset.slideIndex = String(targetIndex);

    button.setAttribute(
      'aria-label',
      `Перейти к слайду ${targetIndex + 1}`,
    );

    dot.className = 'hero-pagination__dot';
    dot.setAttribute('aria-hidden', 'true');

    button.append(dot);

    setBulletState(button, relativeOffset);

    return button;
  }

  function clearResetTimer() {
    if (!resetTimer) {
      return;
    }

    window.clearTimeout(resetTimer);
    resetTimer = null;
  }

  function render(index) {
    clearResetTimer();

    activeIndex = index;
    initialized = true;

    const fragment = document.createDocumentFragment();

    for (
      let offset = firstOffset;
      offset <= lastOffset;
      offset += 1
    ) {
      fragment.append(createBullet(offset, index));
    }

    track.replaceChildren(fragment);

    element.classList.remove('is-animating');

    track.style.transition = 'none';
    track.style.transform = `translate3d(
      ${getInitialTranslate()}px,
      0,
      0
    )`;
  }

  function animateTo(index, offset) {
    if (!initialized) {
      render(index);
      return;
    }

    /*
     * Если пользователь переключил слайд до окончания
     * предыдущей анимации, сначала приводим пагинацию
     * к актуальному состоянию.
     */
    if (resetTimer) {
      render(activeIndex);
    }

    const limitedOffset = Math.max(
      -bufferBullets,
      Math.min(bufferBullets, offset),
    );

    if (limitedOffset === 0) {
      render(index);
      return;
    }

    const step = getStep();
    const initialTranslate = getInitialTranslate();
    const finalTranslate =
      initialTranslate - limitedOffset * step;

    const bullets = [
      ...track.querySelectorAll(
        '.hero-pagination__bullet',
      ),
    ];

    element.classList.add('is-animating');

    track.style.transition = 'none';
    track.style.transform = `translate3d(
      ${initialTranslate}px,
      0,
      0
    )`;

    /*
     * Принудительно фиксируем начальное положение,
     * чтобы браузер запустил CSS transition.
     */
    track.getBoundingClientRect();

    bullets.forEach((bullet) => {
      const oldOffset = Number(bullet.dataset.offset);
      const newOffset = oldOffset - limitedOffset;

      setBulletState(bullet, newOffset);
    });

    track.style.transition =
      'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';

    track.style.transform = `translate3d(
      ${finalTranslate}px,
      0,
      0
    )`;

    activeIndex = index;

    resetTimer = window.setTimeout(() => {
      render(index);
    }, 340);
  }

  function update(index) {
    if (!initialized) {
      render(index);
      return;
    }

    const offset =
      requestedOffset ??
      getCircularOffset(
        activeIndex,
        index,
        slidesCount,
      );

    requestedOffset = null;

    animateTo(index, offset);
  }

  element.addEventListener('click', (event) => {
    const bullet = event.target.closest(
      '.hero-pagination__bullet',
    );

    if (
      !bullet ||
      !element.contains(bullet) ||
      element.classList.contains('is-animating')
    ) {
      return;
    }

    const offset = Number(bullet.dataset.offset);
    const targetIndex = Number(
      bullet.dataset.slideIndex,
    );

    if (
      !Number.isInteger(offset) ||
      !Number.isInteger(targetIndex) ||
      offset === 0
    ) {
      return;
    }

    /*
     * Запоминаем выбранное визуальное направление.
     * Это особенно важно при трёх слайдах, потому что
     * крайние точки повторяют циклические индексы.
     */
    requestedOffset = Math.max(
      -bufferBullets,
      Math.min(bufferBullets, offset),
    );

    getSwiper()?.slideToLoop(targetIndex);
  });

  return {
    render,
    update,
  };
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

    fadeEffect: {
      crossFade: true,
    },

    on: {
      init(swiperInstance) {
        updateHeroTheme(swiperInstance);

        circularPagination?.render(
          swiperInstance.realIndex,
        );
      },

      realIndexChange(swiperInstance) {
        updateHeroTheme(swiperInstance);

        circularPagination?.update(
          swiperInstance.realIndex,
        );
      },
    },
  });
}