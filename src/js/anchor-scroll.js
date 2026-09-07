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

export function scrollToHash({
    hash = window.location.hash,
    behavior = 'auto',
} = {}) {
    if (!hash || hash === '#') {
        return false;
    }

    const target = document.querySelector(hash);

    if (!target) {
        return false;
    }

    target.scrollIntoView({ behavior, block: 'start' });
    return true;
}

export function initAnchorScroll() {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');

        if (!link || link.hasAttribute('data-modal-open') || !isSamePageHashLink(link)) {
            return;
        }

        const hash = getLinkHash(link);
        const target = hash ? document.querySelector(hash) : null;

        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}
