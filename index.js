class Slider {
  constructor(id, cycle = 3000) {
    this.container = document.getElementById(id);
    this.items = this.container.querySelectorAll(
      ".slider-list__item, .slider-list__item--selected"
    );
    this.cycle = cycle;

    const controller = this.container.querySelector(".slide-list__control");
    if (controller) {
      const buttons = controller.querySelectorAll(
        ".slide-list__control-buttons, .slide-list__control-buttons--selected"
      );
      controller.addEventListener("mouseover", (evt) => {
        const idx = Array.from(buttons).indexOf(evt.target);
        if (idx >= 0) {
          this.slideTo(idx);
          this.stop();
        }
      });

      controller.addEventListener("mouseout", (evt) => {
        this.start();
      });

      this.container.addEventListener("slide", (evt) => {
        const idx = evt.detail.index;
        const selected = controller.querySelector(
          ".slide-list__control-buttons--selected"
        );
        if (selected) selected.className = "slide-list__control-buttons";
        buttons[idx].className = "slide-list__control-buttons--selected";
      });
    }

    const previous = this.container.querySelector(".slide-list__previous");
    if (previous) {
      previous.addEventListener("click", (evt) => {
        this.stop();
        this.slidePrevious();
        this.start();
        evt.preventDefault();
      });
    }

    const next = this.container.querySelector(".slide-list__next");
    if (next) {
      next.addEventListener("click", (evt) => {
        this.stop();
        this.slideNext();
        this.start();
        evt.preventDefault();
      });
    }
  }
  getSelectedItem() {
    let selected = this.container.querySelector(".slider-list__item--selected");
    return selected;
  }
  getSelectedItemIndex() {
    return Array.from(this.items).indexOf(this.getSelectedItem());
  }
  slideTo(idx) {
    let selected = this.getSelectedItem();
    if (selected) {
      selected.className = "slider-list__item";
    }
    let item = this.items[idx];
    if (item) {
      item.className = "slider-list__item--selected";
    }

    const detail = { index: idx };
    const event = new CustomEvent("slide", { bubbles: true, detail });
    this.container.dispatchEvent(event);
  }
  slideNext() {
    let currentIdx = this.getSelectedItemIndex();
    let nextIdx = (currentIdx + 1) % this.items.length;
    this.slideTo(nextIdx);
  }
  slidePrevious() {
    let currentIdx = this.getSelectedItemIndex();
    let previousIdx = (this.items.length + currentIdx - 1) % this.items.length;
    this.slideTo(previousIdx);
  }
  start() {
    this.stop();
    this._timer = setInterval(() => this.slideNext(), this.cycle);
  }
  stop() {
    clearInterval(this._timer);
  }
}

const slider = new Slider("my-slider");
slider.start();
