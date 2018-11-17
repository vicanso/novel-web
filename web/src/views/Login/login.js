import { mapActions, mapState } from "vuex";

import cordova from "@/helpers/cordova";

export default {
  name: "login",
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
    }
  },
  beforeDestroy() {
    this.offBackButtonEvent();
  },
  mounted() {
    // 设置左侧可返回
    this.appSetSetting({
      leftSideDragBack: true
    });
    const fn = () => {
      this.back();
    };
    this.offBackButtonEvent = cordova.onBackButton(fn);
  }
};
