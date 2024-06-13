<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";

import Menu from 'primevue/menu';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { logout } from '../../api/user';
import message from '../../message';

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

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
        icon: 'pi pi-sign-out',
        command: () => {
          confirm.require({
            message: 'Do you sure you want to logout?',
            header: 'Logout',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            acceptLabel: 'Logout',
            rejectClass: 'p-button-secondary p-button-outlined',
            acceptClass: 'p-button-danger',
            accept: async () => {
              const res = await logout();
              if (res) message.error(toast, res, 'Logout Failed');
              else router.push('/').then(() => message.success(toast, 'You have been logged out', 'Logout Success'));
            }
          });
        }
      }
    ]
  },
  {
    separator: true
  }
])

const page = ref(route.params.page || 'Message');

watch(() => route.params.page, (page) => {
  page.value = page || 'Message';
})
</script>

<template>
  <div class="app">
    <Toast />
    <ConfirmDialog />
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