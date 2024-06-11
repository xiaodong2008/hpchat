<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

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

const route = useRoute();

const page = ref(route.params.page || 'Message');

watch(() => route.params.page, (page) => {
  page.value = page || 'Message';
})
</script>

<template>
  <div class="app">
    <Menu class="menu" :model="items"></Menu>
    <div class="page">
      <Transition name="page" mode="out-in">
        <component :is="page" />
      </Transition>
    </div>
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

  .page {
    flex-grow: 1;
    margin: 5px;
    margin-left: 0;
    border: 1px solid var(--theme-color);
    border-radius: 5px;
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