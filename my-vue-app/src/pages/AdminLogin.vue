<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { VITE_API_BASE_URL } from "@/stores/config";

const email = ref("");
const password = ref("");
const error = ref<string | null>(null);
const isLoading = ref(false);

const router = useRouter();
const route = useRoute();
const store = useQuestionnaireStore();

const handleLogin = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${VITE_API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    store.setAuthToken(data.token);

    const redirectPath = route.query.redirect || "/admin/dashboard";
    router.push(redirectPath as string);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">Reviewer Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  /* background-color: #f3f4f6; */
}
.login-box {
  background: white;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  width: 100vh;
  max-width: 400px;
}
.title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 2rem;
}
.input-group {
  margin-bottom: 1.5rem;
}
.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
.error-message {
  color: #dc2626;
  text-align: center;
  margin-bottom: 1rem;
}
.login-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #eb4648;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.login-btn:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}
</style>
