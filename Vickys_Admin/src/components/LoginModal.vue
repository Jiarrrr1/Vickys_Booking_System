<template>
  <div class="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 w-full max-w-md">
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <User class="w-8 h-8 text-green-700" />
      </div>
      <h1 class="text-2xl font-semibold text-neutral-800">Vicky's Resort</h1>
      <p class="text-neutral-500 mt-1">Admin Dashboard Access</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Email Address
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User class="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="email"
              v-model="email"
              :disabled="isLoading"
              class="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white text-neutral-900 placeholder-neutral-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="admin@vickysresort.com"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="password"
              v-model="password"
              :disabled="isLoading"
              class="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white text-neutral-900 placeholder-neutral-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            class="h-4 w-4 text-green-700 focus:ring-green-500 border-neutral-300 rounded cursor-pointer"
          />
          <label for="remember-me" class="ml-2 block text-sm text-neutral-600 cursor-pointer">
            Remember me
          </label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-green-700 hover:text-green-800">
            Forgot password?
          </a>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
      >
        {{ isLoading ? 'Signing in...' : 'Sign In' }}
        <ArrowRight v-if="!isLoading" class="w-4 h-4" />
      </button>
    </form>

    <div class="mt-6 pt-6 border-t border-neutral-100 text-center text-sm text-neutral-500">
      Protected area. Authorized personnel only.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  // Set loading state
  isLoading.value = true
  
  // Simple delay for UX
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Set authentication flag (optional)
  localStorage.setItem('isAuthenticated', 'true')
  
  // Redirect to dashboard
  router.push('/')
}
</script>