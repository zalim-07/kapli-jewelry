const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
  'Spacebar',
]);

export function initHeaderCart() {
  const cartButton = document.querySelector('.site-header__action--cart');
  const cart = document.querySelector('#site-cart');

  if (!cartButton || !cart) {
    return;
  }

  const backdrop = cart.querySelector('.site-cart__backdrop');
  const closeButton = cart.querySelector('.site-cart__close');
  let scrollY = 0;

  function isCartBodyTarget(target) {
    return Boolean(target?.closest?.('.site-cart__body'));
  }

  function preventPageScroll(event) {
    if (isCartBodyTarget(event.target)) {
      return;
    }

    event.preventDefault();
  }

  function preventScrollKeys(event) {
    if (!SCROLL_KEYS.has(event.key)) {
      return;
    }

    if (isCartBodyTarget(event.target)) {
      return;
    }

    event.preventDefault();
  }

  function lockScrollPosition() {
    if (window.scrollY !== scrollY) {
      window.scrollTo(0, scrollY);
    }
  }

  function open() {
    scrollY = window.scrollY;
    cart.classList.add('is-open');
    cart.setAttribute('aria-hidden', 'false');
    cartButton.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('is-cart-open');
    document.addEventListener('wheel', preventPageScroll, { passive: false });
    document.addEventListener('touchmove', preventPageScroll, {
      passive: false,
    });
    document.addEventListener('keydown', preventScrollKeys);
    window.addEventListener('scroll', lockScrollPosition, { passive: true });
  }

  function close() {
    cart.classList.remove('is-open');
    cart.setAttribute('aria-hidden', 'true');
    cartButton.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('is-cart-open');
    document.removeEventListener('wheel', preventPageScroll);
    document.removeEventListener('touchmove', preventPageScroll);
    document.removeEventListener('keydown', preventScrollKeys);
    window.removeEventListener('scroll', lockScrollPosition);
    cartButton.focus();
  }

  cartButton.addEventListener('click', () => {
    if (cart.classList.contains('is-open')) {
      close();
      return;
    }

    open();
  });

  backdrop?.addEventListener('click', close);
  closeButton?.addEventListener('click', close);

  cart.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');

    if (!link || !cart.contains(link) || !cart.classList.contains('is-open')) {
      return;
    }

    const hash = link.getAttribute('href');

    if (!hash || hash === '#' || !document.querySelector(hash)) {
      return;
    }

    close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && cart.classList.contains('is-open')) {
      close();
    }
  });
}
