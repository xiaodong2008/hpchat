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
  <div class="register">
    <InputText class="username" v-model="username" placeholder="Username" />
    <Password toggleMask class="password" v-model="password" placeholder="Password" />
    <Password toggleMask class="password" v-model="password" placeholder="Confirm Password" :feedback="false" />
    <Button class="btn" label="Register" iconPos="right" icon="pi pi-angle-right" />
    <span @click="$emit('switch')">or <g>Login</g> to your account</span>
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

  g {
    color: var(--theme-color);
    font-weight: 600;
    cursor: pointer;
    user-select: none;
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