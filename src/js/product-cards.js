function setActiveImage(card, index) {
  const images = [
    ...card.querySelectorAll('.product-card__image'),
  ];

  const dots = [
    ...card.querySelectorAll('.product-card__dot'),
  ];

  images.forEach((image, imageIndex) => {
    const isActive = imageIndex === index;

    image.classList.toggle('is-active', isActive);
    image.setAttribute(
      'aria-hidden',
      isActive ? 'false' : 'true',
    );
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === index);
  });
}

function initProductCardGallery(card) {
  const zones = card.querySelectorAll('[data-product-zone]');

  if (zones.length <= 1) {
    return;
  }

  const stretchedLink = card.querySelector(
    '.product-card__stretched-link',
  );

  zones.forEach((zone) => {
    const index = Number(zone.dataset.productZone);

    if (!Number.isInteger(index)) {
      return;
    }

    zone.addEventListener('mouseenter', () => {
      setActiveImage(card, index);
    });

    zone.addEventListener('click', (event) => {
      event.preventDefault();
      stretchedLink?.click();
    });
  });

  card.addEventListener('mouseleave', () => {
    setActiveImage(card, 0);
  });
}

export function initProductCards() {
  document
    .querySelectorAll('[data-product-card]')
    .forEach(initProductCardGallery);

  const sizeGroups = document.querySelectorAll(
    '[data-product-sizes]',
  );

  sizeGroups.forEach((sizeGroup) => {
    const moreButton = sizeGroup.querySelector(
      '[data-product-sizes-more]',
    );

    if (!moreButton) {
      return;
    }

    function openSizes() {
      sizeGroup.classList.add('is-expanded');
      moreButton.setAttribute('aria-expanded', 'true');
      moreButton.blur();
    }

    moreButton.addEventListener('click', (event) => {
      event.preventDefault();
      openSizes();
    });
  });
}
