<script setup>
import { defineComponent, ref } from "vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";

const username = ref("");
const password = ref("");
const remember = ref(false);
</script>

<template>
  <div class="login">
    <InputText class="username" v-model="username" placeholder="Username" />
    <Password toggleMask class="password" v-model="password" placeholder="Password" :feedback="false" />
    <div class="flex align-items-center remember">
      <Checkbox v-model="remember" inputId="ingredient1" name="pizza" value="Cheese" />
      <label for="ingredient1" class="ml-2">Remember for 7 days</label>
    </div>
    <Button class="btn" label="Login" iconPos="right" icon="pi pi-angle-right" />
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

  g {
    color: var(--theme-color);
    font-weight: 600;
    cursor: pointer;
    user-select: none;
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