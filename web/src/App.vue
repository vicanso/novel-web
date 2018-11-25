<template lang="pug">
#app
  Home.mainView(
    v-if="ready"
  )
  transition(
    v-if="ready"
    @leave="leave"
  )
    router-view.childView(
      ref="childView"
    )
</template>
<style lang="sass" src="@/styles/app.sass"></style>

<script>
import Velocity from "velocity-animate";
import { MessageBox } from "mint-ui";
import { mapActions, mapState } from "vuex";

import Home from "@/views/Home";
import cordova from "@/helpers/cordova";
import { getErrorMessage } from "@/helpers/util";

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
      }
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
    leave: function(el, done) {
      let start = 0;
      const { transform } = el.style;
      if (transform) {
        const result = /translate3d\((\d+)px[\s\S]+\)/.exec(transform);
        if (result && result[1]) {
          start = Number.parseInt(result[1]);
        }
      }
      Velocity(
        el,
        {
          translateZ: 0,
          translateX: [el.clientWidth, start]
        },
        {
          duration: 200,
          complete: done
        }
      );
    },
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
        cordova.setStatusBarDefault();
        this.ready = true;
      } catch (err) {
        const msg = getErrorMessage(err);
        MessageBox.confirm(`${msg}，是否重新加载？`)
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
    }
  },
  beforeMount() {
    this.load();
  }
};
</script>
