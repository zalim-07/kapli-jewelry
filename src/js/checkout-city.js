import TomSelect from 'tom-select';

function getCheckoutConfig(select) {
  return {
    citiesUrl: select.dataset.citiesUrl || window.kapliCheckout?.cdek?.citiesUrl || '',
    postcodeUrl: select.dataset.postcodeUrl || window.kapliCheckout?.cdek?.postcodeUrl || '',
    placeholder: select.dataset.placeholder || window.kapliCheckout?.cdek?.placeholder || 'Начните вводить город',
  };
}

function getField(id) {
  return document.getElementById(id);
}

function triggerCheckoutUpdate() {
  if (window.jQuery) {
    window.jQuery(document.body).trigger('update_checkout');
    return;
  }

  document.body.dispatchEvent(new Event('update_checkout', { bubbles: true }));
}

function syncShippingCity(city) {
  const shippingCity = getField('shipping_city');

  if (shippingCity) {
    shippingCity.value = city;
  }
}

function setHiddenValue(id, value) {
  const field = getField(id);

  if (field) {
    field.value = value;
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

async function fetchPostcode(cityCode, config) {
  if (!cityCode || !config.postcodeUrl) {
    return '';
  }

  const url = new URL(config.postcodeUrl, window.location.origin);
  url.searchParams.set('city_code', String(cityCode));

  const response = await fetch(url.toString(), {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return '';
  }

  const payload = await response.json();

  return payload?.data?.postcode || '';
}

async function applyCitySelection(option, config) {
  if (!option) {
    return;
  }

  const city = option.city || option.text || '';
  const region = option.region || option.meta || '';
  const cityCode = option.code ? String(option.code) : '';
  let postcode = option.postcode || '';

  setHiddenValue('billing_city', city);
  setHiddenValue('billing_cdek_city_code', cityCode);
  setHiddenValue('billing_state', region);
  syncShippingCity(city);

  if (!postcode && cityCode) {
    postcode = await fetchPostcode(cityCode, config);
  }

  if (postcode) {
    setHiddenValue('billing_postcode', postcode);
  }

  triggerCheckoutUpdate();
}

function initCdekCitySelect() {
  const select = document.querySelector('#billing_city_picker[data-cdek-city]');

  if (!select || select.tomselect) {
    return;
  }

  const config = getCheckoutConfig(select);
  const uiSelect = select.closest('[data-ui-select]');
  const field = select.closest('.ui-select__field');
  const initialOption = {
    value: select.value,
    text: select.options[select.selectedIndex]?.text || select.value,
    meta: select.options[select.selectedIndex]?.dataset.meta || '',
    code: select.value,
    region: select.options[select.selectedIndex]?.dataset.meta || '',
    city: select.options[select.selectedIndex]?.text || select.value,
  };

  const tomSelect = new TomSelect(select, {
    valueField: 'value',
    labelField: 'text',
    searchField: ['text', 'meta'],
    maxOptions: 50,
    openOnFocus: true,
    preload: 'focus',
    placeholder: config.placeholder || 'Начните вводить город',
    loadThrottle: 300,
    dropdownParent: field || undefined,
    options: initialOption.value ? [initialOption] : [],
    items: initialOption.value ? [initialOption.value] : [],
    shouldLoad(query) {
      return query.length >= 2;
    },
    load(query, callback) {
      if (!config.citiesUrl) {
        callback();
        return;
      }

      const url = new URL(config.citiesUrl, window.location.origin);
      url.searchParams.set('search', query);

      fetch(url.toString(), {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => response.json())
        .then((payload) => {
          if (!payload?.success || !Array.isArray(payload.data)) {
            callback();
            return;
          }

          callback(payload.data);
        })
        .catch(() => callback());
    },
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
    onChange(value) {
      const option = value ? this.options[value] : null;

      select.dispatchEvent(new Event('change', { bubbles: true }));
      applyCitySelection(option, config);
    },
    onDropdownOpen() {
      uiSelect?.classList.add('ui-select--open');
    },
    onDropdownClose() {
      uiSelect?.classList.remove('ui-select--open');
    },
  });

  tomSelect.wrapper.style.width = '100%';

  if (initialOption.value) {
    applyCitySelection(initialOption, config);
  }
}

if (document.querySelector('#billing_city_picker[data-cdek-city]')) {
  initCdekCitySelect();
}
