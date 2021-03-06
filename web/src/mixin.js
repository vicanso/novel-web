import Hammer from "hammerjs";
import { isAPP } from "@/helpers/util";

export const LeftSideDragMixin = {
  mounted() {
    if (!isAPP()) {
      return;
    }
    const { $el } = this;
    const hammer = new Hammer($el, {
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 5
    });
    let draggingBack = false;
    const offsetMove = 50;
    hammer.on("panstart pan panend", e => {
      if (this.leftSideDragDisabled) {
        return;
      }
      const { type, deltaX } = e;
      if (type === "panstart") {
        if (e.center.x < offsetMove) {
          draggingBack = true;
        }
        return;
      }
      const x = Math.max(deltaX, 0);
      if (!draggingBack) {
        return;
      }
      let dom = $el;
      if (this.getDragDom) {
        dom = this.getDragDom();
      }
      if (type === "panend") {
        draggingBack = false;
        // 如果拖动距离较短，则认为非返回操作
        if (deltaX < offsetMove) {
          dom.style.transform = "";
          dom.style.opacity = 1;
          return;
        }
        // 如果有自定义的结束处理
        if (this.leftSideDragEnd) {
          this.leftSideDragEnd();
          return;
        }
      }
      // 透明度
      const opacity = Math.max(1 - x / 150, 0.95);
      dom.style.transform = `translate3d(${x}px, 0px, 0px)`;
      dom.style.opacity = opacity;
    });
    this.hammer = hammer;
  },
  beforeDestroy() {
    if (!this.hammer) {
      return;
    }
    this.hammer.destroy();
  }
};
