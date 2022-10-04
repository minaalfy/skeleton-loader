import "./prism.css";
import "./style.css";
import "./prism";
import Alpine from "alpinejs";
import Moveable from "moveable";
// @ts-ignore
import Clipboard from "@ryangjchandler/alpine-clipboard";
import { getBGs, getPositions, getSizes, triggerUpdate } from "./utils";
import { ResizeProps } from "./interfaces";
Alpine.plugin(Clipboard);

const canvas = document.getElementById("canvas") as HTMLElement;
const demo = document.querySelector(".skeleton-loader") as HTMLElement;

const moveable = new Moveable(canvas, {
  container: canvas,
  draggable: true,
  resizable: true,
  snappable: true,
  useResizeObserver: true,
  snapDigit: 1,
  elementSnapDirections: true,
  snapThreshold: 4,
  edge: true,
  origin: true,
});
/* draggable */
moveable.on("drag", ({ target, left, top }) => {
  if (top < 0) top = 0;
  if (left < 0) left = 0;
  if (top > canvas.clientHeight - target.clientHeight)
    top = canvas.clientHeight - target.clientHeight;
  if (left > canvas.clientWidth - target.clientWidth)
    left = canvas.clientWidth - target.clientWidth;
  triggerUpdate("left", left);
  target!.style.left = `${left}px`;
  triggerUpdate("top", top);
  target!.style.top = `${top}px`;
});

/* resizable */
moveable.on("resize", ({ target, width, height, delta }: ResizeProps) => {
  if (width + target.offsetLeft > canvas.clientWidth)
    width = canvas.clientWidth - target.offsetLeft;
  if (height + target.offsetTop > canvas.clientHeight)
    height = canvas.clientHeight - target.offsetTop;

  if (delta[0]) {
    triggerUpdate("width", width);
    target!.style.width = `${width}px`;
  }
  if (delta[1]) {
    triggerUpdate("height", height);
    target!.style.height = `${height}px`;
  }
});

Alpine.data("generator", () => ({
  theme: "light",
  tool: "select",
  gridDisplay: true,
  hasAnimation: true,
  width: undefined,
  height: undefined,
  duration: 2000,
  bg: "#ffffff",
  fg: "#aaaaaa",
  selected: undefined,
  shapes: [
    { circle: true, height: 96, width: 96, top: 16, left: 16 },
    { height: 16, width: 128, top: 40, left: 128 },
    { height: 16, width: 256, top: 72, left: 128 },
    { height: 16, width: 496, top: 128, left: 16 },
    { height: 16, width: 496, top: 160, left: 16 },
    { height: 16, width: 496, top: 192, left: 16 },
    { height: 16, width: 496, top: 224, left: 16 },
    { height: 16, width: 496, top: 256, left: 16 },
  ],
  exampleCode: `<div class="skeleton-loader"></div>`,
  tab: "CSS",
  generatedCSS: function () {
    const [r, g, b] = this.bg
      .match(/\w\w/g)
      .map((x: string) => parseInt(x, 16));
    setTimeout(() => {
      // @ts-ignore
      Prism.highlightAll();
      demo.style.setProperty(
        "--skeleton-background-image",
        `${getBGs(this.shapes, this.fg, [r, g, b])}${
          this.hasAnimation
            ? `, linear-gradient(${this.bg} 100%, transparent 0)`
            : ""
        }`
      );
      demo.style.setProperty(
        "--skeleton-background-size",
        `${getSizes(this.shapes, this.width)}, 100% 100%`
      );
      demo.style.setProperty(
        "--skeleton-background-position",
        `-150% 0${getPositions(this.shapes)}, 0 0`
      );
      demo.style.setProperty(
        "--skeleton-animation-background-position",
        `350% 0${getPositions(this.shapes)}, 0 0`
      );
      demo.style.setProperty(
        "--skeleton-animation-duration",
        this.duration + "ms"
      );
    });
    return `.skeleton-loader {
    position: relative;
    height: ${this.height}px;
  }
  .skeleton-loader:after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-repeat: no-repeat;
    background-image: ${getBGs(this.shapes, this.fg, [r, g, b])}${
      this.hasAnimation
        ? `, 
      linear-gradient(${this.bg} 100%, transparent 0)`
        : ""
    };
    background-size: ${getSizes(this.shapes, this.width)}${
      this.hasAnimation ? ", 100% 100%" : ""
    };
    background-position: 0 0 ${getPositions(this.shapes)}${
      this.hasAnimation ? ", 0 0" : ""
    };
    ${
      this.hasAnimation
        ? `animation: skeleton-animation ${this.duration}ms infinite;`
        : ""
    }
  }
  ${
    this.hasAnimation
      ? `
  @keyframes skeleton-animation {
    to {
      background-position: 100% 0${getPositions(this.shapes)}, 0 0;
    }
  }
  `
      : ""
  }`;
  },
  init() {
    this.width = this.$refs.canvas.clientWidth;
    this.height = this.$refs.canvas.clientHeight;
  },

  toggleTheme: function () {
    if (localStorage.getItem("color-theme")) {
      if (localStorage.getItem("color-theme") === "light") {
        this.theme = "dark";
        document.documentElement.dataset.theme = "dark";
        localStorage.setItem("color-theme", "dark");
      } else {
        this.theme = "light";
        document.documentElement.dataset.theme = "light";
        localStorage.setItem("color-theme", "light");
      }
    } else {
      if (document.documentElement.classList.contains("dark")) {
        this.theme = "light";
        document.documentElement.dataset.theme = "light";
        localStorage.setItem("color-theme", "light");
      } else {
        this.theme = "dark";
        document.documentElement.dataset.theme = "dark";
        localStorage.setItem("color-theme", "dark");
      }
    }
  },

  select: function (el: HTMLDivElement, index: number) {
    this.selected = index;
    moveable.target = el;
    moveable.keepRatio = el.classList.contains("rounded-full");
    moveable.elementGuidelines = [].slice.call(
      document.querySelectorAll(".skeleton-shape")
    );
  },

  unSelect: function () {
    this.selected = undefined;
    if (moveable) moveable.target = null;
  },

  deleteShape: async function (index: number) {
    this.unSelect();
    await this.$nextTick();
    this.shapes.splice(index, 1);
  },

  toolSelect: function () {
    this.tool = "select";
  },

  toolCircle: async function () {
    this.tool = "circle";
    this.unSelect();
    this.shapes.push({
      circle: true,
      height: 64,
      width: 64,
      top: this.height / 2 - 32,
      left: this.width / 2 - 32,
    });
    await this.$nextTick();
    const index = this.shapes.length - 1;
    this.select(document.getElementById("shape-" + index), index + 1);
    this.toolSelect();
  },

  toolSquare: async function () {
    this.tool = "square";
    this.unSelect();
    this.shapes.push({
      height: 32,
      width: 128,
      top: this.height / 2 - 16,
      left: this.width / 2 - 64,
    });
    await this.$nextTick();
    const index = this.shapes.length - 1;
    this.select(document.getElementById("shape-" + index), index + 1);
    this.toolSelect();
  },

  updateShape: function ({ detail }: any) {
    if (this.selected && this.shapes[this.selected - 1]) {
      this.shapes[this.selected - 1][Object.keys(detail)[0]] =
        detail[Object.keys(detail)[0]];
    }
  },

  updateRect: function () {
    this.shapes[this.selected - 1].height =
      this.shapes[this.selected - 1].width;
  },
}));
Alpine.start();
