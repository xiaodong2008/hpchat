<template>
  <div id="chatfriend">
    <div class="search">
      <div class="search-input">
        <a-input
            type="text"
            :placeholder="lang.name.search"
            v-model:value="searchValue"
            @keyup.enter="sendRequest"
        >
          <template #prefix>
            <UserOutlined/>
          </template>
          <template #suffix>
            <SearchOutlined @click="sendRequest" style="cursor:pointer;"/>
          </template>
        </a-input>
      </div>
    </div>
    <div class="index">
      <!-- 好友申请 -->
      <a-list>
        <a-list-item
            v-for="item in requestList"
            :key="item.userid"
            class="request-item"
        >
          <a-list-item-meta
              :title="item.nickname"
              :description="`${lang.name.email}: ${item.email}`"
          >
            <template #avatar>
              <a-avatar shape="square" :src="item.avatar" style="margin: 8px 0;">
                <template #icon>
                  <UserOutlined v-if="!item.avatar"/>
                </template>
              </a-avatar>
            </template>
          </a-list-item-meta>
          <a-button
              type="primary"
              @click="handleRequest(item.userid, true)"
              :loading="loading" style="margin-right: 10px"
          >{{ lang.name.accept }}
          </a-button
          >
          <a-button
              type="primary" danger
              @click="handleRequest(item.userid, false)"
              :loading="loading"
          >{{ lang.name.reject }}
          </a-button
          >
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>

<script>
import {UserOutlined, SearchOutlined} from '@ant-design/icons-vue';
import langSetup from "@/lang";
import {friendRequest, friendRequestList, handleRequest} from "@/api.js";

export default {
  name: "index",
  data() {
    let update = () => {
      friendRequestList().then(res => {
        this.requestList = res;
      });
    };
    update();
    return {
      searchValue: "",
      lang: langSetup("chat"),
      requestList: [],
      loading: false,
      autoUpdate: setInterval(update, 3000)
    };
  },
  methods: {
    sendRequest() {
      friendRequest(this.searchValue)
    },
    handleRequest(userid, accept) {
      this.loading = true;
      handleRequest(userid, accept).then(res => {
        this.loading = false;
        if (res) {
          this.requestList = this.requestList.filter(item => item.userid !== userid);
        }
      }).catch(() => {
        this.loading = false;
      });
    }
  },
  beforeUnmount() {
    console.log("unmount", this.autoUpdate);
    clearInterval(this.autoUpdate);
  },
  components: {
    UserOutlined,
    SearchOutlined
  },
}
</script>

<style lang="less" scoped>
#chatfriend {
  padding: 20px;
  background: #efefef;
  height: 100%;
}
</style>