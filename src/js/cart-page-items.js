function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function initCartPageItems() {
  const items = [...document.querySelectorAll('.cart-page .site-cart__item')];

  if (!items.length) {
    return;
  }

  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      if (canHover()) {
        return;
      }

      if (event.target.closest('a, .site-cart__item-remove')) {
        return;
      }

      const isActive = item.classList.contains('is-active');

      items.forEach((other) => {
        other.classList.remove('is-active');
      });

      if (!isActive) {
        item.classList.add('is-active');
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (canHover()) {
      return;
    }

    if (event.target.closest('.cart-page .site-cart__item')) {
      return;
    }

    items.forEach((item) => {
      item.classList.remove('is-active');
    });
  });
}
