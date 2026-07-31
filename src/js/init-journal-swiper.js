import Swiper from 'swiper';

import 'swiper/css';

const DESKTOP_MAX = 1439;

export function initJournalSwiper() {
    const swiperElement = document.querySelector('.journal-swiper');

    if (!swiperElement) {
        return;
    }

    let swiper = null;
    const mediaQuery = window.matchMedia(
        `(max-width: ${DESKTOP_MAX}px)`,
    );

    function destroySwiper() {
        if (!swiper) {
            return;
        }

        swiper.destroy(true, true);
        swiper = null;
    }

    function createSwiper() {
        if (swiper) {
            return;
        }

        swiper = new Swiper(swiperElement, {
            slidesPerView: 'auto',
            slidesPerGroup: 1,
            spaceBetween: 4,
            slidesOffsetBefore: 4,
            slidesOffsetAfter: 4,
        });
    }

    function toggleSwiper() {
        if (mediaQuery.matches) {
            createSwiper();
            return;
        }

        destroySwiper();
    }

    toggleSwiper();
    mediaQuery.addEventListener('change', toggleSwiper);
}
