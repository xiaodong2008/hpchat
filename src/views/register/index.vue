<template>
  <div id="register">
    <a-form
        :model="formState"
        name="normal_login"
        class="register-form"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
        :rules="formRules"
    >
      <a-form-item v-if="success">
        <a-alert
            :message="lang.name.success.replace('{uid}', userid)"
            type="success"
            show-icon></a-alert>
      </a-form-item>

      <a-form-item
          :label="lang.name.username"
          name="email"
      >
        <a-input v-model:value="formState.email">
          <template #prefix>
            <UserOutlined class="site-form-item-icon"/>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
          :label="lang.name.password"
          name="password"
      >
        <a-input-password v-model:value="formState.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon"/>
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item
          :label="lang.name.repeat"
          name="repeat"
      >
        <a-input-password v-model:value="formState.repeat">
          <template #prefix>
            <LockOutlined class="site-form-item-icon"/>
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item class="bottom">
        <a-checkbox v-model:checked="autoLogin" style="margin-bottom: 7px">{{ lang.name.autoLogin }}</a-checkbox>
        <a-button :disabled="disabled" type="primary" html-type="submit" class="register-form-button">
          {{ lang.name.register }}
        </a-button>
        <router-link to="/login" class="text">
          {{ lang.name.login }}
        </router-link>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {UserOutlined, LockOutlined} from '@ant-design/icons-vue';
import langSetup from "@/lang";
import {message} from "ant-design-vue";
import {isLogin, register} from "@/api.js";
import cookie from "js-cookie";

const lang = langSetup("register");

export default {
  name: "index",
  data() {
    isLogin().then(res => {
      if (res.login) this.$router.push("/");
    });

    const email = (_rule, val) => {
      if (val.length > 50) {
        return Promise.reject(lang.rules.username.length);
      }
      // 格式验证
      if (/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-]+)$/g.test(val)) {
        return Promise.resolve();
      } else {
        return Promise.reject(lang.rules.username.format);
      }
    }
    const password = (_rule, val) => {
      if (val.length < 5)
        return Promise.reject(lang.rules.password.minlength);
      if (val.length > 50)
        return Promise.reject(lang.rules.password.maxlength);
      // 格式验证
      if (/^[A-Za-z0-9_-]+$/g.test(val))
        return Promise.resolve();
      return Promise.reject(lang.rules.password.format);
    }
    const repeat = (_rule, val) => {
      console.log("repeat", val);
      if (val !== this.formState.password)
        return Promise.reject(lang.rules.password.repeat);
      return Promise.resolve();
    }

    return {
      success: false,
      userid: null,
      autoLogin: true,
      formState: {
        email: "",
        password: ""
      },
      formRules: {
        email: [
          {required: true, message: lang.rules.username.required},
          {validator: email, trigger: "change"}
        ],
        password: [
          {required: true, message: lang.rules.password.required},
          {validator: password, trigger: "change"}
        ],
        repeat: [
          {required: true, message: lang.rules.password.required},
          {validator: repeat, trigger: "change"},
        ]
      },
      disabled: false,
      lang
    }
  },
  methods: {
    onFinish() {
      this.disabled = true;
      register(this.formState.email, this.formState.password, this.autoLogin).then(res => {
        this.disabled = false;
        if (this.autoLogin) {
          message.success(lang.name.successMsg);
          // update token expire time
          cookie.set("token", res.token, {expires: 1});
          this.$router.push({path: "/"});
          return this.$store.commit("login", res);
        }
        this.success = true;
        this.userid = res.userid;
      }).catch((err) => {
        if (!err.message) message.error(lang.message.error);
        this.disabled = false;
      });
    },
    onFinishFailed() {
      this.disabled = false;
    }
  },
  components: {
    UserOutlined,
    LockOutlined
  }
}
</script>

<style lang="less" scoped>
#register {
  width: 380px;
  height: 450px;
  padding: 30px;
  background: #fff;
  border-radius: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;

  .bottom {
    position: absolute;
    bottom: 0;
    width: calc(100% - 60px);

    .register-form-button {
      width: 100%;
    }

    .text {
      text-decoration-line: underline;
      margin-top: 10px;
      color: #25aee4;
      width: 100%;
      text-align: center;
      display: inline-block;
    }
  }
}
</style>