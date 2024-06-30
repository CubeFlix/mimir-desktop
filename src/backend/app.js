// app.js - Backend app entrypoint.

var fs = require('fs').promises;
var { join } = require("path");
var { app, dialog, Menu, shell, ipcMain, BrowserWindow, clipboard } = require('electron');
var { spawn } = require('child_process');
var { wkHtmlToPdf, wkHtmlToPdfVersion } = require('./binaries');
var htmlToText = require("html-to-text");
var ReadWriteLock = require('rwlock');
const { existsSync } = require('original-fs');

const version = "v1.0.0";
const mimirVersion = "v1.0.0";

function about() {
  const message = `Mimir Desktop`;
  const detail = `Mimir Desktop ${version}
Built by cubeflix (https://github.com/cubeflix).
Running on Mimir rich text editing library ${mimirVersion}.
${existsSync(wkHtmlToPdf) ? `Found wkHTmlToPdf binary version ${wkHtmlToPdfVersion}` : `Could not find wkHtmlToPdf binary.`}
Powered by Electron.`
  dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    title: "Mimir",
    message: message,
    detail: detail,
  });
}

function learnMore() {
  shell.openExternal("https://github.com/cubeflix/mimir");
}

class AppState {
    constructor() {
        this.recentCapacity = 20;
        this.recentFiles = [];
        this.favorites = [];
        this.settings = {};

        this.storeLock = new ReadWriteLock();
        this.settingsLock = new ReadWriteLock();
    }

    addToRecent(path) {
        if (this.recentFiles.find(p => p == path)) {
            this.removeFromRecent(path);
        }
        this.recentFiles.unshift(path);
        if (this.recentFiles.length > this.recentCapacity) {
            this.recentFiles.pop();
        }
        this.saveStore();
    }

    removeFromRecent(path) {
        const i = this.recentFiles.findIndex(p => p == path);
        if (i != -1) {
            this.recentFiles.splice(i, 1);
        }
        this.saveStore();
    }

    addToFavorites(path) {
        this.favorites.unshift(path);
        this.saveStore();
    }

    removeFromFavorites(path) {
        const i = this.favorites.findIndex(p => p == path);
        if (i != -1) {
            this.favorites.splice(i, 1);
        }
        this.saveStore();
    }

    setSettings(settings) {
      this.settings = settings;
      this.saveSettings();
    }

    async loadStore() {
      await this.storeLock.async.readLock(async function (error, release) {
        const path = app.getPath("userData");
        try {
            const data = await fs.readFile(join(path, "user.json"));
            const { favorites, recentFiles } = JSON.parse(data);
            assert(favorites, "cannot find favorites");
            assert(recentFiles, "cannot find recent files");
            this.favorites = favorites;
            this.recentFiles = recentFiles;
        } catch (e) {
            this.favorites = [];
            this.recentFiles = [];
        } finally {
          release();
        }
      }.bind(this));
    }

    async saveStore() {
      this.storeLock.writeLock(async function (release) {
        const path = app.getPath("userData");
        const data = JSON.stringify({ favorites: this.favorites, recentFiles: this.recentFiles });
        await fs.writeFile(join(path, "user.json"), data, {
          encoding: 'utf8',
          flag: 'w'
        });
        release();
      }.bind(this));
    }

    async loadSettings() {
      this.settingsLock.readLock(async function (release) {
        const path = app.getPath("userData");
        try {
          const data = await fs.readFile(join(path, "settings.json"));
          const settings = JSON.parse(data);
          assert(settings, "cannot load settings");
          this.settings = settings;
        } catch (e) {
          this.settings = {};
        } finally {
          release();
        }
      }.bind(this));
    }

    async saveSettings() {
      this.settingsLock.writeLock(async function (release) {
        const path = app.getPath("userData");
        const data = JSON.stringify(this.settings);
        await fs.writeFile(join(path, "settings.json"), data, {
          encoding: 'utf8',
          flag: 'w'
        });
        release();
      }.bind(this));
    }
}

async function init() {
  await this.loadStore();
  this.loadSettings();
}

function assert(predicate, message) {
    if (predicate) {return;}
    else {
        throw new Error(message);
    }
}

async function open(e, path) {
    const data = await fs.readFile(path);
    const doc = JSON.parse(data);
    assert(doc.name, "doc does not contain name");
    assert(doc.content, "doc does not contain content");
    this.addToRecent(path);
    doc.isFavorite = !!this.favorites.find(p => p == path);
    return doc;
}

async function save(e, path, doc) {
    assert(doc.name, "doc does not contain name");
    assert(doc.content, "doc does not contain content");
    const data = JSON.stringify(doc);
    await fs.writeFile(path, data, {
      encoding: 'utf8',
      flag: 'w'
    });
    this.addToRecent(path);
}

async function info(e, path) {
    const data = await fs.readFile(path);
    const doc = JSON.parse(data);
    assert(doc.name, "doc does not contain name");
    assert(doc.content, "doc does not contain content");
    const stat = await fs.stat(path);
    return { name: doc.name, created: stat.birthtime, modified: stat.mtime };
}

async function message(e, options) {
    return await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), options);
}

async function openDialog(e, options) {
    return (await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options)).filePaths[0];
}

async function saveDialog(e, options) {
    return (await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), options)).filePath;
}

async function getRecent(e) {
    return this.recentFiles;
}

async function removeFromRecent(e, path) {
    this.removeFromRecent(path);
}

async function getFavorites(e) {
    return this.favorites;
}

async function addToFavorites(e, path) {
    this.addToFavorites(path);
}

async function removeFromFavorites(e, path) {
    this.removeFromFavorites(path);
}

async function getSettings(e) {
  var settings = {
    "spellcheck": true,
    "default-zoom": 100,
    "recent-capacity": 20
  }
  for (const prop in this.settings) {
    settings[prop] = this.settings[prop];
  }

  // Set recent capacity.
  this.recentCapacity = settings["recent-capacity"];
  if (this.recentFiles.length > settings["recent-capacity"]) {
    this.recentFiles = this.recentFiles.splice(0, settings["recent-capacity"]);
  }
  this.saveStore();

  return settings;
}

async function setSettings(e, settings) {
  this.setSettings(settings);

  // Set recent capacity.
  this.recentCapacity = settings["recent-capacity"];
  if (this.recentFiles.length > settings["recent-capacity"]) {
    this.recentFiles = this.recentFiles.splice(0, settings["recent-capacity"]);
  }
  this.saveStore();
}

async function homeMenu(e) {
    mainWindow = this.window;
    const template = [
        {
          label: 'File',
          submenu: [
            {
              label: 'New',
              accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:new');
              }
            },
            {
              label: 'Open',
              accelerator: process.platform === 'darwin' ? 'Command+O' : 'Ctrl+O',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:open');
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Save',
              accelerator: process.platform === 'darwin' ? 'Command+S' : 'Ctrl+S',
              enabled: false
            },
            {
              label: 'Save As',
              accelerator: process.platform === 'darwin' ? 'Command+Shift+S' : 'Ctrl+Shift+S',
              enabled: false
            },
            {
              label: 'Import',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:import');
              }
            },
            {
              label: 'Export',
              enabled: false
            },
            {
              label: 'Print',
              enabled: false,
              accelerator: process.platform === 'darwin' ? 'Command+P' : 'Ctrl+P',
            },
            {
              role: 'close'
            }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            {
              role: 'undo',
              enabled: false
            },
            {
              role: 'redo',
              enabled: false
            },
            {
              type: 'separator'
            },
            {
              role: 'cut',
              enabled: false
            },
            {
              role: 'copy',
              enabled: false
            },
            {
              role: 'paste',
              enabled: false
            },
            {
              role: 'pasteandmatchstyle',
              enabled: false
            },
            {
              role: 'delete',
              enabled: false
            },
            {
              role: 'selectall',
              enabled: false
            }
          ]
        },
        {
          label: 'View',
          submenu: [
            {
              label: 'Preview',
              accelerator: process.platform === 'darwin' ? 'Alt+Command+P' : 'Ctrl+Shift+P',
              enabled: false
            },
            {
              label: 'Word Count',
              enabled: false
            },
            {
              label: 'Home',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:goHome');
              }
            },
            {
              type: 'separator'
            },
            {
              role: 'resetzoom'
            },
            {
              role: 'zoomin'
            },
            {
              role: 'zoomout'
            },
            {
              type: 'separator'
            },
            {
              role: 'togglefullscreen'
            }
          ]
        },
        {
          role: 'help',
          submenu: [
            {
              label: 'About',
              click () { about(); }
            },
            {
              label: 'Learn More',
              click () { learnMore(); }
            }
          ]
        }
      ]
      
      if (process.platform === 'darwin') {
        template.unshift({
          label: app.getName(),
          submenu: [
            {
              role: 'about'
            },
            {
              type: 'separator'
            },
            {
              role: 'services',
              submenu: []
            },
            {
              type: 'separator'
            },
            {
              role: 'hide'
            },
            {
              role: 'hideothers'
            },
            {
              role: 'unhide'
            },
            {
              type: 'separator'
            },
            {
              role: 'quit'
            }
          ]
        })
        // Edit menu.
        template[1].submenu.push(
          {
            type: 'separator'
          },
          {
            label: 'Speech',
            submenu: [
              {
                role: 'startspeaking'
              },
              {
                role: 'stopspeaking'
              }
            ]
          }
        )
    }

    if (process.argv[2] == '--dev') {
      const devtools = {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      };
      template[2].submenu.unshift(devtools);
    }
      
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

async function editMenu(e) {
    mainWindow = this.window;
    const template = [
        {
          label: 'File',
          submenu: [
            {
              label: 'New',
              accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:new');
              }
            },
            {
              label: 'Open',
              accelerator: process.platform === 'darwin' ? 'Command+O' : 'Ctrl+O',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:open');
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Save',
              accelerator: process.platform === 'darwin' ? 'Command+S' : 'Ctrl+S',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:save');
              }
            },
            {
              label: 'Save As',
              accelerator: process.platform === 'darwin' ? 'Command+Shift+S' : 'Ctrl+Shift+S',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:save-as');
              }
            },
            {
              label: 'Import',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:import');
              }
            },
            {
              label: 'Export',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:export');
              }
            },
            {
              label: 'Print',
              accelerator: process.platform === 'darwin' ? 'Command+P' : 'Ctrl+P',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:print');
              }
            },
            {
              role: 'close'
            }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Undo',
              accelerator: process.platform === 'darwin' ? 'Command+Z' : 'Ctrl+Z',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:undo');
              }
            },
            {
              label: 'Redo',
              accelerator: process.platform === 'darwin' ? 'Command+Y' : 'Ctrl+Y',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:redo');
              }
            },
            {
              type: 'separator'
            },
            {
              role: 'cut'
            },
            {
              role: 'copy'
            },
            {
              role: 'paste'
            },
            {
              role: 'pasteandmatchstyle'
            },
            {
              role: 'delete'
            },
            {
              role: 'selectall'
            }
          ]
        },
        {
          label: 'View',
          submenu: [
            {
              label: 'Preview',
              accelerator: process.platform === 'darwin' ? 'Alt+Command+P' : 'Ctrl+Shift+P',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:preview');
              }
            },
            {
              label: 'Word Count',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:wordcount');
              }
            },
            {
              label: 'Home',
              click (item, focusedWindow) {
                mainWindow.webContents.send('mimir:goHome');
              }
            },
            {
              type: 'separator'
            },
            {
              role: 'resetzoom'
            },
            {
              role: 'zoomin'
            },
            {
              role: 'zoomout'
            },
            {
              type: 'separator'
            },
            {
              role: 'togglefullscreen'
            }
          ]
        },
        {
          role: 'help',
          submenu: [
            {
              label: 'About',
              click () { about(); }
            },
            {
              label: 'Learn More',
              click () { learnMore(); }
            }
          ]
        }
    ]
      
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          {
            role: 'about'
          },
          {
            type: 'separator'
          },
          {
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            role: 'hide'
          },
          {
            role: 'hideothers'
          },
          {
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            role: 'quit'
          }
        ]
      })
      // Edit menu.
      template[1].submenu.push(
        {
          type: 'separator'
        },
        {
          label: 'Speech',
          submenu: [
            {
              role: 'startspeaking'
            },
            {
              role: 'stopspeaking'
            }
          ]
        }
      )
    }

    if (process.argv[2] == '--dev') {
      const devtools = {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      };
      template[2].submenu.unshift(devtools);
    }
      
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

async function previewMenu(e) {
  mainWindow = this.window;
  const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
            click (item, focusedWindow) {
              mainWindow.webContents.send('mimir:new');
            }
          },
          {
            label: 'Open',
            accelerator: process.platform === 'darwin' ? 'Command+O' : 'Ctrl+O',
            click (item, focusedWindow) {
              mainWindow.webContents.send('mimir:open');
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Save',
            accelerator: process.platform === 'darwin' ? 'Command+S' : 'Ctrl+S',
            enabled: false
          },
          {
            label: 'Save As',
            accelerator: process.platform === 'darwin' ? 'Command+Shift+S' : 'Ctrl+Shift+S',
            enabled: false
          },
          {
            label: 'Import',
            click (item, focusedWindow) {
              mainWindow.webContents.send('mimir:import');
            }
          },
          {
            label: 'Export',
            click (item, focusedWindow) {
              mainWindow.webContents.send('mimir:export');
            }
          },
          {
            label: 'Print',
            accelerator: process.platform === 'darwin' ? 'Command+P' : 'Ctrl+P',
            click (item, focusedWindow) {
              mainWindow.webContents.send('mimir:print');
            }
          },
          {
            role: 'close'
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: process.platform === 'darwin' ? 'Command+Z' : 'Ctrl+Z',
            enabled: false
          },
          {
            label: 'Redo',
            accelerator: process.platform === 'darwin' ? 'Command+Y' : 'Ctrl+Y',
            enabled: false
          },
          {
            type: 'separator'
          },
          {
            role: 'cut'
          },
          {
            role: 'copy'
          },
          {
            role: 'paste'
          },
          {
            role: 'pasteandmatchstyle'
          },
          {
            role: 'delete'
          },
          {
            role: 'selectall'
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Preview',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+P' : 'Ctrl+Shift+P',
            click (item, focusedWindow) {
              mainWindow.webContents.send('mimir:preview');
            }
          },
          {
            label: 'Word Count',
            click (item, focusedWindow) {
              mainWindow.webContents.send('mimir:wordcount');
            }
          },
          {
            label: 'Home',
            click (item, focusedWindow) {
              mainWindow.webContents.send('mimir:goHome');
            }
          },
          {
            type: 'separator'
          },
          {
            role: 'resetzoom'
          },
          {
            role: 'zoomin'
          },
          {
            role: 'zoomout'
          },
          {
            type: 'separator'
          },
          {
            role: 'togglefullscreen'
          }
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'About',
            click () { about(); }
          },
          {
            label: 'Learn More',
            click () { learnMore(); }
          }
        ]
      }
  ]
    
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })
    // Edit menu.
    template[1].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Speech',
        submenu: [
          {
            role: 'startspeaking'
          },
          {
            role: 'stopspeaking'
          }
        ]
      }
    )
  }

  if (process.argv[2] == '--dev') {
    const devtools = {
      label: 'Toggle Developer Tools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click (item, focusedWindow) {
        if (focusedWindow) focusedWindow.webContents.toggleDevTools();
      }
    };
    template[2].submenu.unshift(devtools);
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function importFile(e, path) {
  return await fs.readFile(path);
}

async function exportFile(e, path, data) {
  return await fs.writeFile(path, data, {
    encoding: 'utf8',
    flag: 'w'
  });
}

async function exportPDF(e, path, html, options = { }) {
  if (!existsSync(wkHtmlToPdf)) {
    console.log("Could not find wkhtmltopdf binary. Searched at " + wkHtmlToPdf);
    dialog.showErrorBox("Could not find wkhtmltopdf binary. Try printing to PDF instead.", "");
    return null;
  }
  try {
    // Save the file.
    console.log("Generating arguments...");
    const tempHtml = join(app.getPath("temp"), "temp-pdf.html");
    await fs.writeFile(tempHtml, html, {
      encoding: 'utf8',
      flag: 'w'
    });
    const args = [];
    if (options["page-size"]) {
      args.push("--page-size", options["page-size"]);
    }
    args.push(tempHtml);
    if (options["zoom-factor"]) {
      args.push("--zoom", (options["zoom-factor"] / 100.0).toString());
    }
    if (options["default-header"]) {
      args.push("--default-header");
    }
    args.push(path);
    try {
      console.log("Executing wkhtmltopdf...");
      await new Promise((resolve, reject) => {
        const child = spawn(wkHtmlToPdf, args);
        var stdout = "";
        var stderr = "";
        child.stdout.on("data", (data) => {
          stdout += data.toString();
        });
        child.stderr.on("data", (data) => {
          stderr += data.toString();
        });
        child.on('close', () => {
          console.log(stderr);
          resolve();
        });
      });
    } catch (err) {
      await fs.unlink(tempHtml);
      return err;
    }
    await fs.unlink(tempHtml);
    return null;
  } catch (err) {
    return err;
  }
}

async function exportPlaintext(e, path, html, options = { }) {
  try {
    const htmlToTextOptions = { preserveNewlines: true, wordwrap: false };
    if (options['word-wrap'] && parseInt(options['wrap-width'])) {
      htmlToTextOptions.wordwrap = parseInt(options['wrap-width']);
    }
    const text = htmlToText.convert(html, htmlToTextOptions);
    await fs.writeFile(path, text, {
      encoding: 'utf8',
      flag: 'w'
    });
  } catch (err) {
    return err;
  }
}

function shellOpenExternal(e, url) {
  shell.openExternal(url);
}

function close() {
  app.exit(0);
}

function setTitle(e, title) {
  BrowserWindow.getAllWindows().forEach((w) => w.setTitle(title));
}

module.exports = {
    AppState: AppState,
    commands: {
        init,
        open,
        save,
        info,
        message,
        openDialog,
        saveDialog,
        getRecent,
        removeFromRecent,
        getFavorites,
        addToFavorites,
        removeFromFavorites,
        getSettings,
        setSettings,
        homeMenu,
        editMenu,
        previewMenu,
        importFile,
        exportFile,
        exportPDF,
        exportPlaintext,
        shellOpenExternal,
        close,
        setTitle
    }
}