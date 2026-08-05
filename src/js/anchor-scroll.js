import {
    scheduleScrollTriggerRefresh,
    setAnchorScrolling,
} from './scroll-trigger-refresh.js';

function normalizePathname(pathname) {
    if (!pathname || pathname === '/') {
        return '/';
    }

    return pathname.replace(/\/$/, '') || '/';
}

function getLinkHash(link) {
    const href = link.getAttribute('href');

    if (!href || href === '#') {
        return null;
    }

    if (href.startsWith('#')) {
        return href;
    }

    try {
        const url = new URL(href, window.location.href);

        if (!url.hash || url.hash === '#') {
            return null;
        }

        return url.hash;
    } catch {
        return null;
    }
}

function isSamePageHashLink(link) {
    const hash = getLinkHash(link);

    if (!hash) {
        return false;
    }

    const href = link.getAttribute('href');

    if (href.startsWith('#')) {
        return true;
    }

    try {
        const url = new URL(href, window.location.href);

        return (
            url.origin === window.location.origin &&
            normalizePathname(url.pathname) ===
                normalizePathname(window.location.pathname) &&
            url.search === window.location.search
        );
    } catch {
        return false;
    }
}

function getStickyHeaderOffset() {
    const header = document.querySelector('.site-header');

    if (!header) {
        return 0;
    }

    const wasSticky = header.classList.contains('is-sticky');

    if (!wasSticky) {
        header.classList.add('is-sticky');
    }

    const offset = header.getBoundingClientRect().height;

    if (!wasSticky) {
        header.classList.remove('is-sticky');
    }

    return offset;
}

function getScrollTopForTarget(target) {
    return Math.max(
        0,
        target.getBoundingClientRect().top +
            window.scrollY -
            getStickyHeaderOffset(),
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

export function initAnchorScroll() {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');

        if (!link || !isSamePageHashLink(link)) {
            return;
        }

        const hash = getLinkHash(link);
        const target = hash ? document.querySelector(hash) : null;

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
