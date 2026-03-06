<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <div class="smark">
          <svg viewBox="0 0 24 24">
            <path d="M12 22V12"/>
            <path d="M12 12C12 8 9 5 5 4c1 3 3 5 7 8"/>
            <path d="M12 12c0-4 3-7 7-8-1 3-3 5-7 8"/>
            <path d="M9 22h6"/>
          </svg>
        </div>
        <h1>Vicky's Resort</h1>
        <p>Admin Dashboard</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input
            v-model="credentials.username"
            type="text"
            class="form-input"
            placeholder="Enter your username"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="credentials.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="form-error" style="margin-bottom: 16px;">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-primary"
          :disabled="isLoading"
          style="width: 100%; padding: 12px; font-size: 14px;"
        >
          <span v-if="!isLoading">Sign In</span>
          <span v-else style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>
            Signing in...
          </span>
        </button>
      </form>

      <!-- Footer -->
      <div class="login-footer">
        <p>© 2026 Vicky's Resort. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth'  // default import

const router = useRouter()

const credentials = ref({
  username: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const result = await authService.login(credentials.value)
    
    if (result.success) {
      router.push('/admin/dashboard')  // Redirect to dashboard, not root
    } else {
      error.value = result.error || 'Login failed. Please try again.'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sand) 0%, var(--sand-dk) 100%);
  padding: 20px;
}

.login-card {
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--sh-lg);
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo .smark {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: var(--forest);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-logo .smark svg {
  width: 32px;
  height: 32px;
  stroke: #fff;
  fill: none;
  stroke-width: 2;
}

.login-logo h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--t1);
  margin-bottom: 4px;
}

.login-logo p {
  font-size: 13px;
  color: var(--t3);
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.login-footer p {
  font-size: 12px;
  color: var(--t3);
}
</style>