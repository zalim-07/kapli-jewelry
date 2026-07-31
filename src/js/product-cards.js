const DESKTOP_MAX = 1439;
const SWIPE_THRESHOLD = 40;
const SWIPE_AXIS_THRESHOLD = 10;

function setActiveImage(card, index) {
    const images = [
        ...card.querySelectorAll('.product-card__image'),
    ];

    const dots = [
        ...card.querySelectorAll('.product-card__dot'),
    ];

    images.forEach((image, imageIndex) => {
        const isActive = imageIndex === index;

        image.classList.toggle('is-active', isActive);
        image.setAttribute(
            'aria-hidden',
            isActive ? 'false' : 'true',
        );
    });

    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
    });
}

function getActiveImageIndex(card) {
    const images = [
        ...card.querySelectorAll('.product-card__image'),
    ];

    const activeIndex = images.findIndex((image) =>
        image.classList.contains('is-active'),
    );

    return activeIndex >= 0 ? activeIndex : 0;
}

function initProductCardHover(card) {
    const zones = card.querySelectorAll('[data-product-zone]');
    const mediaLink = card.querySelector('.product-card__media-link');

    zones.forEach((zone) => {
        const index = Number(zone.dataset.productZone);

        if (!Number.isInteger(index)) {
            return;
        }

        zone.addEventListener('mouseenter', () => {
            setActiveImage(card, index);
        });

        zone.addEventListener('click', (event) => {
            event.preventDefault();
            mediaLink?.click();
        });
    });

    card.addEventListener('mouseleave', () => {
        setActiveImage(card, 0);
    });
}

function initProductCardSwipe(card) {
    const media = card.querySelector('.product-card__media');
    const mediaLink = card.querySelector('.product-card__media-link');
    const images = card.querySelectorAll('.product-card__image');

    if (!media || images.length <= 1) {
        return () => {};
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalSwipe = false;
    let suppressLinkClick = false;

    function onTouchStart(event) {
        if (event.touches.length !== 1) {
            return;
        }

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        isHorizontalSwipe = false;
    }

    function onTouchMove(event) {
        if (event.touches.length !== 1) {
            return;
        }

        const deltaX = event.touches[0].clientX - touchStartX;
        const deltaY = event.touches[0].clientY - touchStartY;

        if (
            Math.abs(deltaX) > SWIPE_AXIS_THRESHOLD &&
            Math.abs(deltaX) > Math.abs(deltaY)
        ) {
            isHorizontalSwipe = true;
        }
    }

    function onTouchEnd(event) {
        if (!isHorizontalSwipe) {
            return;
        }

        const deltaX = event.changedTouches[0].clientX - touchStartX;

        if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
            return;
        }

        const currentIndex = getActiveImageIndex(card);
        const lastIndex = images.length - 1;
        const nextIndex =
            deltaX < 0
                ? Math.min(currentIndex + 1, lastIndex)
                : Math.max(currentIndex - 1, 0);

        if (nextIndex === currentIndex) {
            return;
        }

        setActiveImage(card, nextIndex);
        suppressLinkClick = true;
        window.setTimeout(() => {
            suppressLinkClick = false;
        }, 300);
    }

    function onMediaLinkClick(event) {
        if (!suppressLinkClick) {
            return;
        }

        event.preventDefault();
        suppressLinkClick = false;
    }

    media.addEventListener('touchstart', onTouchStart, {
        passive: true,
    });
    media.addEventListener('touchmove', onTouchMove, {
        passive: true,
    });
    media.addEventListener('touchend', onTouchEnd, {
        passive: true,
    });
    mediaLink?.addEventListener('click', onMediaLinkClick);

    return () => {
        media.removeEventListener('touchstart', onTouchStart);
        media.removeEventListener('touchmove', onTouchMove);
        media.removeEventListener('touchend', onTouchEnd);
        mediaLink?.removeEventListener('click', onMediaLinkClick);
    };
}

function initProductCardGallery(card) {
    const images = card.querySelectorAll('.product-card__image');

    if (images.length <= 1) {
        return;
    }

    const mobileMedia = window.matchMedia(
        `(max-width: ${DESKTOP_MAX}px)`,
    );

    let destroySwipe = null;
    let hoverInitialized = false;

    function enableHover() {
        if (hoverInitialized) {
            return;
        }

        initProductCardHover(card);
        hoverInitialized = true;
    }

    function enableSwipe() {
        if (destroySwipe) {
            return;
        }

        destroySwipe = initProductCardSwipe(card);
    }

    function disableSwipe() {
        destroySwipe?.();
        destroySwipe = null;
    }

    function toggleModes() {
        if (mobileMedia.matches) {
            enableSwipe();
            return;
        }

        disableSwipe();
        enableHover();
    }

    toggleModes();
    mobileMedia.addEventListener('change', toggleModes);
}

export function initProductCards() {
    document
        .querySelectorAll('[data-product-card]')
        .forEach(initProductCardGallery);

    const sizeGroups = document.querySelectorAll(
        '[data-product-sizes]',
    );

    sizeGroups.forEach((sizeGroup) => {
        const moreButton = sizeGroup.querySelector(
            '[data-product-sizes-more]',
        );

        if (!moreButton) {
            return;
        }

        function openSizes() {
            sizeGroup.classList.add('is-expanded');
            moreButton.setAttribute('aria-expanded', 'true');
            moreButton.blur();
        }

        moreButton.addEventListener('click', (event) => {
            event.preventDefault();
            openSizes();
        });
    });
}
