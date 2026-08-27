import { initModalUploads } from './modal-upload.js';

const MODAL_ANIMATION_MS = 280;
const MOBILE_MEDIA = window.matchMedia('(max-width: 767px)');
const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
  'Spacebar',
]);

let scrollY = 0;
let scrollLockCount = 0;
let activeModalTrigger = null;

function isMobileViewport() {
  return MOBILE_MEDIA.matches;
}

function isModalScrollTarget(target) {
  return Boolean(
    target?.closest?.('.ui-modal__main, .ui-modal-form__upload-field'),
  );
}

function preventPageScroll(event) {
  if (isModalScrollTarget(event.target)) {
    return;
  }

  event.preventDefault();
}

function preventScrollKeys(event) {
  if (!SCROLL_KEYS.has(event.key)) {
    return;
  }

  if (isModalScrollTarget(event.target)) {
    return;
  }

  event.preventDefault();
}

function lockScrollPosition() {
  if (window.scrollY !== scrollY) {
    window.scrollTo(0, scrollY);
  }
}

function lockPageScroll() {
  if (!isMobileViewport()) {
    return;
  }

  if (scrollLockCount === 0) {
    scrollY = window.scrollY;
    document.documentElement.classList.add('is-modal-open');
    document.addEventListener('wheel', preventPageScroll, { passive: false });
    document.addEventListener('touchmove', preventPageScroll, {
      passive: false,
    });
    document.addEventListener('keydown', preventScrollKeys);
    window.addEventListener('scroll', lockScrollPosition, { passive: true });
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
  document.removeEventListener('wheel', preventPageScroll);
  document.removeEventListener('touchmove', preventPageScroll);
  document.removeEventListener('keydown', preventScrollKeys);
  window.removeEventListener('scroll', lockScrollPosition);
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

      openModal(modal, trigger);
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
