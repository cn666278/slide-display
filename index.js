// JS File
class Slider {
  constructor(id) {
    this.container = document.getElementById(id);
    this.items = this.container.querySelectorAll(
      ".slider-list__item, .slider-list__item--selected"
    );
  }
  getSelectedItem() {
    const selected = this.container.querySelector(
      ".slider-list__item--selected"
    );
    return selected;
  }
  getSelectedItemIndex() {
    return Array.from(this.items).indexOf(this.getSelectedItem());
  }
  slideTo(idx) {
    const selected = this.getSelectedItem();
    if (selected) {
      selected.className = "slider-list__item";
    }
    const item = this.items[idx];
    if (item) {
      item.className = "slider-list__item--selected";
    }
  }
  slideNext() {
    const currentIdx = this.getSelectedItemIndex();
    const nextIdx = (currentIdx + 1) % this.items.length;
    this.slideTo(nextIdx);
  }
  slidePrevious() {
    const currentIdx = this.getSelectedItemIndex();
    const previousIdx =
      (this.items.length + currentIdx - 1) % this.items.length;
    this.slideTo(previousIdx);
  }
}

const slider = new Slider("my-slider");
slider.slideTo(3);
