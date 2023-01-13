<template>
  <a-spin :spinning="!handshake" tip="Loading">
    <div id="chatroom">
      <div class="sidebar">
        <div class="item" @click="focus = 1">
          <a-badge :count="unreadCount">
            <message-outlined class="icon"/>
          </a-badge>
        </div>
        <div class="item" @click="focus = 2">
          <solution-outlined class="icon"/>
        </div>
        <div class="bottom">
          <div class="item" @click="focus = 3">
            <user-outlined class="icon"/>
          </div>
          <div class="item" @click="logoutActive = true">
            <LogoutOutlined class="icon"/>
            <a-modal
                :title="lang.name.logout"
                :visible="logoutActive"
                @ok="logout"
                @cancel="logoutActive = false"
            >
              <p>{{ lang.name.logoutConfirm }}</p>
            </a-modal>
          </div>
        </div>
      </div>
      <div class="app">
        <ChatIndex v-if="focus === 1" ref="chatIndex" @refreshFriend="getFriend"/>
        <ChatFriend v-if="focus === 2"/>
        <UserInfo v-if="focus === 3"/>
      </div>
    </div>
  </a-spin>
</template>

<script>
import cookie from "js-cookie";
// get store
import store from "@/store";
import {message} from "ant-design-vue";
import {MessageOutlined, SolutionOutlined, LogoutOutlined, UserOutlined} from "@ant-design/icons-vue";
import {selecter} from "fastjs-next";
import ChatIndex from "./chatindex";
import ChatFriend from "./chatfriend";
import langSetup from "@/lang";
import {getFriends} from "@/api.js";
import UserInfo from "./userinfo";

const lang = langSetup("chat");

export default {
  name: "index",
  computed: {
    unreadCount() {
      const db = this.$store.state.db;
      // db = {userid: {unread: 0}}
      let count = 0;
      Object.keys(db).forEach(key => {
        console.log(`${count} + ${db[key].unread || 0}`)
        count += db[key].unread || 0;
      });
      return count;
    },
  },
  methods: {
    getFriend() {
      getFriends().then(res => {
        const userid = this.$store.state.user.userid;
        res.forEach(item => {
          console.log("getFriends -> item", item)
          if (!localStorage.getItem(`msgdb-${userid}-${item.userid}`)) {
            localStorage.setItem(`msgdb-${userid}-${item.userid}`, JSON.stringify(item.messages));
          } else {
            for (let message of item.messages) {
              console.log("for -> message", message)
              this.$store.commit("pushMessage", message);
              this.$store.commit("addUnread", message.from);
            }
          }
        })
        this.$store.commit("setFriends", res);
        console.log("friendList", res);
      });
    },
    logout() {
      cookie.remove("token");
      this.$store.commit("logout");
      message.success("退出登录成功");
      this.$router.push("/login");
    }
  },
  data() {
    // db
    const userid = this.$store.state.user.userid

    if (!localStorage.getItem(`db-${userid}`)) {
      localStorage.setItem(`db-${userid}`, JSON.stringify({}));
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
            message.success(lang.name.connect);
            this.handshake = true;
            if (reconnect) {
              reconnect()
              reconnect = null;
            }
          } else {
            console.log("服务器二次握手失败", Date.now());
            message.error(lang.name.connectFailed);
          }
        } else if (msg.type === "message") {
          console.log(this.$refs.chatIndex?.chatTarget?.userid, this.$refs.chatIndex?.chatTarget?.userid === msg.data.from)
          if (!(this.$refs.chatIndex?.chatTarget?.userid === msg.data.from))
            this.$store.commit("addUnread", msg.data.from);
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
      focus: 0,
      logoutActive: false,
      lang
    }
  },
  mounted() {
    this.getFriend();
  },
  components: {
    MessageOutlined,
    SolutionOutlined,
    ChatIndex,
    ChatFriend,
    LogoutOutlined,
    UserOutlined,
    UserInfo
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
    position: relative;

    .item {
      width: 50px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover, &.active {
        background-color: #3e3e3e;
      }
    }

    .icon {
      color: white;
      font-size: 18px;
      width: 26px;
      height: 26px;
      margin: auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
    }
  }

  .app {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>