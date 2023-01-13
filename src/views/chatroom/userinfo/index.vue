<template>
  <div id="userinfo" v-if="$store.state.login">
    <span class="title">
        {{ lang.name.userinfo }}
    </span>
    <a-list>
      <a-list-item>
        <a-list-item-meta
            title="userid"
            :description="user.userid"
        />
      </a-list-item>
      <a-list-item>
        <a-list-item-meta
            :title="lang.name.email"
            :description="user.email"
        />
      </a-list-item>
      <a-list-item>
        <a-list-item-meta
            :title="lang.name.nickname"
            :description="user.nickname"
        />
        <template #extra>
          <a-space v-if="edit.nickname" style="flex-wrap: wrap">
            <a-input
                v-model:value="edit.newNickname"
                placeholder="请输入昵称"
                style="width: 200px"
            />
            <a-space>
              <a-button type="primary" @click="changeNickname"
              >
                {{ lang.name.save }}
              </a-button>
              <a-button @click="edit.nickname = false">
                {{ lang.name.cancel }}
              </a-button>
            </a-space>
          </a-space>
          <a-button type="primary" @click="edit.nickname = true" v-else>
            {{ lang.name.edit }}
          </a-button>
        </template>
      </a-list-item>
      <a-list-item>
        <a-list-item-meta
            :title="lang.name.avatar">
          <template #description>
            <a-avatar
                :src="user.avatar"
                size="large"
                shape="square">
              <template #icon v-if="!user.avatar">
                <UserOutlined/>
              </template>
            </a-avatar>
          </template>
        </a-list-item-meta>
        <template #extra>
          <a-button type="primary" @click="$refs.file.click()">
            <UploadOutlined/>
            {{ lang.name.upload }}
          </a-button>
        </template>
      </a-list-item>
    </a-list>
    <input
        ref="file"
        type="file"
        style="display: none"
        @change="uploadFile"
        accept="image/*"
    />
  </div>
</template>

<script>
import langSetup from "@/lang";
import {UserOutlined, UploadOutlined} from "@ant-design/icons-vue";
import {editUser, uploadAvatar} from "@/api.js";
import {message} from "ant-design-vue";

const lang = langSetup("chat", "userinfo");

export default {
  name: "index",
  data() {
    return {
      lang,
      user: this.$store.state.user,
      edit: {
        nickname: false,
        newNickname: ""
      }
    };
  },
  methods: {
    uploadFile() {
      let file = this.$refs.file.files[0];
      // check is image
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg";
      if (!isJpgOrPng) {
        return message.error(lang.error.avatarType);
      }
      // check size is < 1MB
      if (file.size > 1024 * 1024) {
        return message.error(lang.error.avatarSize);
      }
      // file as blob
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // get base64
        let base64 = reader.result;
        console.log(base64);
        uploadAvatar(base64).then(() => {
          this.$store.commit("updateUser", ["avatar", base64]);
        });
      };
    },
    changeNickname() {
      editUser("nickname", this.edit.newNickname).then(() => {
        this.$store.commit("updateUser", ["nickname", this.edit.newNickname]);
        this.edit.nickname = false;
      })
    }
  },
  components: {
    UserOutlined,
    UploadOutlined
  }
}
</script>

<style lang="less" scoped>
#userinfo {
  margin: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  height: calc(100% - 40px);
  overflow-x: auto;
}
</style>