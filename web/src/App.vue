<template lang="pug">
#app
  Home.mainView(
    v-if="ready"
  )
  transition(
    v-if="ready"
  )
    router-view.childView(
      ref="childView"
    )
</template>
<style lang="sass" src="@/styles/app.sass"></style>

<script>
import Home from "@/views/Home";
import Hammer from "hammerjs";
import { MessageBox } from "mint-ui";
import { mapActions, mapState } from "vuex";
import cordova from "@/helpers/cordova";
import router from "@/router";

export default {
  name: "app",
  components: {
    Home
  },
  data() {
    return {
      ready: false
    };
  },
  computed: {
    ...mapState({
      account: ({ user }) => {
        const info = user.info;
        if (!info || info.anonymous) {
          return "";
        }
        return info.account;
      },
      leftSideDragBack: ({ app }) => app.leftSideDragBack
    })
  },
  watch: {
    account(newValue) {
      if (newValue) {
        this.bookGetUserFavs();
        this.refreshUserSession();
      }
    }
  },
  methods: {
    ...mapActions([
      "userGetInfo",
      "userGetSetting",
      "bookGetUserFavs",
      "appSetSetting",
      "userRefresh"
    ]),
    refreshUserSession() {
      // 每5分钟刷新一次session ttl
      setInterval(() => {
        this.userRefresh();
      }, 5 * 60 * 1000);
    },
    async load() {
      const close = this.xLoading();
      try {
        await this.userGetInfo();
        await this.userGetSetting();
        await cordova.waitForReady();
        this.ready = true;
      } catch (err) {
        // this.xError(err);
        MessageBox.confirm("加载失败，是否重新加载？")
          .then(() => {
            this.load();
          })
          .catch(err => {
            if (err != "cancel") {
              throw err;
            }
          });
      } finally {
        close();
      }
    },
    initLeftSideDragEvent() {
      const { $el, $refs } = this;
      const appHammer = new Hammer($el, {
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 5
      });
      let draggingBack = false;
      const offsetMove = 50;
      appHammer.on("panstart pan panend", e => {
        const { type, deltaX } = e;
        if (type === "panstart") {
          if (e.center.x < offsetMove) {
            draggingBack = true;
          }
          return;
        }
        if (!draggingBack) {
          return;
        }
        const { childView } = $refs;
        if (!childView) {
          return;
        }
        const el = childView.$el;
        if (type === "panend") {
          draggingBack = false;
          // 如果拖动距离较短，则认为非返回操作
          if (deltaX < offsetMove) {
            el.style.transform = "";
            el.style.opacity = 1;
            return;
          }
          this.$router.push({
            path: "/"
          });
          return;
        }
        // 透明度
        const opacity = Math.max(1 - deltaX / 150, 0.95);
        el.style.transform = `translate3d(${deltaX}px, 0px, 0px)`;
        el.style.opacity = opacity;
      });
    }
  },
  beforeMount() {
    this.load();
  },
  mounted() {
    this.initLeftSideDragEvent();
    router.afterEach(to => {
      if (!to.name) {
        // 设置左侧不可拖动返回
        this.appSetSetting({
          leftSideDragBack: false
        });
      }
    });
  }
};
</script>
