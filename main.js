const { app, BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');
const db = require('./db');
require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 1280,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:4200');
  }
  else{
    win.loadFile(path.join(__dirname, 'www/index.html'));
  }
  win.webContents.openDevTools();
}



app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle('login', async (event, username, password) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? { success: true, user: row } : { success: false });
        }
      }
    );
  });
});