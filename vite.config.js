import vue from '@vitejs/plugin-vue'
import {viteRequire} from 'vite-require'

export default {
  "plugins": [
    vue(),
    viteRequire({fileRegex: /(.js|.ts|.vue)$/})
  ],
  "base": "./",
  "resolve": {
    "extensions": [
      "index",
      ".mjs",
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
      ".vue",
    ],
    "alias": {
      "@": "/src",
    }
  },
  "build": {
    "outDir": "./fastjs_build_temp/"
  },
  "css": {
    "preprocessorOptions": {
      "less": {
        "javascriptEnabled": true
      }
    }
  },
  // proxy
  "server": {
    "proxy": {
      // "/api": {
      //   "target": "http://localhost:1051",
      // }
      // replace /api with http://localhost:1051
      "/api": "http://localhost:1051",

    }
  }
}