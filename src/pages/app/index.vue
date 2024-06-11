<script setup>
import { ref } from 'vue';

import Menu from 'primevue/menu';

const items = ref([
  {
    separator: true
  },
  {
    label: 'Chat',
    items: [
      {
        label: 'Message',
        icon: 'pi pi-user'
      },
      {
        label: 'Search',
        icon: 'pi pi-search'
      },
      {
        label: 'Create',
        icon: 'pi pi-plus'
      }
    ]
  },
  {
    label: 'Profile',
    items: [
      {
        label: 'Settings',
        icon: 'pi pi-cog'
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out'
      }
    ]
  },
  {
    separator: true
  }
])
</script>

<template>
  <div class="app">
    <Menu class="menu" :model="items">
    </Menu>
  </div>
</template>

<style scoped lang="scss">
.app {
  height: 100%;
  width: 100%;
  display: flex;

  :deep(.menu) {
    width: 200px;
    margin: 5px;
    border: 1px solid var(--theme-color);
  }
}
</style>