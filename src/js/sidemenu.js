export function initSidemenu() {
    const menuButton = document.querySelector('.site-header__menu');
    const sidemenu = document.querySelector('#site-sidemenu');

    if (!menuButton || !sidemenu) {
        return;
    }

    const backdrop = sidemenu.querySelector('.site-sidemenu__backdrop');
    const closeButton = sidemenu.querySelector('.site-sidemenu__close');
    const links = sidemenu.querySelectorAll('.site-sidemenu__nav a');

    function open() {
        sidemenu.classList.add('is-open');
        sidemenu.setAttribute('aria-hidden', 'false');
        menuButton.setAttribute('aria-expanded', 'true');
        document.body.classList.add('is-sidemenu-open');
    }

    function close() {
        sidemenu.classList.remove('is-open');
        sidemenu.setAttribute('aria-hidden', 'true');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('is-sidemenu-open');
        menuButton.focus();
    }

    menuButton.addEventListener('click', () => {
        if (sidemenu.classList.contains('is-open')) {
            close();
            return;
        }

        open();
    });

    backdrop?.addEventListener('click', close);
    closeButton?.addEventListener('click', close);

    links.forEach((link) => {
        link.addEventListener('click', close);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidemenu.classList.contains('is-open')) {
            close();
        }
    });
}
