let refreshImpl = null;
let refreshFrame = null;
let refreshTimeout = null;
let anchorScrolling = false;

export function setAnchorScrolling(isScrolling) {
    anchorScrolling = isScrolling;
}

export function registerScrollTriggerRefresh(fn) {
    refreshImpl = fn;
}

export function scheduleScrollTriggerRefresh() {
    if (!refreshImpl) {
        return;
    }

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

        refreshImpl();
    });
}
