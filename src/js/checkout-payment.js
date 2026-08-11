export function initCheckoutPayment() {
    const cards = document.querySelectorAll('[data-checkout-payment-card]');

    if (!cards.length) {
        return;
    }

    const syncActiveState = () => {
        cards.forEach((card) => {
            const input = card.querySelector('.ui-radio__input');

            card.classList.toggle(
                'checkout-payment-card--active',
                Boolean(input?.checked),
            );
        });
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            const input = card.querySelector('.ui-radio__input');

            if (!input || input.disabled || input.checked) {
                return;
            }

            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            syncActiveState();
        });
    });

    document.addEventListener('change', (event) => {
        if (event.target instanceof HTMLInputElement
            && event.target.matches('[data-checkout-payment-card] .ui-radio__input')) {
            syncActiveState();
        }
    });

    syncActiveState();
}
