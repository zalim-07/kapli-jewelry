import { initProductGallery } from './init-product-gallery.js';
import { initContentImageSlider } from './init-content-image-slider.js';

if (document.querySelector('[data-product-gallery]')) {
  initProductGallery();
}

if (document.querySelector('[data-content-image-slider]')) {
  initContentImageSlider();
}
