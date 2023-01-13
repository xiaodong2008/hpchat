import {createStore} from 'vuex'
import {selecter} from "fastjs-next";
import date from "@/plugin/date.js";

let lastMsgHex = null

const store = createStore({
  state: {
    login: false,
    ws: null,
    user: {},
    friends: [],
    msgdb: {},
    msgsound: new Audio("/sound/msg.mp3"),
    db: {}
  },
  mutations: {
    login(state, userdata) {
      state.login = true;
      state.user = userdata;
    },
    updateUser(state, [key, value]) {
      state.user[key] = value;
    },
    setFriends(state, friends) {
      state.friends = friends;
    },
    setWs(state, ws) {
      state.ws = ws;
    },
    setDb(state, db) {
      state.db = db;
    },
    addUnread(state, userid) {
      console.log("addUnread", userid);
      state.db[userid] = state.db[userid] || {
        unread: 0,
      };
      state.db[userid].unread++;
      console.log(state)
      localStorage.setItem(`db-${state.user.userid}`, JSON.stringify(state.db));
    },
    clearUnread(state, userid) {
      state.db[userid] = state.db[userid] || {
        unread: 0,
      };
      state.db[userid].unread = 0;
      localStorage.setItem(`db-${state.user.userid}`, JSON.stringify(state.db));
    },
    logout(state) {
      // clear all data
      state.user = {};
      state.login = false;
      state.friends = [];
      state.msgdb = {};
      state.db = {};
      state.ws = null;
    },
    pushMessage(state, message) {
      console.log(">>>>", "New Message", message.message);
      // 检查上一条消息，如果时间和信息内容一样，就不添加，如果是自己发的，就放行
      if (lastMsgHex === message.hex && message.from !== state.user.userid) {
        return;
      }

      lastMsgHex = message.hex;
      if (message.hex) // delete message.hex;
        message.hex = undefined;
      const id = message.from === state.user.userid ? message.to : message.from;
      console.log(message);
      if (state.msgdb[id] === undefined) {
        state.msgdb[id] = [];
      }
      if (localStorage.getItem(`msgdb-${state.user.userid}-${id}`) === null) {
        localStorage.setItem(`msgdb-${state.user.userid}-${id}`, JSON.stringify([]));
      }
      const localdb = JSON.parse(localStorage.getItem(`msgdb-${state.user.userid}-${id}`));
      localdb.push(message);
      if (!state.msgdb[id]) state.msgdb[id] = [];
      localStorage.setItem(`msgdb-${state.user.userid}-${id}`, JSON.stringify(localdb));
      console.log("change time", message.time, ">>>>", date(message.time));
      message.time = date(message.time);
      state.msgdb[id].push(message);
    },
    clearMessage(state, userid) {
      state.msgdb[userid] = [];
      localStorage.setItem(`msgdb-${state.user.userid}-${userid}`, JSON.stringify([]));
    },
    loadMessage(state, [id, bottom = false]) {
      // load 10 messages from localstorage
      const localdb = JSON.parse(localStorage.getItem(`msgdb-${state.user.userid}-${id}`));
      console.log(localdb);
      const length = selecter(".message-wrapper .message").length;
      if (localdb === null) {
        state.msgdb[id] = [];
        return false;
      } else {
        if (state.msgdb[id] === undefined) state.msgdb[id] = [];
        let start = localdb.length - 1 - state.msgdb[id].length;
        for (let i = localdb.length - 1 - state.msgdb[id].length; i >= start - 5; i--) {
          if (i < 0) return false;
          console.log(i, localdb[i], localdb[i].time);
          localdb[i].time = date(localdb[i].time);
          state.msgdb[id].unshift(localdb[i]);
        }
      }
      console.log(state.msgdb[id]);
      const waitLoad = setInterval(() => {
        if (selecter(".message-wrapper .message").length <= length) return
        clearInterval(waitLoad);
        if (bottom) {
          const messageInside = selecter(".message-inside").el();
          messageInside.scrollTo(0, messageInside.scrollHeight);
          console.log("bottom", messageInside, messageInside.scrollHeight, messageInside.scrollTop);
        }
        // autoLoad
        store.dispatch('autoLoadMessage', id);
      }, 100);
    }
  },
  actions: {
    async autoLoadMessage({commit, state}, id) {
      const messageWrapper = selecter(".message-wrapper").el();
      const messageInside = selecter(".message-inside").el();
      const messageBox = selecter(".message-box").el();
      console.log(messageBox, messageBox.scrollHeight, messageBox.scrollTop);
      if (messageInside.offsetHeight < messageWrapper.offsetHeight) {
        await commit('loadMessage', [id, true]);
        // scroll to bottom
        // messageBox.scrollTop = messageBox.scrollHeight;
      }
    }
  },
  getters: {}
})

export default store