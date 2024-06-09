<script setup>
import { ref } from "vue";
import Panel from 'primevue/panel';

import Login from "./login.vue";
import Register from "./register.vue";

const isLogin = ref(true);
</script>

<template>
  <div class="container">
    <Panel class="panel" :header="isLogin ? 'Welcome Back!' : 'Create a Account'">
      <Login v-if="isLogin" />
      <Register v-else />
    </Panel>
  </div>
</template>

<style scoped lang="scss">
.container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .panel {
    width: 400px;
  }
}
</style>