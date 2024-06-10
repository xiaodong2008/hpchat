<script setup>
import { ref } from "vue";
import Panel from "primevue/panel";

import Login from "./login.vue";
import Register from "./register.vue";

const isLogin = ref(true);

import db from "../../api/";
import { useRouter } from "vue-router";

const router = useRouter();

db.auth.getUser()
  .then((user) => {
    if (user) {
      router.push("/app")
    }
  })
</script>

<template>
  <div class="container">
    <Panel class="panel" :header="isLogin ? 'Welcome Back!' : 'Create a Account'">
      <Transition name="page" mode="out-in">
        <component :is="isLogin ? Login : Register" @switch="isLogin = !isLogin" />
      </Transition>
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

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0px);
  }
}

@keyframes page-leave {
  from {
    opacity: 1;
    transform: translateX(0px);
  }

  to {
    opacity: 0;
    transform: translateX(10px);
  }
}

.page-enter-active {
  animation: page-enter 0.3s;
}

.page-leave-active {
  animation: page-leave 0.3s;
}
</style>