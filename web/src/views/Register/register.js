import { mapActions, mapState } from "vuex";

import cordova from "@/helpers/cordova";

import { LeftSideDragMixin } from "@/mixin";

export default {
  name: "register",
  mixins: [LeftSideDragMixin],
  data() {
    return {
      account: "",
      password: "",
      email: "",
      pwd: ""
    };
  },
  computed: {
    ...mapState({
      userInfo: ({ user }) => user.info
    })
  },
  methods: {
    ...mapActions(["userRegister", "appSetSetting"]),
    async register() {
      const { account, password, email, pwd } = this;
      if (!account || !password || !email) {
        this.xError(new Error("用户名、密码与邮箱不能为空"));
        return;
      }
      if (password != pwd) {
        this.xError(new Error("两次输入的密码不一致"));
        return;
      }
      const close = this.xLoading();
      try {
        await this.userRegister({
          account,
          password,
          email
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
