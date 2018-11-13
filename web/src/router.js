import Vue from "vue";
import Router from "vue-router";

import { routeDetail, routeLogin, routeRegister } from "@/routes";
import Detail from "@/views/Detail";
import Login from "@/views/Login";
import Register from "@/views/Register";
import logger from "@/helpers/logger";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/detail/:id",
      name: routeDetail,
      component: Detail
    },
    {
      path: "/login",
      name: routeLogin,
      component: Login
    },
    {
      path: "/register",
      name: routeRegister,
      component: Register
    }
  ]
});

let pageLoadStats = null;
router.beforeEach((to, from, next) => {
  pageLoadStats = {
    name: to.name,
    to: to.path,
    from: from.path,
    startedAt: Date.now()
  };
  next();
});

router.afterEach(to => {
  if (!pageLoadStats || pageLoadStats.name !== to.name) {
    return;
  }
  const use = Date.now() - pageLoadStats.startedAt;
  pageLoadStats.use = use;
  logger.info(pageLoadStats);
  pageLoadStats = null;
});

export default router;
