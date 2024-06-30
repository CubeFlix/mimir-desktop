// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mimirApi', {
  init: () => ipcRenderer.invoke('mimir:init'),
  open: (path) => ipcRenderer.invoke('mimir:open', path),
  save: (path, doc) => ipcRenderer.invoke('mimir:save', path, doc),
  info: (path) => ipcRenderer.invoke('mimir:info', path),
  message: (options) => ipcRenderer.invoke('mimir:message', options),
  openDialog: (options) => ipcRenderer.invoke('mimir:openDialog', options),
  saveDialog: (options) => ipcRenderer.invoke('mimir:saveDialog', options),
  getRecent: () => ipcRenderer.invoke('mimir:getRecent'),
  removeFromRecent: (path) => ipcRenderer.invoke('mimir:removeFromRecent', path),
  getFavorites: () => ipcRenderer.invoke('mimir:getFavorites'),
  addToFavorites: (path) => ipcRenderer.invoke('mimir:addToFavorites', path),
  removeFromFavorites: (path) => ipcRenderer.invoke('mimir:removeFromFavorites', path),
  getSettings: () => ipcRenderer.invoke('mimir:getSettings'),
  setSettings: (settings) => ipcRenderer.invoke('mimir:setSettings', settings),
  homeMenu: () => ipcRenderer.invoke('mimir:homeMenu'),
  editMenu: () => ipcRenderer.invoke('mimir:editMenu'),
  previewMenu: () => ipcRenderer.invoke('mimir:previewMenu'),
  on: (name, callback) => ipcRenderer.on("mimir:" + name, callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  importFile: (path) => ipcRenderer.invoke('mimir:import', path),
  exportFile: (path, data) => ipcRenderer.invoke('mimir:export', path, data),
  exportPDF: (path, html, options) => ipcRenderer.invoke('mimir:exportPDF', path, html, options),
  exportPlaintext: (path, html, options) => ipcRenderer.invoke('mimir:exportPlaintext', path, html, options),
  shellOpenExternal: (url) => ipcRenderer.invoke('mimir:shellOpenExternal', url),
  close: () => ipcRenderer.invoke('mimir:close'),
  setTitle: (title) => ipcRenderer.invoke('mimir:setTitle', title)
});