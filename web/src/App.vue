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
    account(newValue, originalValue) {
      if (newValue) {
        this.bookGetUserFavs();
      }
    }
  },
  methods: {
    ...mapActions(["userGetInfo", "userGetSetting", "bookGetUserFavs"])
  },
  async beforeMount() {
    const close = this.xLoading();
    try {
      await this.userGetInfo();
      await this.userGetSetting();
      // if (!data.anonymous) {
      //   await this.bookGetUserFavs();
      // }
    } catch (err) {
      this.xError(err);
    } finally {
      close();
    }
  }
};
</script>
