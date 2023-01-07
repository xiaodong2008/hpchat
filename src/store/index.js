import {createStore} from 'vuex'
import {selecter} from "fastjs-next";

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
    pushMessage(state, message) {
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
      if (!state.msgdb[id]) state.msgdb[id] = [];
      state.msgdb[id].push(message);
      const localdb = JSON.parse(localStorage.getItem(`msgdb-${state.user.userid}-${id}`));
      localdb.push(message);
      localStorage.setItem(`msgdb-${state.user.userid}-${id}`, JSON.stringify(localdb));
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
          console.log(i);
          if (i < 0) return false;
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