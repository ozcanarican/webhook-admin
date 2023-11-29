import { app, BrowserWindow, clipboard, ipcMain, Menu, Tray  } from 'electron'
import { createNewHook, deleteHook, getSettings, mainFolder, randomID, saveHook, updateHook } from './utils/Util';
import * as path from 'path';
import { runServer } from './WebhookServer';
import electronReload from 'electron-reload';
import { WebhookMethod, WebhookType } from './types/WebhookType';

electronReload(__dirname, {
  electron: path.join(__dirname.replace("/src",""), 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
})

let windowHooks:BrowserWindow | null = null
let mainWindow:BrowserWindow | null = null
let tray:Tray | null = null

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createMain = () => {
  // Create the browser window.
 mainWindow = new BrowserWindow({
    width: 500,
    height: 290,
    autoHideMenuBar:true,
    resizable:false,
    maximizable:false,
    alwaysOnTop:true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration:true
    },
  });
  
  mainWindow.loadFile(path.join(__dirname, 'ui/ScreenMain.html'));

  mainWindow.on("minimize",()=>{
    mainWindow?.hide()
  })

  mainWindow.on("close",()=>{
    app.quit();
  })

  //tray bar
  tray = new Tray(path.join(mainFolder,'webhook.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Window', type: 'normal' },
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  tray.addListener("click",()=>{
    mainWindow?.show()
  })
};

const createWindow = (width:number, height:number) => {
  const window = new BrowserWindow({
    width,
    height,
    autoHideMenuBar:true,
    resizable:false,
    minimizable:false,
    maximizable:false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration:true
    },
  });
  return window
}

const stopServer = () => {
  try {
    server!.close()
    server = null
    serverStatus = false
  } catch(e) {
    console.log(e)
  }
}

const restartServer = () => {
  try {
    server?.close()
    server = runServer(update)
    serverStatus = true
    console.log("Server closed")
  } catch(e) {
    console.log(e)
  }
}

const update = () => {
  windowHooks?.webContents.send("update")
  mainWindow?.webContents.send("update")
}

const message = (msg:string) => {
  windowHooks?.webContents.send("message",msg)
  mainWindow?.webContents.send("message",msg)
}

const backToHook = () => {
  windowHooks!.loadFile(path.join(__dirname, 'ui/ScreenHooks.html'));
  windowHooks!.setResizable(true)
  windowHooks!.setSize(550,600,true)
  windowHooks!.setResizable(false)
}


app.on('ready', ()=>{

  ipcMain.handle("copytext",async(event,data)=>{
    console.log("data")
    clipboard.writeText(data)
    message("URL coppied")
  })
  
  ipcMain.handle('buildhook', async (event, data) => {
    console.log(data)
    let cmd = data.command as string
    let reg = /\$\w*/g
    let variables = (cmd.match(reg) || []).map(e=>e.replace("$",""))
    let hook:WebhookType = {...data,variables: variables ? variables : [], id:randomID(), needPassword: data.needPassword == "on" ? true : false, last:{},method: WebhookMethod[data.method]}
    console.log(hook)
    saveHook(hook)
    backToHook()
    update()
  })

  ipcMain.handle('updatehook', async (event, data) => {
    console.log(data)
    let cmd = data.command as string
    let reg = /\$\w*/g
    let variables = (cmd.match(reg) || []).map(e=>e.replace("$",""))
    let hook:WebhookType = {...data,variables: variables ? variables : [], needPassword: data.needPassword == "on" ? true : false, last:{},method: WebhookMethod[data.method]}
    console.log(hook)
    updateHook(hook)
    backToHook()
    update()
  })
  
  
  ipcMain.handle('get-settings', async (event, ...args) => {
    const result = getSettings()
    return result
  })
  
  ipcMain.handle('get-server-status', async (event, ...args) => {
    return serverStatus
  })
  
  ipcMain.handle('set-server-status', async (event, status:boolean) => {
    if(status) {
      restartServer()
    } else {
      stopServer()
    }
    return serverStatus
  })
  
  ipcMain.handle('delete-hook', async (event, id:string) => {
    deleteHook(id)
    update()
  })
  
  
  ipcMain.handle('hooks', async (event, ...args) => {
    if(windowHooks) {
      windowHooks.maximize()
      windowHooks.moveTop()
      windowHooks.focus()
      return
    }
    windowHooks = createWindow(550,600)
    windowHooks.loadFile(path.join(__dirname, 'ui/ScreenHooks.html'));
    windowHooks.on("close",()=>{windowHooks = null})
  })
  
  ipcMain.handle('back-to-hooks', async (event, ...args) => {
    backToHook()
  })
  
  ipcMain.handle('new-hook', async (event, ...args) => {
    windowHooks!.loadFile(path.join(__dirname, 'ui/ScreenNewHook.html'));
    windowHooks!.setResizable(true)
    windowHooks!.setSize(windowHooks!.getSize()[0],450,true)
    windowHooks!.setResizable(false)
  })

  ipcMain.handle('go-update', async (event, id) => {
    windowHooks!.loadFile(path.join(__dirname, 'ui/ScreenNewHook.html'));
    windowHooks!.setResizable(true)
    windowHooks!.setSize(windowHooks!.getSize()[0],450,true)
    windowHooks!.setResizable(false)
    let settings = getSettings()
    let hook = {}
    settings.webhooks.map((h)=>{
      if(h.id == id) {
          hook = h
      }
    })
    windowHooks!.webContents.send("hook",hook)
    setTimeout(() => {
      windowHooks!.webContents.send("hook",hook)
    }, 200);
  })
  
  ipcMain.handle('savehook', async (event, ...args) => {
    windowHooks!.loadFile(path.join(__dirname, 'ui/ScreenNewHook.html'));
    windowHooks!.setResizable(true)
    windowHooks!.setSize(windowHooks!.getSize()[0],450,true)
    windowHooks!.setResizable(false)
  })

  createMain()
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMain();
  }
});

let server = runServer(update)
let serverStatus = server ? true : false
