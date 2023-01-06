import { createStore } from 'vuex'

const store = createStore({
  state: {
    login: false,
    ws: null,
    user: {},
    friends: []
  },
  mutations: {
    login(state, userdata) {
      state.login = true;
      state.user = userdata;
    }
  },
  actions: {
  },
  getters: {
  }
})

export default store