const {contextBridge,ipcRenderer} = require("electron");
contextBridge.exposeInMainWorld(
  "api", {
  send: async (channel, data={}) => {
    return await ipcRenderer.invoke(channel, data);
  },
  receive: async (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
}
);