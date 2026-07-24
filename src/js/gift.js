export function initGiftPrices() {
    const priceGroups = document.querySelectorAll(
        '[data-gift-prices]',
    );

    priceGroups.forEach((group) => {
        const buttons = [
            ...group.querySelectorAll('.gift__price'),
        ];

        if (!buttons.length) {
            return;
        }

        function selectButton(activeButton) {
            buttons.forEach((button) => {
                const isActive = button === activeButton;

                button.classList.toggle('is-active', isActive);

                button.setAttribute(
                    'aria-pressed',
                    String(isActive),
                );
            });
        }

        const initialActive =
            buttons.find((button) =>
                button.classList.contains('is-active'),
            ) || buttons[0];

        selectButton(initialActive);

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                selectButton(button);
            });
        });
    });
}
