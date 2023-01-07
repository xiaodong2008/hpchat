<template>
  <a-spin :spinning="!handshake" tip="Loading">
    <div id="chatroom">
      <div class="sidebar">
        <div class="item">
          <message-outlined/>
        </div>
        <div class="item">
          <solution-outlined/>
        </div>
      </div>
      <div class="app">
        <ChatIndex v-if="focus === 1" ref="chatIndex"/>
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
import ChatFriend from "./chatfriend";

export default {
  name: "index",
  data() {
    // db
    const userid = this.$store.state.user.userid

    if (!localStorage.getItem(`db-${userid}`)) {
      localStorage.setItem(`db-${userid}`, JSON.stringify({
        friendMsg: {}
      }));
    }

    let db = JSON.parse(localStorage.getItem(`db-${userid}`));
    this.$store.commit("setDb", db);

    let reconnect = null
    const connectWs = () => {
      // ws handshake
      let ws
      if (import.meta.env.DEV) {
        ws = new WebSocket("ws://localhost:1051/chat");
      } else {
        ws = new WebSocket("wss://hpchat.xiaodong.space/chat");
      }
      ws.onopen = function () {
        console.log("服务器一次握手成功", Date.now());
        message.success("服务器一次握手成功");
        ws.msg({
          type: "login",
          token: cookie.get("token"),
          data: {
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
            if (reconnect) {
              reconnect()
              reconnect = null;
            }
          } else {
            console.log("服务器二次握手失败", Date.now());
            message.error("服务器二次握手失败");
          }
        } else if (msg.type === "message") {
          console.log(this.$refs.chatIndex?.chatTarget,this.$refs.chatIndex?.chatTarget === msg.data.from)
          if (!(this.$refs.chatIndex?.chatTarget === msg.data.from))
            this.$store.commit("addUnread", msg.data.from);

          console.log(msg.data.hex)
          let isBottom
          if (this.$refs.chatIndex?.chatTarget) {
            const msgInside = selecter(".message-inside").el();
            isBottom = msgInside.scrollHeight - msgInside.scrollTop === msgInside.clientHeight;
          }
          // play sound
          this.$store.state.msgsound.play();
          ws.msg({
            type: "receive",
            token: cookie.get("token"),
            data: {
              hex: msg.data.hex,
              from: msg.data.from,
              to: msg.data.to,
            }
          })
          this.$store.commit("pushMessage", msg.data)
          console.log(this.$refs)
          if (isBottom) this.$refs.chatIndex.newMsg(msg.data.from);
        } else if (msg.type === "success") {
          this.$refs.chatIndex.success(msg.id, msg.time);
        }
      };
      ws.onclose = function () {
        reconnect = message.loading("重连消息同步服务", 0);
        console.log("服务器断开连接", Date.now());
        connectWs()
      };
      this.$store.commit("setWs", ws);
    }
    connectWs();
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
    }).each((item, index, key) => {
      console.log(index);
      item.attr("index", key + 1);
    });
  },
  components: {
    MessageOutlined,
    SolutionOutlined,
    ChatIndex,
    ChatFriend
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

  .app {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>