import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/AboutView.vue"),
  },
  {
    path: "/service",
    name: "ServiceView",
    component: () => import("../views/ServiceView.vue"),
  },
  {
    path: "/news",
    name: "news",
    component: () => import("../views/NewsView.vue"),
  },
  {
    path: "/contact",
    name: "contact",
    component: () => import("../views/ContactView.vue"),
  },
  {
    path: "/support",
    name: "support",
    component: () => import("../views/SupportView.vue"),
  },
  /*   {
      path: "/product",
      name: "product",
      component: () => import("../views/ProductView.vue"),
    }, */
  {
    path: "/activity/:id",
    name: "ActivityDetails",
    component: () => import("../views/ActivityDetailView.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Scroll to top on route change, except for the "ServiceView" route
router.afterEach((to) => {
  // if (to.name !== "ServiceView") {
  //   window.scrollTo({
  //     top: 0,
  //     behavior: "smooth",
  //   });
  // }
  document.documentElement.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  document.body.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

export default router;
