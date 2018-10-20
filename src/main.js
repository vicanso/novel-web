import "intersection-observer";
import Vue from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";
import Mint from "mint-ui";
import "@/styles/index.scss";
import "@/request-interceptors";
import { getErrorMessage, isDevelopment } from "@/helpers/util";
import { timeout } from "@/config";

import "@/assets/iconfont/iconfont.css";
import "@/directive";

Vue.use(Mint);

// 注入 router 和 store
Vue.$router = router;
Vue.$store = store;

Vue.prototype.xLoading = (options = {}) => {
  const Indicator = Mint.Indicator;
  // 延迟显示loading（有些处理很快就响应，不展示loading）
  const delayTimer = setTimeout(() => {
    Indicator.open({
      text: "加载中...",
      spinnerType: "fading-circle"
    });
  }, 50);
  let resolved = false;
  const resolve = () => {
    if (resolved) {
      return;
    }
    clearTimeout(delayTimer);
    resolved = true;
    Indicator.close();
  };
  setTimeout(resolve, options.timeout || timeout);
  return resolve;
};

Vue.prototype.xError = function xError(err) {
  const message = getErrorMessage(err);
  Mint.Toast({
    message: message,
    duration: 5000
  });
  if (isDevelopment()) {
    throw err;
  }
};

Vue.prototype.$next = function nextTickPromise() {
  return new Promise(resolve => this.$nextTick(resolve));
};

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
