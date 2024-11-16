class Component {
  constructor(id, opts = { name, data: [] }) {
    // 获取组件的容器元素
    this.container = document.getElementById(id);
    // 保存组件的选项，包括名称和数据
    this.options = opts;
    // 调用渲染方法，将生成的 HTML 插入容器中
    this.container.innerHTML = this.render(opts.data);
  }

  /**
   * 注册插件并将其渲染到组件中
   * @param  {...any} plugins - 要注册的插件列表
   */
  registerPlugins(...plugins) {
    plugins.forEach((plugin) => {
      // 创建插件的容器
      const pluginContainer = document.createElement("div");
      pluginContainer.className = `${this.options.name}__plugin`;
      // 插入插件的渲染内容
      pluginContainer.innerHTML = plugin.render(this.options.data);
      this.container.appendChild(pluginContainer);

      // 调用插件的行为方法，并传递当前组件实例
      plugin.action(this);
    });
  }

  /**
   * 渲染组件的内容
   * 子类需重写此方法以实现具体渲染逻辑
   * @param {Array} data - 渲染所需的数据
   * @returns {string} - HTML 字符串
   */
  render(data) {
    return "";
  }
}

class Slider extends Component {
  constructor(id, opts = { name: "slider-list", data: [], cycle: 3000 }) {
    super(id, opts);
    // 获取所有滑动项，包括已选中的项
    this.items = this.container.querySelectorAll(
      ".slider-list__item, .slider-list__item--selected"
    );
    // 设置轮播周期
    this.cycle = opts.cycle || 3000;
    // 初始化，将默认选中第一个滑动项
    this.slideTo(0);
  }

  /**
   * 渲染滑动组件的内容
   * 根据传入的数据生成 HTML 列表
   * @param {Array} data - 图片数据数组
   * @returns {string} - 渲染的 HTML 字符串
   */
  render(data) {
    const content = data
      .map((image) =>
        `
            <li class="slider-list__item">
              <img src="${image}" alt="slider image"/>
            </li>    
          `.trim()
      )
      .join("");

    return `<ul>${content}</ul>`;
  }

  /**
   * 获取当前选中的滑动项
   * @returns {Element|null} - 当前选中项的 DOM 节点
   */
  getSelectedItem() {
    return this.container.querySelector(".slider-list__item--selected");
  }

  /**
   * 获取当前选中项的索引
   * @returns {number} - 当前选中项在列表中的索引
   */
  getSelectedItemIndex() {
    return Array.from(this.items).indexOf(this.getSelectedItem());
  }

  /**
   * 滑动到指定的索引
   * @param {number} idx - 要滑动到的索引
   */
  slideTo(idx) {
    // 移除当前选中项的样式
    const selected = this.getSelectedItem();
    if (selected) {
      selected.className = "slider-list__item";
    }
    // 为指定索引的项添加选中样式
    const item = this.items[idx];
    if (item) {
      item.className = "slider-list__item--selected";
    }

    // 触发自定义事件，传递滑动索引信息
    const detail = { index: idx };
    const event = new CustomEvent("slide", { bubbles: true, detail });
    this.container.dispatchEvent(event);
  }

  /**
   * 滑动到下一项
   */
  slideNext() {
    const currentIdx = this.getSelectedItemIndex();
    const nextIdx = (currentIdx + 1) % this.items.length;
    this.slideTo(nextIdx);
  }

  /**
   * 滑动到上一项
   */
  slidePrevious() {
    const currentIdx = this.getSelectedItemIndex();
    const previousIdx =
      (this.items.length + currentIdx - 1) % this.items.length;
    this.slideTo(previousIdx);
  }

  /**
   * 为组件容器添加事件监听器
   * @param {string} type - 事件类型
   * @param {Function} handler - 事件处理函数
   */
  addEventListener(type, handler) {
    this.container.addEventListener(type, handler);
  }

  /**
   * 启动自动轮播
   */
  start() {
    // 确保不会有多个定时器运行
    this.stop();
    // 每隔周期时间调用 slideNext
    this._timer = setInterval(() => this.slideNext(), this.cycle);
  }

  /**
   * 停止自动轮播
   */
  stop() {
    clearInterval(this._timer);
  }
}

const pluginController = {
  /**
   * 渲染插件的 HTML 内容
   * 用于生成控制按钮
   * @param {Array} images - 滑动组件的图片数据
   * @returns {string} - 渲染的 HTML 字符串
   */
  render(images) {
    return `
          <div class="slide-list__control">
            ${images
              .map(
                (_, i) =>
                  `<span class="slide-list__control-buttons${
                    i === 0 ? "--selected" : ""
                  }"></span>`
              )
              .join("")}
          </div>
        `.trim();
  },

  /**
   * 定义插件的行为
   * @param {Slider} slider - 目标滑动组件实例
   */
  action(slider) {
    const controller = slider.container.querySelector(".slide-list__control");
    if (controller) {
      const buttons = controller.querySelectorAll(
        ".slide-list__control-buttons, .slide-list__control-buttons--selected"
      );

      // 鼠标悬停时，滑动到对应索引并暂停轮播
      controller.addEventListener("mouseover", (evt) => {
        const idx = Array.from(buttons).indexOf(evt.target);
        if (idx >= 0) {
          slider.slideTo(idx);
          slider.stop();
        }
      });

      // 鼠标移出时，重新启动轮播
      controller.addEventListener("mouseout", () => {
        slider.start();
      });

      // 当滑动事件触发时，更新按钮的选中状态
      slider.addEventListener("slide", (evt) => {
        const idx = evt.detail.index;
        const selected = controller.querySelector(
          ".slide-list__control-buttons--selected"
        );
        if (selected) selected.className = "slide-list__control-buttons";
        buttons[idx].className = "slide-list__control-buttons--selected";
      });
    }
  },
};

// 上一页插件
const pluginPrevious = {
  render() {
    return `<a class="slide-list__previous"></a>`;
  },

  action(slider) {
    const previous = slider.container.querySelector(".slide-list__previous");
    if (previous) {
      previous.addEventListener("click", (evt) => {
        slider.stop();
        slider.slidePrevious();
        slider.start();
        evt.preventDefault();
      });
    }
  },
};

// 下一页插件
const pluginNext = {
  render() {
    return `<a class="slide-list__next"></a>`;
  },

  action(slider) {
    const next = slider.container.querySelector(".slide-list__next");
    if (next) {
      next.addEventListener("click", (evt) => {
        slider.stop();
        slider.slideNext();
        slider.start();
        evt.preventDefault();
      });
    }
  },
};

// 创建滑动组件实例
const slider = new Slider("my-slider", {
  name: "slider-list",
  data: [
    "https://p5.ssl.qhimg.com/t0119c74624763dd070.png",
    "https://p4.ssl.qhimg.com/t01adbe3351db853eb3.jpg",
    "https://p2.ssl.qhimg.com/t01645cd5ba0c3b60cb.jpg",
    "https://p4.ssl.qhimg.com/t01331ac159b58f5478.jpg",
  ],
  cycle: 3000,
});
// 注册插件
slider.registerPlugins(pluginController, pluginPrevious, pluginNext);
slider.start();
