import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scheduleScrollTriggerRefresh } from './scroll-trigger-refresh.js';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_INITIAL_VISIBLE_COUNT = 8;
const DEFAULT_LOAD_MORE_COUNT = 4;

function getSectionConfig(section) {
    const initial = Number(section.dataset.collectionsInitial);
    const step = Number(section.dataset.collectionsStep);

    return {
        initial: Number.isFinite(initial) && initial > 0
            ? initial
            : DEFAULT_INITIAL_VISIBLE_COUNT,
        step: Number.isFinite(step) && step > 0
            ? step
            : DEFAULT_LOAD_MORE_COUNT,
    };
}

function getProductCategories(card) {
    return (card.dataset.categories || '')
        .split(/\s+/)
        .filter(Boolean);
}

function watchVisibleImages(cards) {
    cards.forEach((card) => {
        if (card.hidden) {
            return;
        }

        card.querySelectorAll('img').forEach((image) => {
            if (image.complete) {
                return;
            }

            image.addEventListener(
                'load',
                scheduleScrollTriggerRefresh,
                { once: true },
            );
        });
    });
}

export function initCollections() {
    const sections = document.querySelectorAll(
        '[data-collections]',
    );

    sections.forEach((section) => {
        const cards = [
            ...section.querySelectorAll('[data-product-card]'),
        ];

        const filterButtons = [
            ...section.querySelectorAll(
                '[data-collection-filter]',
            ),
        ];

        const loadMoreButton = section.querySelector(
            '[data-collections-more]',
        );

        const action = section.querySelector(
            '[data-collections-action]',
        );

        if (!cards.length || !filterButtons.length) {
            return;
        }

        const { initial, step } = getSectionConfig(section);

        let activeCategory = 'all';
        let visibleCount = initial;

        function getFilteredCards() {
            if (activeCategory === 'all') {
                return cards;
            }

            return cards.filter((card) => {
                const categories = getProductCategories(card);

                return categories.includes(activeCategory);
            });
        }

        function updateFilters() {
            filterButtons.forEach((button) => {
                const isActive =
                    button.dataset.collectionFilter ===
                    activeCategory;

                button.classList.toggle('is-active', isActive);

                button.setAttribute(
                    'aria-pressed',
                    String(isActive),
                );
            });
        }

        function renderProducts() {
            const filteredCards = getFilteredCards();

            const visibleCards = new Set(
                filteredCards.slice(0, visibleCount),
            );

            cards.forEach((card) => {
                const shouldBeVisible =
                    visibleCards.has(card);

                card.hidden = !shouldBeVisible;

                card.classList.toggle(
                    'is-visible',
                    shouldBeVisible,
                );
            });

            const shownCount = Math.min(
                visibleCount,
                filteredCards.length,
            );

            const hasMore =
                shownCount < filteredCards.length;

            if (action) {
                action.hidden = !hasMore;
            }

            if (loadMoreButton) {
                loadMoreButton.disabled = !hasMore;

                const remaining =
                    filteredCards.length - shownCount;

                const nextCount = Math.min(
                    step,
                    remaining,
                );

                loadMoreButton.setAttribute(
                    'aria-label',
                    `Показать ещё ${nextCount} товара`,
                );
            }

            scheduleScrollTriggerRefresh();
            watchVisibleImages(cards);
        }

        function selectCategory(category) {
            activeCategory = category;
            visibleCount = initial;

            updateFilters();
            renderProducts();
        }

        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const category =
                    button.dataset.collectionFilter;

                if (!category) {
                    return;
                }

                selectCategory(category);
            });
        });

        loadMoreButton?.addEventListener('click', () => {
            visibleCount += step;
            renderProducts();
        });

        updateFilters();
        renderProducts();
    });
}