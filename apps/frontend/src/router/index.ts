import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/workspace",
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/AuthView.vue"),
      meta: { public: true, transition: "fade" },
    },
    {
      path: "/workspace",
      name: "workspace",
      component: () => import("@/views/WorkspaceView.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "workspace-home",
          component: () => import("@/views/HomeView.vue"),
          meta: { transition: "fade" },
        },
        {
          path: "page/:id",
          name: "page",
          component: () => import("@/views/PageView.vue"),
          meta: { transition: "slide" },
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.user && auth.token) await auth.fetchMe();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: "auth" };
  if (to.meta.public && auth.isAuthenticated) return { name: "workspace-home" };
});

export default router;
