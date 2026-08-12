import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';

export function initUiSelect() {
  document.querySelectorAll('[data-ui-select] select').forEach((select) => {
    if (select.tomselect) {
      return;
    }

    const uiSelect = select.closest('[data-ui-select]');
    const field = select.closest('.ui-select__field');
    const needsPlaceholder = Boolean(select.dataset.placeholder) && select.dataset.hasValue !== 'true';

    if (needsPlaceholder) {
      select.querySelector('option[value=""]')?.remove();
      select.selectedIndex = -1;
    }

    const tomSelect = new TomSelect(select, {
      allowEmptyOption: true,
      placeholder: select.dataset.placeholder || '',
      searchField: ['text', 'meta'],
      dropdownParent: field || undefined,
      render: {
        no_results() {
          return '<div class="no-results">Ничего не найдено</div>';
        },
        option(data, escape) {
          if (!data.meta) {
            return `<div>${escape(data.text)}</div>`;
          }

          return [
            '<div class="ui-select__option-content">',
            `<span class="ui-select__option-label">${escape(data.text)}</span>`,
            `<span class="ui-select__option-meta">${escape(data.meta)}</span>`,
            '</div>',
          ].join('');
        },
      },
      onDropdownOpen() {
        uiSelect?.classList.add('ui-select--open');
      },
      onDropdownClose() {
        uiSelect?.classList.remove('ui-select--open');
      },
    });

    tomSelect.wrapper.style.width = '100%';
  });
}
