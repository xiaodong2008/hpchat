<template>
  <a-spin :spinning="!handshake" tip="Loading">
    <div id="chatroom">
      <div class="sidebar">
        <div class="item">
          <message-outlined />
        </div>
        <div class="item">
          <solution-outlined />
        </div>
      </div>
      <div class="app">
        <ChatIndex v-if="focus === 1"/>
        <ChatFriend v-if="focus === 2"/>
      </div>
    </div>
  </a-spin>
</template>

<script>
import cookie from "js-cookie";
// get store
import store from "@/store";
import {message} from "ant-design-vue";
import {MessageOutlined, SolutionOutlined} from "@ant-design/icons-vue";
import {FastjsDom, selecter} from "fastjs-next";
import ChatIndex from "./chatindex";

export default {
  name: "index",
  data() {
    // ws handshake
    const ws = new WebSocket("ws://localhost:1051/chat");
    ws.onopen = function () {
      console.log("服务器一次握手成功", Date.now());
      message.success("服务器一次握手成功");
      ws.msg({
        type: "login",
        data: {
          token: cookie.get("token"),
          userid: store.state.user.userid,
        }
      });
    };
    ws.msg = function (msg) {
      ws.send(JSON.stringify(msg));
    };
    ws.onmessage = (msg) => {
      msg = JSON.parse(msg.data);
      if (msg.type === "login") {
        if (msg.success) {
          console.log("服务器二次握手成功", Date.now());
          message.success("服务器二次握手成功");
          this.handshake = true;
        } else {
          console.log("服务器二次握手失败", Date.now());
          message.error("服务器二次握手失败");
        }
      }
    };
    ws.onclose = function () {
      console.log("与服务器连接丢失", Date.now());
      message.error("与服务器连接丢失，页面将在3秒后刷新");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };
    return {
      handshake: false,
      focus: 0
    }
  },
  mounted() {
    selecter("#chatroom .sidebar .item").on("click", (e) => {
      e.father().each((item) => {
        new FastjsDom(item).attr("class", "item");
      });
      e.attr("class", "item active");
      this.focus = Number(e.attr("index"));
      console.log(this.focus);
      console.log(e);
    }).each((item, index, key) => {
      console.log(index);
      item.attr("index", key + 1);
    });
  },
  components: {
    MessageOutlined,
    SolutionOutlined,
    ChatIndex,
  }
}
</script>

<style lang="less" scoped>
#chatroom {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;

  .sidebar {
    background-color: #2e2e2e;
    width: 50px;

    .item {
      width: 50px;
      height: 50px;
      display: flex;
      font-size: 18px;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: white;
      &:hover, &.active {
        background-color: #3e3e3e;
      }
    }
  }
}
</style>