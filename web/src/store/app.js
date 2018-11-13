import { APP_SETTING } from "@/store/types";

const state = {
  app: {
    leftSideDragBack: false
  }
};

const appSetSetting = async ({ commit }, data) => {
  commit(APP_SETTING, data);
};

const mutations = {
  [APP_SETTING](state, data) {
    Object.assign(state.app, data);
  }
};

const actions = {
  appSetSetting
};

export default {
  actions,
  state,
  mutations
};
