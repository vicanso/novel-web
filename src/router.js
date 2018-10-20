import Vue from "vue";
import Router from "vue-router";

import { routeDetail } from "@/routes";
import Detail from "@/views/Detail";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/detail/:id",
      name: routeDetail,
      component: Detail
    }
  ]
});
