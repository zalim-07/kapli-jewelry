import { ScrollTrigger } from 'gsap/ScrollTrigger';

let refreshFrame = null;
let refreshTimeout = null;
let anchorScrolling = false;

export function setAnchorScrolling(isScrolling) {
    anchorScrolling = isScrolling;
}

export function scheduleScrollTriggerRefresh() {
    if (refreshFrame) {
        cancelAnimationFrame(refreshFrame);
    }

    if (refreshTimeout) {
        window.clearTimeout(refreshTimeout);
        refreshTimeout = null;
    }

    refreshFrame = requestAnimationFrame(() => {
        refreshFrame = null;

        if (anchorScrolling) {
            refreshTimeout = window.setTimeout(
                scheduleScrollTriggerRefresh,
                100,
            );
            return;
        }

        ScrollTrigger.refresh();
    });
}
