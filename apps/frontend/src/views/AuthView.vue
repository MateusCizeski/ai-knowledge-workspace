<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="text-4xl mb-3">🧠</div>
        <h1 class="text-2xl font-bold text-gray-900">AI Knowledge Workspace</h1>
        <p class="text-gray-500 text-sm mt-1">Your intelligent second brain</p>
      </div>

      <!-- Card -->
      <div class="card p-8">
        <!-- Tabs -->
        <div class="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-md transition-all',
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Error -->
        <div v-if="authStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <!-- Login Form -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="loginForm.email" type="email" class="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="loginForm.password" type="password" class="input" placeholder="••••••••" required />
          </div>
          <button type="submit" class="btn-primary w-full justify-center" :disabled="authStore.loading">
            <span v-if="authStore.loading">Signing in…</span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <!-- Register Form -->
        <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="registerForm.name" type="text" class="input" placeholder="John Doe" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="registerForm.email" type="email" class="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="registerForm.password" type="password" class="input" placeholder="Min. 6 characters" required minlength="6" />
          </div>
          <button type="submit" class="btn-primary w-full justify-center" :disabled="authStore.loading">
            <span v-if="authStore.loading">Creating account…</span>
            <span v-else>Create account</span>
          </button>
        </form>

        <!-- Demo hint -->
        <p class="text-center text-xs text-gray-400 mt-4">
          Demo: demo@workspace.dev / demo123
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const tabs = [
  { id: 'login', label: 'Sign in' },
  { id: 'register', label: 'Create account' },
]
const activeTab = ref<'login' | 'register'>('login')

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '' })

async function handleLogin() {
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password)
    router.push({ name: 'workspace-home' })
  } catch {}
}

async function handleRegister() {
  try {
    await authStore.register(registerForm.value.email, registerForm.value.name, registerForm.value.password)
    router.push({ name: 'workspace-home' })
  } catch {}
}
</script>
