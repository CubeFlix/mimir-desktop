const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { AppState, commands } = require('./backend/app.js');
const { getResourcesPath } = require('./backend/binaries.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let state = new AppState();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    icon: path.join(getResourcesPath(), "icon.png")
  });
  state.mainWindow = mainWindow;
  mainWindow.setIcon()

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.showInactive();

  // Open the DevTools.
  // TODO: comment in prod
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Mimir API functions.
app.whenReady().then(() => {
  ipcMain.handle('mimir:init', commands.init.bind(state));
  ipcMain.handle('mimir:didInit', commands.didInit.bind(state));
  ipcMain.handle('mimir:open', commands.open.bind(state));
  ipcMain.handle('mimir:save', commands.save.bind(state));
  ipcMain.handle('mimir:info', commands.info.bind(state));
  ipcMain.handle('mimir:message', commands.message.bind(state));
  ipcMain.handle('mimir:openDialog', commands.openDialog.bind(state));
  ipcMain.handle('mimir:saveDialog', commands.saveDialog.bind(state));
  ipcMain.handle('mimir:getRecent', commands.getRecent.bind(state));
  ipcMain.handle('mimir:removeFromRecent', commands.removeFromRecent.bind(state));
  ipcMain.handle('mimir:getFavorites', commands.getFavorites.bind(state));
  ipcMain.handle('mimir:addToFavorites', commands.addToFavorites.bind(state));
  ipcMain.handle('mimir:removeFromFavorites', commands.removeFromFavorites.bind(state));
  ipcMain.handle('mimir:getSettings', commands.getSettings.bind(state));
  ipcMain.handle('mimir:setSettings', commands.setSettings.bind(state));
  ipcMain.handle('mimir:homeMenu', commands.homeMenu.bind(state));
  ipcMain.handle('mimir:editMenu', commands.editMenu.bind(state));
  ipcMain.handle('mimir:previewMenu', commands.previewMenu.bind(state));
  ipcMain.handle('mimir:import', commands.importFile.bind(state));
  ipcMain.handle('mimir:export', commands.exportFile.bind(state));
  ipcMain.handle('mimir:exportPDF', commands.exportPDF.bind(state));
  ipcMain.handle('mimir:exportPlaintext', commands.exportPlaintext.bind(state));
  ipcMain.handle('mimir:shellOpenExternal', commands.shellOpenExternal.bind(state));
  ipcMain.handle('mimir:close', commands.close.bind(state));
  ipcMain.handle('mimir:setTitle', commands.setTitle.bind(state));
});