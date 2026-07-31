function getLayoutMinWidth() {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--layout-min-width')
        .trim();

    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 390;
}

export function initViewportScale() {
    const shell = document.querySelector('.page-shell');

    if (!shell) {
        return;
    }

    const update = () => {
        const minWidth = getLayoutMinWidth();
        const scale = Math.min(1, window.innerWidth / minWidth);

        if (scale >= 1) {
            shell.style.removeProperty('margin-bottom');
            return;
        }

        shell.style.marginBottom = `${shell.offsetHeight * (scale - 1)}px`;
    };

    update();

    window.addEventListener('resize', update, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(update);
        observer.observe(shell);

        shell.querySelectorAll('img').forEach((image) => {
            if (!image.complete) {
                image.addEventListener('load', update, { once: true });
            }
        });
    }
}
