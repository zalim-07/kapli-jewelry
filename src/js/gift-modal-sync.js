export function syncGiftModalAmount() {
  const amountElement = document.querySelector('[data-gift-modal-amount]');
  const priceGroup = document.querySelector('[data-gift-prices]');

  if (!amountElement || !priceGroup) {
    return;
  }

  priceGroup.addEventListener('click', (event) => {
    const button = event.target.closest('.gift__price');

    if (!button) {
      return;
    }

    amountElement.textContent = button.textContent.trim();
  });
}
