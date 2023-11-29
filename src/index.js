"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const Util_1 = require("./utils/Util");
const path = __importStar(require("path"));
const WebhookServer_1 = require("./WebhookServer");
const electron_reload_1 = __importDefault(require("electron-reload"));
const WebhookType_1 = require("./types/WebhookType");
const electron_updater_1 = require("electron-updater");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
if (electron_is_dev_1.default) {
    (0, electron_reload_1.default)("", {});
}
electron_updater_1.autoUpdater.setFeedURL({
    provider: 'github',
    repo: process.env.GITHUB_REPO,
    owner: process.env.GITHUB_OWNER,
    private: false,
});
let windowHooks = null;
let mainWindow = null;
let tray = null;
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
const createMain = () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 500,
        height: 390,
        autoHideMenuBar: true,
        resizable: false,
        maximizable: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        },
    });
    mainWindow.loadFile(path.join(__dirname, 'ui/ScreenMain.html'));
    mainWindow.on("minimize", () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.hide();
    });
    mainWindow.on("close", () => {
        electron_1.app.quit();
    });
    let imgPath = electron_is_dev_1.default ? "assets/icon.png" : path.join(process.resourcesPath, "icon.png");
    tray = new electron_1.Tray(imgPath);
    const contextMenu = electron_1.Menu.buildFromTemplate([
        { label: 'Show Window', type: 'normal' },
    ]);
    tray.setToolTip('This is my application.');
    tray.setContextMenu(contextMenu);
    tray.addListener("click", () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
    });
};
const createWindow = (width, height) => {
    const window = new electron_1.BrowserWindow({
        width,
        height,
        autoHideMenuBar: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        },
    });
    return window;
};
const stopServer = () => {
    try {
        server.close();
        server = null;
        serverStatus = false;
    }
    catch (e) {
        console.log(e);
    }
    update();
};
const restartServer = () => {
    try {
        server === null || server === void 0 ? void 0 : server.close();
        server = (0, WebhookServer_1.runServer)(update);
        serverStatus = true;
        console.log("Server closed");
    }
    catch (e) {
        console.log(e);
    }
    update();
};
const update = () => {
    windowHooks === null || windowHooks === void 0 ? void 0 : windowHooks.webContents.send("update");
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("update");
};
const message = (msg) => {
    windowHooks === null || windowHooks === void 0 ? void 0 : windowHooks.webContents.send("message", msg);
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("message", msg);
};
const backToHook = () => {
    windowHooks.loadFile(path.join(__dirname, 'ui/ScreenHooks.html'));
    windowHooks.setResizable(true);
    windowHooks.setSize(550, 600, true);
    windowHooks.setResizable(false);
};
electron_1.app.on('ready', () => {
    setTimeout(() => {
        electron_updater_1.autoUpdater.checkForUpdates();
    }, 5000);
    electron_1.ipcMain.handle("openconfig", (event, data) => __awaiter(void 0, void 0, void 0, function* () {
        (0, Util_1.openConfig)();
        console.log("Conf açılıyor");
    }));
    electron_1.ipcMain.handle("copytext", (event, data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("data");
        electron_1.clipboard.writeText(data);
        message("URL coppied");
    }));
    electron_1.ipcMain.handle('buildhook', (event, data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(data);
        let cmd = data.command;
        let reg = /\$\w*/g;
        let variables = (cmd.match(reg) || []).map(e => e.replace("$", ""));
        let hook = Object.assign(Object.assign({}, data), { variables: variables ? variables : [], id: (0, Util_1.randomID)(), needPassword: data.needPassword == "on" ? true : false, last: {}, method: WebhookType_1.WebhookMethod[data.method] });
        console.log(hook);
        (0, Util_1.saveHook)(hook);
        backToHook();
        update();
    }));
    electron_1.ipcMain.handle('updatehook', (event, data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(data);
        let cmd = data.command;
        let reg = /\$\w*/g;
        let variables = (cmd.match(reg) || []).map(e => e.replace("$", ""));
        let hook = Object.assign(Object.assign({}, data), { variables: variables ? variables : [], needPassword: data.needPassword == "on" ? true : false, last: {}, method: WebhookType_1.WebhookMethod[data.method] });
        console.log(hook);
        (0, Util_1.updateHook)(hook);
        backToHook();
        update();
    }));
    electron_1.ipcMain.handle('get-settings', (event, ...args) => __awaiter(void 0, void 0, void 0, function* () {
        const result = (0, Util_1.getSettings)();
        return result;
    }));
    electron_1.ipcMain.handle('get-server-status', (event, ...args) => __awaiter(void 0, void 0, void 0, function* () {
        return serverStatus;
    }));
    electron_1.ipcMain.handle('set-server-status', (event, status) => __awaiter(void 0, void 0, void 0, function* () {
        if (status) {
            restartServer();
        }
        else {
            stopServer();
        }
        return serverStatus;
    }));
    electron_1.ipcMain.handle('delete-hook', (event, id) => __awaiter(void 0, void 0, void 0, function* () {
        (0, Util_1.deleteHook)(id);
        update();
    }));
    electron_1.ipcMain.handle('hooks', (event, ...args) => __awaiter(void 0, void 0, void 0, function* () {
        if (windowHooks) {
            windowHooks.maximize();
            windowHooks.moveTop();
            windowHooks.focus();
            return;
        }
        windowHooks = createWindow(550, 600);
        windowHooks.loadFile(path.join(__dirname, 'ui/ScreenHooks.html'));
        windowHooks.on("close", () => { windowHooks = null; });
    }));
    electron_1.ipcMain.handle('back-to-hooks', (event, ...args) => __awaiter(void 0, void 0, void 0, function* () {
        backToHook();
    }));
    electron_1.ipcMain.handle('new-hook', (event, ...args) => __awaiter(void 0, void 0, void 0, function* () {
        windowHooks.loadFile(path.join(__dirname, 'ui/ScreenNewHook.html'));
        windowHooks.setResizable(true);
        windowHooks.setSize(windowHooks.getSize()[0], 450, true);
        windowHooks.setResizable(false);
    }));
    electron_1.ipcMain.handle('go-update', (event, id) => __awaiter(void 0, void 0, void 0, function* () {
        windowHooks.loadFile(path.join(__dirname, 'ui/ScreenNewHook.html'));
        windowHooks.setResizable(true);
        windowHooks.setSize(windowHooks.getSize()[0], 450, true);
        windowHooks.setResizable(false);
        let settings = (0, Util_1.getSettings)();
        let hook = {};
        settings.webhooks.map((h) => {
            if (h.id == id) {
                hook = h;
            }
        });
        windowHooks.webContents.send("hook", hook);
        setTimeout(() => {
            windowHooks.webContents.send("hook", hook);
        }, 200);
    }));
    electron_1.ipcMain.handle('savehook', (event, ...args) => __awaiter(void 0, void 0, void 0, function* () {
        windowHooks.loadFile(path.join(__dirname, 'ui/ScreenNewHook.html'));
        windowHooks.setResizable(true);
        windowHooks.setSize(windowHooks.getSize()[0], 450, true);
        windowHooks.setResizable(false);
    }));
    createMain();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createMain();
    }
});
electron_updater_1.autoUpdater.on('checking-for-update', () => {
});
electron_updater_1.autoUpdater.on('update-available', (info) => {
});
electron_updater_1.autoUpdater.on('update-not-available', (info) => {
});
electron_updater_1.autoUpdater.on('error', (err) => {
    console.log(err);
});
electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
    electron_updater_1.autoUpdater.quitAndInstall();
});
let server = (0, WebhookServer_1.runServer)(update);
let serverStatus = server ? true : false;
