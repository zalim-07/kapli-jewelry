import closeSvg from '../assets/svg/close.svg?raw';

const MAX_FILES = 5;
const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|gif|webp|heic|heif|bmp|avif)$/i;

function isImageFile(file) {
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }

  return IMAGE_EXTENSION_PATTERN.test(file.name || '');
}

function initUploadField(field) {
  if (field.dataset.modalUploadInitialized === 'true') {
    return;
  }

  const input = field.querySelector('.ui-modal-form__upload-input');
  const drop = field.querySelector('.ui-modal-form__upload-drop');
  const list = field.querySelector('.ui-modal-form__upload-list');

  if (!input || !drop || !list) {
    return;
  }

  const files = [];

  function syncInput() {
    const dataTransfer = new DataTransfer();

    files.forEach((file) => {
      dataTransfer.items.add(file);
    });

    input.files = dataTransfer.files;
  }

  function render() {
    list.replaceChildren();

    files.forEach((file, index) => {
      const item = document.createElement('li');
      item.className = 'ui-modal-form__upload-item';

      const name = document.createElement('span');
      name.className = 'ui-modal-form__upload-name';
      name.textContent = file.name;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'ui-modal-form__upload-remove';
      removeButton.setAttribute('aria-label', `Удалить ${file.name}`);
      removeButton.innerHTML = closeSvg;
      removeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        files.splice(index, 1);
        render();
      });

      item.append(name, removeButton);
      list.appendChild(item);
    });

    field.classList.toggle('has-files', files.length > 0);
    field.classList.toggle('is-max-files', files.length >= MAX_FILES);
    list.hidden = files.length === 0;
    drop.hidden = files.length >= MAX_FILES;
    syncInput();
  }

  function addFiles(fileList) {
    [...fileList].forEach((file) => {
      if (files.length >= MAX_FILES || !isImageFile(file)) {
        return;
      }

      const isDuplicate = files.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified,
      );

      if (!isDuplicate) {
        files.push(file);
      }
    });

    render();
  }

  drop.addEventListener('click', () => {
    input.click();
  });

  input.addEventListener('change', () => {
    addFiles(input.files);
    input.value = '';
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    field.addEventListener(eventName, (event) => {
      event.preventDefault();

      if (files.length < MAX_FILES) {
        field.classList.add('is-dragover');
      }
    });
  });

  field.addEventListener('dragleave', (event) => {
    if (!field.contains(event.relatedTarget)) {
      field.classList.remove('is-dragover');
    }
  });

  field.addEventListener('drop', (event) => {
    event.preventDefault();
    field.classList.remove('is-dragover');
    addFiles(event.dataTransfer?.files || []);
  });

  field.kapliUploadReset = () => {
    files.length = 0;
    input.value = '';
    render();
  };

  field.kapliUploadGetFiles = () => files.slice();

  field.dataset.modalUploadInitialized = 'true';
  render();
}

export function initModalUploads() {
  document.querySelectorAll('[data-modal-upload]').forEach((field) => {
    initUploadField(field);
  });
}

export function resetModalUpload(field) {
  if (!field) {
    return;
  }

  if (typeof field.kapliUploadReset === 'function') {
    field.kapliUploadReset();
    return;
  }

  initUploadField(field);
}

if (typeof window !== 'undefined') {
  window.kapliInitModalUploads = initModalUploads;
  window.kapliResetModalUpload = resetModalUpload;
}
