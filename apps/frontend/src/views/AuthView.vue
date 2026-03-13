<template>
  <div
    class="min-h-screen flex items-center justify-center p-4"
    style="background: var(--bg-secondary)"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🧠</div>
        <h1 class="text-2xl font-bold" style="color: var(--text-primary)">
          AI Knowledge Workspace
        </h1>
        <p class="text-sm mt-1" style="color: var(--text-secondary)">
          Your intelligent second brain
        </p>
      </div>

      <div class="card p-8">
        <div class="flex justify-end mb-4">
          <button
            @click="toggle()"
            class="text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5"
            style="
              background: var(--bg-tertiary);
              color: var(--text-secondary);
              border: 1px solid var(--border);
            "
          >
            {{ theme === "dark" ? "☀️ Light" : "🌙 Dark" }}
          </button>
        </div>

        <div
          class="flex gap-1 p-1 rounded-lg mb-6"
          style="background: var(--bg-tertiary)"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-md transition-all',
              activeTab === tab.id ? 'shadow-sm' : '',
            ]"
            :style="
              activeTab === tab.id
                ? 'background: var(--bg); color: var(--text-primary)'
                : 'color: var(--text-secondary)'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <div
          v-if="authStore.error"
          class="mb-4 p-3 rounded-lg text-sm"
          style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c"
        >
          {{ authStore.error }}
        </div>

        <form
          v-if="activeTab === 'login'"
          @submit.prevent="handleLogin"
          class="space-y-4"
        >
          <div>
            <label
              class="block text-sm font-medium mb-1"
              style="color: var(--text-secondary)"
              >Email</label
            >
            <input
              v-model="loginForm.email"
              type="email"
              class="input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium mb-1"
              style="color: var(--text-secondary)"
              >Password</label
            >
            <input
              v-model="loginForm.password"
              type="password"
              class="input"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            class="btn-primary w-full justify-center"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? "Signing in…" : "Sign in" }}
          </button>
        </form>

        <form
          v-if="activeTab === 'register'"
          @submit.prevent="handleRegister"
          class="space-y-4"
        >
          <div>
            <label
              class="block text-sm font-medium mb-1"
              style="color: var(--text-secondary)"
              >Name</label
            >
            <input
              v-model="registerForm.name"
              type="text"
              class="input"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium mb-1"
              style="color: var(--text-secondary)"
              >Email</label
            >
            <input
              v-model="registerForm.email"
              type="email"
              class="input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium mb-1"
              style="color: var(--text-secondary)"
              >Password</label
            >
            <input
              v-model="registerForm.password"
              type="password"
              class="input"
              placeholder="Min. 6 characters"
              required
              minlength="6"
            />
          </div>
          <button
            type="submit"
            class="btn-primary w-full justify-center"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? "Creating account…" : "Create account" }}
          </button>
        </form>

        <p class="text-center text-xs mt-4" style="color: var(--text-tertiary)">
          Demo: demo@workspace.dev / demo123
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/composables/useTheme";

const router = useRouter();
const authStore = useAuthStore();
const { theme, toggle } = useTheme();
const tabs = [
  { id: "login", label: "Sign in" },
  { id: "register", label: "Create account" },
];
const activeTab = ref<"login" | "register">("login");
const loginForm = ref({ email: "", password: "" });
const registerForm = ref({ name: "", email: "", password: "" });

async function handleLogin() {
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password);
    router.push({ name: "workspace-home" });
  } catch {}
}
async function handleRegister() {
  try {
    await authStore.register(
      registerForm.value.email,
      registerForm.value.name,
      registerForm.value.password,
    );
    router.push({ name: "workspace-home" });
  } catch {}
}
</script>
