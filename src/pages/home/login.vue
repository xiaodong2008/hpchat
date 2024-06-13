<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";

import { login } from "../../api/user";
import message from "../../message";

const username = ref("");
const password = ref("");
const remember = ref(false);
const loading = ref(false);

const router = useRouter();
const toast = useToast();

async function submit() {
  if (!username.value || !password.value) {
    return message.error(toast, "Please fill in all fields");
  }

  loading.value = true;

  const result = await login(username.value, password.value);

  loading.value = false;

  if (typeof result === "string") {
    return message.error(toast, result);
  }

  message.success(toast, "Login successful");
  router.push("/app");
}
</script>

<template>
  <div class="login">
    <InputText class="username" v-model="username" placeholder="Email" />
    <Password toggleMask class="password" v-model="password" placeholder="Password" :feedback="false" />
    <div class="flex align-items-center remember">
      <Checkbox v-model="remember" inputId="ingredient1" name="pizza" value="Cheese" />
      <label for="ingredient1" class="ml-2">Remember for 7 days</label>
    </div>
    <Button @click="submit()" :disabled="loading" class="btn" label="Login" iconPos="right" icon="pi pi-angle-right" />
    <span @click="$emit('switch')">or <g>Register Now</g></span>
  </div>
</template>

<style scoped lang="scss">
.login {

  >*,
  :deep(input) {
    width: 100%;
  }
}

.username,
.password {
  margin-bottom: 20px;
}

.remember {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  float: right;
  width: auto;

  label {
    user-select: none;
    cursor: pointer;
  }
}

span {
  margin-top: 4px;
  display: block;
  text-align: center;
  cursor: pointer;
  user-select: none;

  g {
    color: var(--theme-color);
    font-weight: 600;
  }
}

.btn {
  :deep(.p-button-label) {
    margin-left: 130px !important;
    transition: all 0.3s;
  }

  :deep(.p-button-icon) {
    margin-left: 0 !important;
    margin-right: 130px !important;
    transition: all 0.3s;
  }

  &:hover :deep(.p-button-label),
  &:hover :deep(.p-button-icon) {
    margin: 0 !important;
  }
}
</style>