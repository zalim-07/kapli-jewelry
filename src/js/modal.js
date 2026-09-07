import { initModalUploads } from './modal-upload.js';

const MODAL_ANIMATION_MS = 280;
const MOBILE_MEDIA = window.matchMedia('(max-width: 767px)');

let scrollY = 0;
let scrollLockCount = 0;
let activeModalTrigger = null;
let scrollLockListenersBound = false;

function isMobileViewport() {
  return MOBILE_MEDIA.matches;
}

function isModalScrollTarget(target) {
  return Boolean(
    target?.closest?.('.ui-modal__dialog, .ui-modal-form__upload-field'),
  );
}

function preventPageScroll(event) {
  if (!isMobileViewport() || isModalScrollTarget(event.target)) {
    return;
  }

  event.preventDefault();
}

function bindScrollLockListeners() {
  if (scrollLockListenersBound) {
    return;
  }

  scrollLockListenersBound = true;
  document.addEventListener('touchmove', preventPageScroll, { passive: false });
  document.addEventListener('wheel', preventPageScroll, { passive: false });
}

function unbindScrollLockListeners() {
  if (!scrollLockListenersBound) {
    return;
  }

  scrollLockListenersBound = false;
  document.removeEventListener('touchmove', preventPageScroll);
  document.removeEventListener('wheel', preventPageScroll);
}

function lockPageScroll() {
  if (scrollLockCount === 0) {
    scrollY = window.scrollY;
    document.documentElement.classList.add('is-modal-open');

    if (isMobileViewport()) {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      bindScrollLockListeners();
    }
  }

  scrollLockCount += 1;
}

function unlockPageScroll() {
  if (scrollLockCount === 0) {
    return;
  }

  scrollLockCount -= 1;

  if (scrollLockCount > 0) {
    return;
  }

  document.documentElement.classList.remove('is-modal-open');

  if (isMobileViewport()) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    unbindScrollLockListeners();
  }

  window.scrollTo(0, scrollY);
}

function closeModal(modal) {
  if (!modal.classList.contains('is-open')) {
    return;
  }

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  unlockPageScroll();

  const trigger = activeModalTrigger;

  window.setTimeout(() => {
    if (!modal.classList.contains('is-open')) {
      modal.hidden = true;

      if (trigger && document.contains(trigger)) {
        trigger.focus({ preventScroll: true });
      }
    }
  }, MODAL_ANIMATION_MS);
}

function openModal(modal, trigger = null) {
  activeModalTrigger = trigger;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  lockPageScroll();

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
  });

  if (document.querySelector('[data-modal-upload]')) {
    initModalUploads();
  }

  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();

      const modalId = trigger.dataset.modalOpen;
      const modal = document.getElementById(modalId);

      if (!modal) {
        return;
      }

      if (modalId === 'modal-custom-jewelry' && typeof window.kapliResetCustomJewelryModal === 'function') {
        window.kapliResetCustomJewelryModal();
      }

      openModal(modal, trigger);

      if (modalId === 'modal-custom-jewelry' && typeof window.kapliEnsureCustomJewelryPhoneMask === 'function') {
        window.setTimeout(() => {
          window.kapliEnsureCustomJewelryPhoneMask();
        }, MODAL_ANIMATION_MS);
      }
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
