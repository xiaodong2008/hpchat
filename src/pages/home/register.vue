<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "primevue/usetoast";

import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";

import { register } from "../../api/user";
import message from "../../message";

const email = ref("");
const password = ref("");
const confirm = ref("");
const remember = ref(false);
const loading = ref(false);

const toast = useToast();

async function submit() {
  if (!email.value || !password.value || !confirm.value) {
    return message.error(toast, "Please fill in all fields");
  }
  if (password.value !== confirm.value) {
    return message.error(toast, "Passwords do not match");
  }

  loading.value = true;

  const result = await register(email.value, password.value);

  loading.value = false;

  if (typeof result === "string") {
    return message.error(toast, result);
  }

  message.success(toast, "Registration successful");
}
</script>

<template>
  <div class="register">
    <InputText class="username" v-model="email" placeholder="Email" />
    <Password toggleMask class="password" v-model="password" placeholder="Password" />
    <Password toggleMask class="password" v-model="confirm" placeholder="Confirm Password" :feedback="false" />
    <Button @click="submit()" :disabled="loading" class="btn" label="Register" iconPos="right"
      icon="pi pi-angle-right" />
    <span @click="$emit('switch')">or <g>Login</g> to your account</span>
    <div id="captcha"></div>
  </div>
</template>

<style scoped lang="scss">
.register {

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
    margin-left: 120px !important;
    transition: all 0.3s;
  }

  :deep(.p-button-icon) {
    margin-left: 0 !important;
    margin-right: 120px !important;
    transition: all 0.3s;
  }

  &:hover :deep(.p-button-label),
  &:hover :deep(.p-button-icon) {
    margin: 0 !important;
  }
}
</style>