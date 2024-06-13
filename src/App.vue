<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePrimeVue } from 'primevue/config';

import Toast from 'primevue/toast';

const PrimeVue = usePrimeVue();

const isDarkMode = ref(window.matchMedia?.('(prefers-color-scheme: dark)').matches);

onMounted(() => {
  setTheme(isDarkMode.value);
})
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  setTheme(event.matches);
});

function setTheme(isDark: boolean) {
  isDarkMode.value = isDark;
  PrimeVue.changeTheme(isDark ? 'aura-light-green' : 'aura-dark-green', isDark ? 'aura-dark-green' : 'aura-light-green', 'theme-link')
  document.querySelector("#theme-link")?.setAttribute('href', `/themes/${isDark ? 'aura-dark-green' : 'aura-light-green'}/theme.css`);
}

</script>

<template>
  <toast />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
