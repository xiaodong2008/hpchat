# hpchat

## 项目架构

- vue3
- vite
- fastjs-next
- fastjs-cli
- js-cookie
- ant-design-vue
- vue-router
- vuex
- websocket
- nodejs
- mysql

## 准备工作

### 创建 node/secret.json

```json
{
  "mysql": {
    "dev": {
      "username": "Your mysql username",
      "password": "Your mysql password"
    },
    "product": {
      "username": "Your mysql username",
      "password": "Your mysql password"
    }
  }
}
```

### 打开 src/views/chatroom/index.vue

将下方代码中的 `wss://hpchat.xiaodong.space/chat` 改为你的服务器地址

```javascript
ws = new WebSocket("wss://hpchat.xiaodong.space/chat");
```

### 数据库

```sql
/*
 Navicat MySQL Data Transfer

 Source Server         : Local Mysql 5.7
 Source Server Type    : MySQL
 Source Server Version : 50739 (5.7.39-log)
 Source Host           : localhost:3306
 Source Schema         : hpchat

 Target Server Type    : MySQL
 Target Server Version : 50739 (5.7.39-log)
 File Encoding         : 65001

 Date: 10/01/2023 12:09:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for friend
-- ----------------------------
DROP TABLE IF EXISTS `friend`;
CREATE TABLE `friend`  (
  `from` bigint(20) NOT NULL,
  `to` bigint(20) NOT NULL,
  `create_time` bigint(19) NOT NULL,
  `approve` tinyint(1) NOT NULL DEFAULT 0,
  `approve_time` bigint(20) NULL DEFAULT NULL,
  `from_delete` tinyint(1) NOT NULL DEFAULT 0,
  `to_delete` tinyint(1) NOT NULL DEFAULT 0,
  INDEX `from_index`(`from`) USING BTREE,
  INDEX `to_index`(`to`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for message-temp
-- ----------------------------
DROP TABLE IF EXISTS `message-temp`;
CREATE TABLE `message-temp`  (
  `from` bigint(20) NOT NULL,
  `to` bigint(20) NOT NULL,
  `time` bigint(19) NOT NULL,
  `message` varchar(1000) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `hex` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for userdata
-- ----------------------------
DROP TABLE IF EXISTS `userdata`;
CREATE TABLE `userdata`  (
  `userid` bigint(20) NOT NULL AUTO_INCREMENT,
  `nickname` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `createTime` bigint(19) NOT NULL,
  `email` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `createEmail` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `available` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`userid`) USING BTREE,
  UNIQUE INDEX `email_index`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for userlogin
-- ----------------------------
DROP TABLE IF EXISTS `userlogin`;
CREATE TABLE `userlogin`  (
  `token` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `userid` bigint(20) NOT NULL,
  `create_time` bigint(19) NOT NULL,
  `expire_time` bigint(19) NOT NULL,
  PRIMARY KEY (`token`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
```

### 安装依赖

```bash
npm install

cd node

npm install
```

### 创建文件夹

```text
|- node
    |- data
        |- avatar
```

## 运行

### 开发环境

#### 前端

```bash
npm run dev
```

#### 后端

```bash
cd node
npm run dev
```

### 生产环境

#### 前端

##### 配置nginx

```nginx
map $http_upgrade $connection_upgrade {
    default Upgrade;
    '' close;
}

proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=hpchat:10m max_size=10g inactive=5m;

server {
    listen 80;
    server_name hpchat.xiaodong.space;
    root /web/hpchat;
    index index.html;

    proxy_cache hpchat;
    proxy_cache_valid 200 302 5m;
    proxy_cache_valid 404 1m;

    location /.data {
        return 403;
    }

    location /api {
        rewrite ^/api(/.*)$ $1 break;
        proxy_pass http://localhost:1051;
        proxy_cache none;
    }
    
    location ~ ^/api/data/avatar/[a-z0-9_]+.(jpg|jpeg|png)$ {
        add_header Cache-Control "public, max-age=31536000";
    }

    location /chat {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_pass http://localhost:1051;
        proxy_cache none;
    }

    access_log /web/hpchat/.data/log.txt;
    error_log /www/hpchat/.data/error_log.txt;
}
```

##### 打包并上传

```bash
npm run build
```

#### 后端

##### 准备工作

```bash
npm install -g pm2
```

##### 运行

```bash
cd node
pm2 start ./server.js
```

##### 停止

```bash
pm2 stop ./server.js
```

## 关于作者

- dy-xiaodong2022