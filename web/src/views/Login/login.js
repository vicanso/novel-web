import { mapActions, mapState } from "vuex";

import cordova from "@/helpers/cordova";

import { LeftSideDragMixin } from "@/mixin";

export default {
  name: "login",
  mixins: [LeftSideDragMixin],
  data() {
    return {
      account: "",
      password: ""
    };
  },
  computed: {
    ...mapState({
      userInfo: ({ user }) => user.info
    })
  },
  methods: {
    ...mapActions(["userLogin", "appSetSetting"]),
    async login() {
      const { account, password } = this;
      if (!account || !password) {
        this.xError(new Error("用户名或账号不能为空"));
        return;
      }
      const close = this.xLoading();
      try {
        await this.userLogin({
          account,
          password
        });
        this.$router.back();
      } catch (err) {
        this.xError(err);
      } finally {
        close();
      }
    },
    back() {
      this.$router.back();
    },
    leftSideDragEnd() {
      this.back();
    }
  },
  beforeDestroy() {
    this.offBackButtonEvent();
  },
  mounted() {
    const fn = () => {
      this.back();
    };
    this.offBackButtonEvent = cordova.onBackButton(fn);
  }
};
