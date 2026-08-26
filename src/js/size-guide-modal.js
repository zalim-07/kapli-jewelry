export function initSizeGuideModal() {
  document.querySelectorAll('[data-size-guide-tabs]').forEach((container) => {
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    const panels = [...container.querySelectorAll('[role="tabpanel"]')];

    if (!tabs.length || !panels.length) {
      return;
    }

    function activateTab(nextTab, moveFocus = false) {
      const panelId = nextTab.getAttribute('aria-controls');

      tabs.forEach((tab) => {
        const isActive = tab === nextTab;

        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== panelId;
      });

      if (moveFocus) {
        nextTab.focus();
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        activateTab(tab);
      });

      tab.addEventListener('keydown', (event) => {
        let nextIndex = index;

        if (event.key === 'ArrowRight') {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      });
    });
  });
}
