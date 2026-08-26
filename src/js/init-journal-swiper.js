import Swiper from 'swiper';

import 'swiper/css';
import { scheduleScrollTriggerRefresh } from './scroll-trigger-refresh.js';

const INITIAL_VISIBLE_COUNT = 4;

const DESKTOP_MAX = 1439;

function initAutoGridSwiper(swiperElement) {
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

function initJournalMore() {
    document.querySelectorAll('.journal').forEach((section) => {
        const button = section.querySelector('[data-journal-more]');
        const cards = section.querySelectorAll('.journal-card');

        if (!button) {
            return;
        }

        if (cards.length <= INITIAL_VISIBLE_COUNT) {
            button.hidden = true;
            return;
        }

        button.addEventListener('click', () => {
            section.classList.add('is-expanded');
            button.hidden = true;
            scheduleScrollTriggerRefresh();
        });
    });
}

export function initJournalSwiper() {
    initJournalMore();
    document
        .querySelectorAll('.journal-swiper')
        .forEach(initAutoGridSwiper);
}
