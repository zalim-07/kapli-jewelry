import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const DESKTOP_MIN = 768;

export function initProductGallery() {
    const gallery = document.querySelector('[data-product-gallery]');

    if (!gallery || gallery.classList.contains('product-gallery--static')) {
        return;
    }

    const swiperElement = gallery.querySelector('.product-gallery__swiper');
    const paginationElement = gallery.querySelector('.product-gallery__pagination');

    if (!swiperElement) {
        return;
    }

    const slideCount = swiperElement.querySelectorAll('.swiper-slide').length;
    const canLoop = slideCount > 1;

    new Swiper(swiperElement, {
        modules: [Navigation, Pagination],
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 4,
        speed: 400,
        loop: canLoop,
        navigation: {
            nextEl: gallery.querySelector('.product-gallery__button--next'),
            prevEl: gallery.querySelector('.product-gallery__button--prev'),
        },
        pagination: paginationElement
            ? {
                  el: paginationElement,
                  clickable: true,
              }
            : undefined,
        breakpoints: {
            [DESKTOP_MIN]: {
                slidesPerView: 2,
                slidesPerGroup: 1,
                spaceBetween: 4,
            },
        },
    });
}
