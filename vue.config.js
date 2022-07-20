const { DefinePlugin } = require("webpack");
// const path = require("path");
module.exports = {
  // publicPath: "./",
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true, // true使得渲染进程能使用electron api
      builderOptions: {
        productName: "交互视频配置",
        appId: "interactive.video",
        files: [
          './**/*'
        ],
        directories: {
          buildResources: "./static" // //指定打包需要的静态资源，默认是static
        },
        asar: {
          "smartUnpack": false
        },
        extraResources: [{
          "from": "static/",
          "to": "static/"
        }],
        win: {
          // "target": ["msi", "nsis"], //安装包的格式，默认是"nsis"
          "icon": "static/icon/qa.ico", //安装包的图标
          "requestedExecutionLevel": "requireAdministrator", //获取管理员权限
          "legalTrademarks": "lyswhut",
          // "artifactName": "${productName} v${version} ${env.ARCH} ${env.TARGET}.${ext}"
          //"target"值"nsis"打包出来的就是exe文件
          //nsis是windows系统安装包的制作程序，它提供了安装、卸载、系统设置等功能
          //关于"nsis"的一些配置
          // "nsis": {
          //   "oneClick": false, //是否一键安装，默认为true
          //   "language": "2052", //安装语言，2052对应中文
          //   "perMachine": true, //为当前系统的所有用户安装该应用程序
          //   "allowToChangeInstallationDirectory": true //允许用户选择安装目录
          // }
        },
        nsis: {
          'oneClick': false, // 是否一键安装
          "language": "2052",
          "differentialPackage": true,
          'allowElevation': true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          'allowToChangeInstallationDirectory': true, // 允许修改安装目录
          // 'installerIcon': './favicon.ico', // 安装图标
          // 'uninstallerIcon': './favicon.ico', // 卸载图标
          // 'installerHeaderIcon': './favicon.ico', // 安装时头部图标
          'createDesktopShortcut': true, // 创建桌面图标
          'createStartMenuShortcut': true, // 创建开始菜单图标
          'shortcutName': '交互视频配置' // 图标名称(项目名称)
        },
        mac: {
          // "target": ["dmg", "zip"], //安装包的格式，默认是"dmg"和"zip"
          "icon": "static/icons/qa.icns",
          "category": "public.app-category.utilities" //应用程序安装到哪个分类下，具体有哪些分类可以在苹果官网上找
        },
        dmg: {
          // "background": "build/background.jfif", //安装窗口背景图
          "icon": "static/icons/qa.icns", //安装图标
          "iconSize": 100, //图标的尺寸
          // "contents": [ //安装图标在安装窗口中的坐标信息
          //   { // 安装时候显示的应用图标位置
          //     "x": 380,
          //     "y": 180,
          //     "type": "link",
          //     "path": "/Applications"
          //   },
          //   { // 右侧苹果自带安装图标位置
          //     "x": 110,
          //     "y": 180,
          //     "type": "file"
          //   }
          // ],
          "title": "交互视频配置 v${version}"
        },
        linux: {
          "icon": "static/icon/qa.ico"
        },
      }
    },
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.mode = 'production';
      // 打包文件大小配置
      config.performance = {
        maxEntrypointSize: 10000000,
        maxAssetSize: 30000000
      }
    }
    config.plugins.push(new DefinePlugin({
      "process.env.FLUENTFFMPEG_COV": false,
    }))
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "视频问答交互配置";
      return args;
    });
    // config.plugin("define").tap((definitions) => {
    //   Object.assign(definitions[0]["process.env"], {
    //     FLUENTFFMPEG_COV: false,
    //   });
    //   return definitions;
    // });
  },
};
