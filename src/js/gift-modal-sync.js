export function syncGiftModalAmount() {
  const amountElement = document.querySelector('[data-gift-modal-amount]');
  const productInput = document.querySelector('[data-gift-product-id]');
  const amountInput = document.querySelector('[data-gift-amount]');
  const priceGroup = document.querySelector('[data-gift-prices]');

  if (!amountElement || !priceGroup) {
    return;
  }

  function syncFromButton(button) {
    if (!button) {
      return;
    }

    amountElement.textContent = button.textContent.trim();

    if (productInput && button.dataset.productId) {
      productInput.value = button.dataset.productId;
    }

    if (amountInput && button.dataset.amount) {
      amountInput.value = button.dataset.amount;
    }
  }

  priceGroup.addEventListener('click', (event) => {
    const button = event.target.closest('.gift__price');

    if (!button) {
      return;
    }

    syncFromButton(button);
  });

  const activeButton = priceGroup.querySelector('.gift__price.is-active')
    || priceGroup.querySelector('.gift__price');

  syncFromButton(activeButton);
}
