<template>
  <div id="home" v-if="$store.state.login">
    <ChatRoom />
  </div>
</template>

<script>
import ChatRoom from "../chatroom";

export default {
  name: 'home',
  data() {
    return {
    }
  },
  components: {
    ChatRoom
  },
}
</script>