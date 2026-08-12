import { gsap } from 'gsap';

const DEFAULT_CLASSES = {
  track: 'hero-pagination__track',
  bullet: 'hero-pagination__bullet',
  dot: 'hero-pagination__dot',
};

function modulo(value, total) {
  return ((value % total) + total) % total;
}

function getCircularOffset(previousIndex, nextIndex, total) {
  if (previousIndex === nextIndex || total <= 1) {
    return 0;
  }

  const forward = modulo(nextIndex - previousIndex, total);
  const backward = forward - total;

  return Math.abs(forward) <= Math.abs(backward)
    ? forward
    : backward;
}

export function createCircularPagination({
  element,
  slidesCount,
  getSwiper,
  classes = DEFAULT_CLASSES,
}) {
  const classNames = { ...DEFAULT_CLASSES, ...classes };
  const visibleBullets = slidesCount;
  const bufferBullets = 2;
  const totalBullets = visibleBullets + bufferBullets * 2;

  const firstOffset = -Math.floor(totalBullets / 2);
  const lastOffset = Math.floor(totalBullets / 2);

  const track = document.createElement('div');
  track.className = classNames.track;

  element.replaceChildren(track);
  element.style.setProperty(
    '--hero-pagination-visible-bullets',
    String(visibleBullets),
  );

  let activeIndex = 0;
  let initialized = false;
  let requestedOffset = null;
  let resetTimer = null;

  function getPaginationNumber(name, fallback) {
    const styles = getComputedStyle(element);

    return (
      Number.parseFloat(styles.getPropertyValue(name)) ||
      fallback
    );
  }

  function getStep() {
    return (
      getPaginationNumber('--hero-pagination-dot-size', 4) +
      getPaginationNumber('--hero-pagination-gap', 2)
    );
  }

  function parseCssTime(value, fallbackMs) {
    const trimmed = value.trim();

    if (!trimmed) {
      return fallbackMs;
    }

    const amount = Number.parseFloat(trimmed);

    if (!Number.isFinite(amount)) {
      return fallbackMs;
    }

    if (trimmed.endsWith('ms')) {
      return amount;
    }

    if (trimmed.endsWith('s')) {
      return amount * 1000;
    }

    return amount;
  }

  function getTransitionDuration() {
    const styles = getComputedStyle(element);
    const duration =
      styles.getPropertyValue('--hero-pagination-duration').trim() ||
      '400ms';

    return parseCssTime(duration, 400);
  }

  function getInitialTranslate() {
    return -bufferBullets * getStep();
  }

  function stopTrackAnimation() {
    gsap.killTweensOf(track);
  }

  function resetTrackPosition(translate) {
    stopTrackAnimation();

    gsap.set(track, {
      x: Math.round(translate),
      force3D: true,
    });
  }

  function setBulletState(button, relativeOffset) {
    const distance = Math.min(
      Math.abs(relativeOffset),
      bufferBullets + 1,
    );

    const isActive = relativeOffset === 0;
    const isVisible =
      Math.abs(relativeOffset) <=
      Math.floor(visibleBullets / 2);

    button.dataset.distance = String(distance);
    button.classList.toggle('is-active', isActive);
    button.tabIndex = isVisible ? 0 : -1;

    if (isActive) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  }

  function updateBulletContent(button, relativeOffset, index) {
    const targetIndex = modulo(
      index + relativeOffset,
      slidesCount,
    );

    button.dataset.offset = String(relativeOffset);
    button.dataset.slideIndex = String(targetIndex);
    button.setAttribute(
      'aria-label',
      `Перейти к слайду ${targetIndex + 1}`,
    );

    setBulletState(button, relativeOffset);
  }

  function createBullet(relativeOffset, index) {
    const button = document.createElement('button');
    const dot = document.createElement('span');

    button.className = classNames.bullet;
    button.type = 'button';

    dot.className = classNames.dot;
    dot.setAttribute('aria-hidden', 'true');

    button.append(dot);
    updateBulletContent(button, relativeOffset, index);

    return button;
  }

  function clearResetTimer() {
    if (resetTimer) {
      window.clearTimeout(resetTimer);
      resetTimer = null;
    }

    stopTrackAnimation();
  }

  function render(index) {
    clearResetTimer();

    activeIndex = index;
    initialized = true;

    const fragment = document.createDocumentFragment();

    for (
      let offset = firstOffset;
      offset <= lastOffset;
      offset += 1
    ) {
      fragment.append(createBullet(offset, index));
    }

    track.replaceChildren(fragment);

    element.classList.remove('is-animating');
    resetTrackPosition(getInitialTranslate());
  }

  function settleAfterAnimation(index, limitedOffset) {
    clearResetTimer();

    activeIndex = index;
    element.classList.remove('is-animating');
    resetTrackPosition(getInitialTranslate());

    if (limitedOffset > 0) {
      for (let i = 0; i < limitedOffset; i += 1) {
        track.append(track.firstElementChild);
      }
    } else if (limitedOffset < 0) {
      for (let i = 0; i < -limitedOffset; i += 1) {
        track.prepend(track.lastElementChild);
      }
    }

    [...track.children].forEach((bullet, bulletIndex) => {
      updateBulletContent(
        bullet,
        firstOffset + bulletIndex,
        index,
      );
    });
  }

  function animateTo(index, offset) {
    if (!initialized) {
      render(index);
      return;
    }

    if (gsap.isTweening(track)) {
      render(activeIndex);
    }

    const limitedOffset = Math.max(
      -bufferBullets,
      Math.min(bufferBullets, offset),
    );

    if (limitedOffset === 0) {
      render(index);
      return;
    }

    const step = getStep();
    const initialTranslate = getInitialTranslate();
    const finalTranslate =
      initialTranslate - limitedOffset * step;

    const bullets = [
      ...track.querySelectorAll(`.${classNames.bullet}`),
    ];

    element.classList.add('is-animating');
    resetTrackPosition(initialTranslate);

    bullets.forEach((bullet) => {
      const oldOffset = Number(bullet.dataset.offset);
      const newOffset = oldOffset - limitedOffset;

      setBulletState(bullet, newOffset);
    });

    activeIndex = index;

    let isFinished = false;

    const finishAnimation = () => {
      if (isFinished) {
        return;
      }

      isFinished = true;
      settleAfterAnimation(index, limitedOffset);
    };

    gsap.to(track, {
      x: Math.round(finalTranslate),
      duration: getTransitionDuration() / 1000,
      ease: 'sine.inOut',
      force3D: true,
      overwrite: true,
      onComplete: finishAnimation,
    });

    resetTimer = window.setTimeout(() => {
      finishAnimation();
    }, getTransitionDuration() + 100);
  }

  function update(index) {
    if (!initialized) {
      render(index);
      return;
    }

    const offset =
      requestedOffset ??
      getCircularOffset(
        activeIndex,
        index,
        slidesCount,
      );

    requestedOffset = null;

    animateTo(index, offset);
  }

  element.addEventListener('click', (event) => {
    const bullet = event.target.closest(`.${classNames.bullet}`);

    if (
      !bullet ||
      !element.contains(bullet) ||
      element.classList.contains('is-animating')
    ) {
      return;
    }

    const offset = Number(bullet.dataset.offset);
    const targetIndex = Number(
      bullet.dataset.slideIndex,
    );

    if (
      !Number.isInteger(offset) ||
      !Number.isInteger(targetIndex) ||
      offset === 0
    ) {
      return;
    }

    requestedOffset = Math.max(
      -bufferBullets,
      Math.min(bufferBullets, offset),
    );

    getSwiper()?.slideToLoop(targetIndex);
  });

  return {
    render,
    update,
  };
}
