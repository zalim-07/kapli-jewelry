export function initProductCards() {
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
      }

      moreButton.addEventListener('click', (event) => {
        event.preventDefault();
        openSizes();
      });
    });
  }