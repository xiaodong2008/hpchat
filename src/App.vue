<template>
  <AConfigProvider :autoInsertSpaceInButton="false">
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </AConfigProvider>
</template>

<script>
import getLang from "./lang";
import {isLogin, getFriends} from "./api";
import {message} from "ant-design-vue";
import cookie from "js-cookie";

const lang = getLang("config")
console.log(lang);

// 路由白名单
const whiteList = ["/login", "/register"];

export default {
  name: "App",
  data() {
    document.title = lang.title.default;
    console.log(this.$route.path);
    // 是否登录
    isLogin().then(res => {
      if (!res.login) {
        cookie.remove("token");
        if (whiteList.indexOf(this.$route.path) === -1) {
          message.error(lang.error.login.need);
          this.$router.push("/login");
        }
      } else {
        const userid = res.userid;
        // update token expire time
        cookie.set("token", cookie.get("token"), {expires: 1});
        this.$store.commit("login", res);
        getFriends().then(res => {
          res.forEach(item => {
            if (!localStorage.getItem(`chat-${userid}-${item.userid}`)) {
              localStorage.setItem(`chat-${userid}-${item.userid}`, JSON.stringify([item.messages]));
            }
          })
          this.$store.commit("setFriends", res);
          console.log("friendList", res);
        });
      }
    })
    this.$router.afterEach((to) => {
      document.title = lang.title[to.name] || lang.title.default;
    });
    return {}
  }
}
</script>

<style lang="less">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>