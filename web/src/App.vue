<template lang="pug">
#app
  Home.mainView
  transition
    router-view.childView
</template>
<style lang="sass" src="@/styles/app.sass"></style>

<script>
import Home from "@/views/Home";
import { mapActions, mapState } from "vuex";

export default {
  name: "app",
  components: {
    Home
  },
  data() {
    return {};
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
    }
  },
  async beforeMount() {
    const close = this.xLoading();
    try {
      await this.userGetInfo();
      await this.userGetSetting();
    } catch (err) {
      this.xError(err);
    } finally {
      close();
    }
  }
};
</script>
