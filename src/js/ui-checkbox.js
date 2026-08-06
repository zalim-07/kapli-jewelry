export function initUiCheckbox() {
  document.addEventListener('change', (event) => {
    const input = event.target;

    if (!input.matches('.ui-checkbox__input') || !input.checked) {
      return;
    }

    const checkbox = input.closest('.ui-checkbox--error');

    if (!checkbox || checkbox.classList.contains('ui-checkbox--disabled')) {
      return;
    }

    checkbox.classList.remove('ui-checkbox--error');
    input.removeAttribute('aria-invalid');
  });
}
