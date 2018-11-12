<template lang="pug">
#app
  Home.mainView(
    v-if="ready"
  )
  transition(
    v-if="ready"
  )
    router-view.childView
</template>
<style lang="sass" src="@/styles/app.sass"></style>

<script>
import Home from "@/views/Home";
import { MessageBox } from "mint-ui";
import { mapActions, mapState } from "vuex";
import cordova from "@/helpers/cordova";

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
    }
  },
  beforeMount() {
    this.load();
  }
};
</script>
