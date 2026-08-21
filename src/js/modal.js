const MODAL_ANIMATION_MS = 280;

function closeModal(modal) {
  if (!modal.classList.contains('is-open')) {
    return;
  }

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-modal-open');

  const trigger = document.querySelector(`[data-modal-open="${modal.id}"][aria-controls="${modal.id}"]`);

  window.setTimeout(() => {
    if (!modal.classList.contains('is-open')) {
      modal.hidden = true;
      trigger?.focus();
    }
  }, MODAL_ANIMATION_MS);
}

function openModal(modal) {
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-modal-open');

  requestAnimationFrame(() => {
    modal.classList.add('is-open');
  });

  const closeButton = modal.querySelector('.ui-modal__close');

  closeButton?.focus();
}

function bindRecipientToggle(checkbox) {
  const targetId = checkbox.dataset.modalRecipientToggle;

  if (!targetId) {
    return;
  }

  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  const input = target.querySelector('input, textarea, select');

  const sync = () => {
    const show = checkbox.checked;

    target.hidden = !show;

    if (input) {
      if (show) {
        input.removeAttribute('disabled');
      } else {
        input.setAttribute('disabled', '');
        input.value = '';
      }
    }
  };

  checkbox.addEventListener('change', sync);
  sync();
}

function bindUploadArea(area) {
  const input = area.querySelector('.ui-modal-form__upload-input');

  if (!input) {
    return;
  }

  area.addEventListener('dragover', (event) => {
    event.preventDefault();
    area.classList.add('is-dragover');
  });

  area.addEventListener('dragleave', () => {
    area.classList.remove('is-dragover');
  });

  area.addEventListener('drop', (event) => {
    event.preventDefault();
    area.classList.remove('is-dragover');

    const file = event.dataTransfer?.files?.[0];

    if (file) {
      input.files = event.dataTransfer.files;
    }
  });
}

export function initModal() {
  const modals = [...document.querySelectorAll('.ui-modal')];

  if (!modals.length) {
    return;
  }

  modals.forEach((modal) => {
    modal.querySelectorAll('[data-modal-close]').forEach((element) => {
      element.addEventListener('click', () => {
        closeModal(modal);
      });
    });

    modal.querySelectorAll('.ui-modal-form__upload-area').forEach(bindUploadArea);
  });

  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const modalId = trigger.dataset.modalOpen;
      const modal = document.getElementById(modalId);

      if (!modal) {
        return;
      }

      event.preventDefault();
      openModal(modal);
    });
  });

  document.querySelectorAll('[data-modal-recipient-toggle]').forEach((checkbox) => {
    bindRecipientToggle(checkbox);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    const openModalElement = document.querySelector('.ui-modal.is-open');

    if (openModalElement) {
      closeModal(openModalElement);
    }
  });
}

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
