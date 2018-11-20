<template lang="pug">
.banner.clearfix(
  ref="banner"
  :style="style"
)
  .pullLeft.bannerView(
    v-for="item, index in images"
    :key="item"
    @click="show(index)"
  )
    ImageView(
      :src="item"
    )
  .dots
    span(
      v-for="item, index in images"
      :class="active == index ? 'active' : ''"
    )
</template>

<style lang="sass" scoped>
@import '@/styles/const.sass'
.banner
  height: 100%
  position: relative
  overflow: hidden
.bannerView
  height: 100%
.dots
  position: absolute
  left: 10px
  bottom: 5px
  span
    display: inline-block
    background-color: $COLOR_GRAY
    width: 5px
    height: 5px
    border-radius: 10px
    margin-right: 3px
    &.active
      background-color: $COLOR_WHITE
</style>

<script>
import Velocity from "velocity-animate";
import ImageView from "@/components/ImageView";
import { tinyUrlPrefix } from "@/config";
export default {
  components: {
    ImageView
  },
  name: "banner",
  props: {
    ids: Array
  },
  data() {
    return {
      images: [],
      style: {},
      active: 0
    };
  },
  mounted() {
    const baseUrl = `${tinyUrlPrefix}/center/:id-90-:w-:h.jpeg`;
    const dom = this.$refs.banner;
    const w = dom.clientWidth;
    const h = dom.clientHeight;
    this.ids.forEach(id => {
      const url = baseUrl
        .replace(":id", id)
        .replace(":w", w)
        .replace(":h", h);
      this.images.push(url);
    });
    this.style.width = `${this.images.length}00%`;
    let index = 0;
    let prevTranslateX = 0;
    const max = this.images.length;
    this.timer = setInterval(() => {
      const { banner } = this.$refs;
      if (!banner) {
        return;
      }
      index = (index + 1) % max;
      const end = `${-index * (100 / max)}%`;

      Velocity(
        banner,
        {
          translateZ: 0,
          translateX: [end, prevTranslateX]
        },
        {
          duration: 300,
          complete: () => {
            prevTranslateX = end;
          }
        }
      );
    }, 5000);
  },
  methods: {
    show(index) {
      this.$emit("view", index);
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
};
</script>
