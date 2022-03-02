const { DefinePlugin } = require("webpack");
module.exports = {
  pluginOptions: {
    electronBuilder: {
      // 解决渲染进程不能使用electron api的问题
      nodeIntegration: true,
      builderOptions: {
        productName: "交互视频配置",
        appId: "interactive.video",
        directories: {
          buildResources: "static" // //指定打包需要的静态资源，默认是static
        },
        extraResources: [{
          "from": "static/",
          "to": "static/"
        }],
        win: {
          // "target": ["msi", "nsis"], //安装包的格式，默认是"nsis"
          "icon": "static/icon/qa.ico", //安装包的图标
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
        mac: {
          // "target": ["dmg", "zip"], //安装包的格式，默认是"dmg"和"zip"
          // "category": "public.app-category.utilities" //应用程序安装到哪个分类下，具体有哪些分类可以在苹果官网上找
          "icon": "static/icons/qa.icns"
        },
        dmg: {
          // "background": "build/background.jfif", //安装窗口背景图
          "icon": "static/icons/qa.icns", //安装图标
          "iconSize": 100, //图标的尺寸
          "contents": [ //安装图标在安装窗口中的坐标信息
            {
              "x": 380,
              "y": 180,
              "type": "link",
              "path": "/Applications"
            },
            {
              "x": 130,
              "y": 180,
              "type": "file"
            }
          ],
          "window": { //安装窗口的大小
            "width": 540,
            "height": 380
          }
        },
        linux: {
          "icon": "static/icon/qa.ico"
        },
        // "files": [ // 通过配置files字段，来指定将哪些内容进行打包
        //   "package.json",
        //   "index.js",
        //   "src/**/*"
        // ]
      }
    },
  },
  configureWebpack: {
    plugins: [
      new DefinePlugin({
        "process.env.FLUENTFFMPEG_COV": false,
      }),
    ],
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
