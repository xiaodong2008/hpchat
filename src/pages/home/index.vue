<script setup>
import { ref } from "vue";
import Panel from 'primevue/panel';

import Login from "./login.vue";
import Register from "./register.vue";

const isLogin = ref(true);
</script>

<template>
  <div class="h-full w-full flex justify-center items-center">
    <Panel class="w-80">
      <Login v-if="!isLogin" />
      <Register v-else />
    </Panel>
  </div>
</template>