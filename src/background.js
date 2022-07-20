import {
  app,
  protocol,
  BrowserWindow,
  nativeImage,
  Tray,
  Menu
} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import fs from "fs-extra";
import path from "path";
import "./utils/ipc";

const isDevelopment = process.env.NODE_ENV !== 'production';
const TEMPDIR = path.join(__dirname, "../static/tempCache");
const STATICDIR = path.join(__dirname, "..", "/static/icons");
let tray;
let win;
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    icon: nativeImage.createFromPath(path.join(STATICDIR, 'qa.ico')),
    devTools: isDevelopment,
    width: 1024,
    minWidth: 1024,
    height: 768,
    minHeight: 768,
    webPreferences: {
      // nodeIntegrationInWorker: true,
      // scrollBounce: true,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // 如果处于开发模式，则加载开发服务器的 url
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// 关闭所有窗口后退出。
app.on('window-all-closed', () => {
  fs.rm(TEMPDIR, {
    recursive: true
  }, (err) => {
    if (err) {
      return;
    }
    fs.mkdir(TEMPDIR, {
      recursive: true
    }, (err) => {
      if (err) return;
    });
  })
  // 在 macOS 上，应用程序及其菜单栏通常保持活动状态，直到用户使用 Cmd + Q 明确退出
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在 macOS 上，当单击停靠图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
app.on('will-finish-launching', () => {
    fs.mkdir(TEMPDIR, {
      recursive: true
    }, (err) => {
      if (err) return;
    })
})
// 当 Electron 完成初始化并准备创建浏览器窗口时，将调用此方法。某些 API 只能在此事件发生后使用。
app.on('ready', async () => {
  app.setAppUserModelId("interactive.video");
  app.allowRendererProcessReuse = false;
  createTray();
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (err) {
      console.error('Vue Devtools failed to install:', err.toString())
    }
  }
  createWindow()
})

// 在开发模式下根据父进程的请求干净地退出.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

function createTray() {
  tray = new Tray(path.join(STATICDIR, getTrayImageFileName()))
  let menu = Menu.buildFromTemplate([{
      label: '显示窗口',
      click: () => !win.isVisible() && win.show()
    },
    {
      label: "隐藏窗口",
      click: () => win.isVisible() && win.hide()
    },
    {
      label: '退出',
      click: () => {
          app.quit()
      }
    }
  ])
  tray.setContextMenu(menu)
  tray.setToolTip('视频问答交互配置')
  tray.on('click', () => win.show())
}
function getTrayImageFileName() {
  switch (process.platform) {
    case 'win32':
      return 'qa.ico'
    case 'darwin':
    case 'linux':
    default:
      return 'qa.png'
  }
}