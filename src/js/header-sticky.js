export function initHeaderSticky() {
  const header = document.querySelector('.site-header');

  if (!header) {
    return;
  }

  const update = () => {
    if (document.documentElement.classList.contains('is-cart-open')) {
      return;
    }

    header.classList.toggle('is-sticky', window.scrollY > 0);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}
