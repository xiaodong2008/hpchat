<template>
  <div id="chatindex">
    <div class="sidebar">
      <div class="user" v-for="user in $store.state.friends">

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "index"
}
</script>

<style lang="less" scoped>
#chatindex {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  .sidebar {
    width: 240px;
    height: 100%;
    background-color: #f0f0f0;
    border-right: 1px solid #d9d9d9;
    .user {
      width: 100%;
      height: 50px;
      background-color: #fff;
      border-bottom: 1px solid #d9d9d9;
    }
  }
}
</style>