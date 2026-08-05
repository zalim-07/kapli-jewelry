function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function initHeaderContacts() {
  const root = document.querySelector('.site-header__contacts');
  const button = root?.querySelector('.site-header__action--contacts');
  const popup = document.querySelector('#header-contacts-popup');

  if (!root || !button || !popup) {
    return;
  }

  let closeTimer = null;

  function setOpen(isOpen) {
    root.classList.toggle('is-open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    popup.setAttribute('aria-hidden', String(!isOpen));
  }

  function open() {
    window.clearTimeout(closeTimer);
    closeTimer = null;
    setOpen(true);
  }

  function scheduleClose() {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      setOpen(false);
      closeTimer = null;
    }, 300);
  }

  button.addEventListener('mouseenter', () => {
    if (canHover()) {
      open();
    }
  });

  button.addEventListener('mouseleave', () => {
    if (canHover()) {
      scheduleClose();
    }
  });

  popup.addEventListener('mouseenter', () => {
    if (canHover()) {
      open();
    }
  });

  popup.addEventListener('mouseleave', () => {
    if (canHover()) {
      scheduleClose();
    }
  });

  button.addEventListener('click', (event) => {
    if (canHover()) {
      return;
    }

    event.stopPropagation();
    setOpen(!root.classList.contains('is-open'));
  });

  document.addEventListener('click', (event) => {
    if (!root.classList.contains('is-open')) {
      return;
    }

    if (root.contains(event.target)) {
      return;
    }

    setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) {
      setOpen(false);
      button.focus();
    }
  });
}
