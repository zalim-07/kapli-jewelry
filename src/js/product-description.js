const LINE_HEIGHT_TOLERANCE = 1;
const LINE_COUNT = 4;

export function initProductDescription() {
  document.querySelectorAll('[data-product-description]').forEach((description) => {
    const text = description.querySelector('.product-summary__description-text');
    const button = description.querySelector('.product-summary__description-toggle');
    const label = description.querySelector('.product-summary__description-toggle-label');
    const iconDown = description.querySelector('.product-summary__description-toggle-icon--down');
    const iconUp = description.querySelector('.product-summary__description-toggle-icon--up');

    if (!text || !button) {
      return;
    }

    function getCollapsedHeight() {
      const lineHeight = Number.parseFloat(getComputedStyle(text).lineHeight);

      return lineHeight * LINE_COUNT;
    }

    function setUi(expanded) {
      button.setAttribute('aria-expanded', String(expanded));

      if (label) {
        label.textContent = expanded ? 'Скрыть' : 'Показать все';
      }

      if (iconDown) {
        iconDown.hidden = expanded;
      }

      if (iconUp) {
        iconUp.hidden = !expanded;
      }
    }

    function updateToggleVisibility() {
      if (description.classList.contains('is-expanded')) {
        button.hidden = false;
        return;
      }

      description.classList.add('is-clamped');

      const isOverflowing =
        text.scrollHeight > getCollapsedHeight() + LINE_HEIGHT_TOLERANCE;

      button.hidden = !isOverflowing;

      if (!isOverflowing) {
        description.classList.remove('is-clamped');
        text.style.height = '';
        return;
      }

      text.style.height = `${getCollapsedHeight()}px`;
    }

    function setExpanded(expanded, animate = true) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!animate || reducedMotion) {
        description.classList.toggle('is-expanded', expanded);
        description.classList.toggle('is-clamped', !expanded);
        text.style.height = expanded ? 'auto' : `${getCollapsedHeight()}px`;
        setUi(expanded);

        if (!expanded) {
          updateToggleVisibility();
        }

        return;
      }

      if (expanded) {
        const startHeight = text.getBoundingClientRect().height;
        const endHeight = text.scrollHeight;

        text.style.height = `${startHeight}px`;

        requestAnimationFrame(() => {
          text.style.height = `${endHeight}px`;
        });

        description.classList.remove('is-clamped');
        description.classList.add('is-expanded');
        button.hidden = false;
        setUi(true);

        text.addEventListener(
          'transitionend',
          () => {
            text.style.height = 'auto';
          },
          { once: true },
        );

        return;
      }

      const startHeight = text.scrollHeight;
      const endHeight = getCollapsedHeight();

      text.style.height = `${startHeight}px`;

      requestAnimationFrame(() => {
        text.style.height = `${endHeight}px`;
      });

      description.classList.remove('is-expanded');
      description.classList.add('is-clamped');
      setUi(false);
    }

    button.addEventListener('click', () => {
      setExpanded(!description.classList.contains('is-expanded'));
    });

    description.classList.add('is-clamped');
    text.style.height = `${getCollapsedHeight()}px`;
    setUi(false);
    updateToggleVisibility();

    window.addEventListener('resize', updateToggleVisibility, { passive: true });
  });
}
