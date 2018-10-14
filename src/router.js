import Vue from "vue";
import Router from "vue-router";
import Home from "@/views/Home";
import { routeHome } from "@/routes";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: routeHome,
      component: Home
    }
  ]
});
