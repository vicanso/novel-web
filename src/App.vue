<template lang="pug">
#app
  transition
    router-view
</template>
<style lang="sass" src="@/styles/app.sass"></style>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "app",
  data() {
    return {
      account: ""
    };
  },
  methods: {
    ...mapActions(["userGetInfo"])
  },
  computed: {
    ...mapState({
      userInfo: ({ user }) => user.info
    })
  },
  watch: {
    userInfo(cur) {
      let account = "";
      if (cur) {
        account = cur.account;
      }
      if (account != this.account) {
        this.account = account;
      }
    }
  },
  async beforeMount() {
    const close = this.xLoading();
    try {
      await this.userGetInfo();
    } catch (err) {
      this.xError(err);
    } finally {
      close();
    }
  }
};
</script>
