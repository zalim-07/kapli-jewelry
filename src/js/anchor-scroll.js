import {
    scheduleScrollTriggerRefresh,
    setAnchorScrolling,
} from './scroll-trigger-refresh.js';

function getScrollTopForTarget(target) {
    return Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY,
    );
}

function waitForScrollEnd(onComplete) {
    if ('onscrollend' in window) {
        window.addEventListener('scrollend', onComplete, {
            once: true,
        });
        return;
    }

    let lastScrollY = window.scrollY;
    let stableFrames = 0;

    function check() {
        const currentScrollY = window.scrollY;

        if (Math.abs(currentScrollY - lastScrollY) < 1) {
            stableFrames += 1;
        } else {
            stableFrames = 0;
            lastScrollY = currentScrollY;
        }

        if (stableFrames >= 4) {
            onComplete();
            return;
        }

        requestAnimationFrame(check);
    }

    requestAnimationFrame(check);
}

function scrollToTarget(target, { updateHistory = true } = {}) {
    const top = getScrollTopForTarget(target);

    setAnchorScrolling(true);

    window.scrollTo({
        top,
        behavior: 'smooth',
    });

    if (updateHistory) {
        const id = target.id;

        if (id) {
            history.pushState(null, '', `#${id}`);
        }
    }

    waitForScrollEnd(() => {
        setAnchorScrolling(false);
        scheduleScrollTriggerRefresh();
    });
}

function isSamePageHashLink(link) {
    const href = link.getAttribute('href');

    if (!href || !href.startsWith('#') || href === '#') {
        return false;
    }

    const url = new URL(link.href, window.location.href);

    return (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
    );
}

export function initAnchorScroll() {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');

        if (!link || !isSamePageHashLink(link)) {
            return;
        }

        const target = document.querySelector(link.getAttribute('href'));

        if (!target) {
            return;
        }

        event.preventDefault();
        scrollToTarget(target);
    });

    function scrollToInitialHash() {
        const { hash } = window.location;

        if (!hash || hash === '#') {
            return;
        }

        const target = document.querySelector(hash);

        if (!target) {
            return;
        }

        setAnchorScrolling(true);

        window.scrollTo({
            top: getScrollTopForTarget(target),
            behavior: 'auto',
        });

        requestAnimationFrame(() => {
            setAnchorScrolling(false);
            scheduleScrollTriggerRefresh();
        });
    }

    if (document.readyState === 'complete') {
        scrollToInitialHash();
    } else {
        window.addEventListener('load', scrollToInitialHash, {
            once: true,
        });
    }
}
