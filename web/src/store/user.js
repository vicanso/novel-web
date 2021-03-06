import request from "axios";
import { USERS_ME, USERS_LOGIN, USERS_LOGOUT } from "@/urls";
import { USER_INFO, USER_SETTING } from "@/store/types";
import { sha256 } from "@/helpers/crypto";
import { getUserSetting, saveUserSetting } from "@/helpers/storage";

function genPassword(password) {
  // 是否需要添加特定串，如加APP的名字，避免与密码表的一致
  // 或者将账号与密码一起生成，这样每个客户都唯一（不过登录时就必须使用账号登录）
  return sha256(password);
}

const state = {
  user: {
    info: null,
    setting: null
  }
};

const userGetInfo = async ({ commit }) => {
  const res = await request.get(USERS_ME);
  commit(USER_INFO, res.data);
  return res;
};

// 用户登录
const userLogin = async ({ commit }, { account, password }) => {
  let res = await request.get(USERS_LOGIN);
  const token = res.data.token;
  const code = sha256(token + genPassword(password));
  res = await request.post(USERS_LOGIN, {
    account,
    password: code
  });
  commit(USER_INFO, res.data);
};

// 用户注册
const userRegister = async (tmp, { account, password, email }) => {
  await request.post(USERS_ME, {
    account,
    email,
    password: genPassword(password)
  });
};

const userLogout = async ({ commit }) => {
  await request.delete(USERS_LOGOUT);
  commit(USER_INFO, {
    account: ""
  });
};

const userGetSetting = async ({ commit }) => {
  const setting = await getUserSetting();
  commit(USER_SETTING, setting);
};

const userSaveSetting = async ({ commit }, data) => {
  await saveUserSetting(data);
  const setting = await getUserSetting();
  commit(USER_SETTING, setting);
};

const userRefresh = async () => {
  await request.patch(USERS_ME);
};

const mutations = {
  // 用户信息
  [USER_INFO](state, data) {
    state.user.info = data;
  },
  [USER_SETTING](state, data) {
    state.user.setting = data;
  }
};

const actions = {
  userGetInfo,
  userRegister,
  userLogin,
  userLogout,
  userGetSetting,
  userRefresh,
  userSaveSetting
};

export default {
  actions,
  state,
  mutations
};
