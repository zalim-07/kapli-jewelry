import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function updateCaption(slider, captions, swiper) {
  const captionElement = slider.querySelector('.content-image-slider__caption');

  if (!captionElement) {
    return;
  }

  captionElement.textContent = captions[swiper.realIndex] || '';
}

function initSlider(slider) {
  const swiperElement = slider.querySelector('.content-image-slider__swiper');
  const paginationElement = slider.querySelector('.content-image-slider__pagination');

  if (!swiperElement) {
    return;
  }

  const slides = [
    ...swiperElement.querySelectorAll('.content-image-slider__slide'),
  ];
  const captions = slides.map(
    (slide) => slide.dataset.caption || '',
  );
  const canLoop = slides.length > 1;

  return new Swiper(swiperElement, {
    modules: [Navigation, Pagination],
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 400,
    loop: canLoop,
    navigation: {
      nextEl: slider.querySelector('.content-image-slider__button--next'),
      prevEl: slider.querySelector('.content-image-slider__button--prev'),
    },
    pagination: paginationElement && canLoop
      ? {
          el: paginationElement,
          clickable: true,
        }
      : undefined,
    on: {
      init(instance) {
        updateCaption(slider, captions, instance);
      },
      realIndexChange(instance) {
        updateCaption(slider, captions, instance);
      },
    },
  });
}

export function initContentImageSlider() {
  document
    .querySelectorAll('[data-content-image-slider]')
    .forEach(initSlider);
}
