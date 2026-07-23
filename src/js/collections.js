const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 4;

function getProductCategories(card) {
    return (card.dataset.categories || '')
        .split(/\s+/)
        .filter(Boolean);
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

        let activeCategory = 'all';
        let visibleCount = INITIAL_VISIBLE_COUNT;

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
                    LOAD_MORE_COUNT,
                    remaining,
                );

                loadMoreButton.setAttribute(
                    'aria-label',
                    `Показать ещё ${nextCount} товара`,
                );
            }
        }

        function selectCategory(category) {
            activeCategory = category;
            visibleCount = INITIAL_VISIBLE_COUNT;

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
            visibleCount += LOAD_MORE_COUNT;
            renderProducts();
        });

        updateFilters();
        renderProducts();
    });
}