export function initUiRadio() {
  document.addEventListener('click', (event) => {
    const radio = event.target.closest('.ui-radio--error');

    if (!radio || radio.classList.contains('ui-radio--disabled')) {
      return;
    }

    radio.classList.remove('ui-radio--error');

    const input = radio.querySelector('.ui-radio__input');

    if (input) {
      input.removeAttribute('aria-invalid');
    }
  });
}
