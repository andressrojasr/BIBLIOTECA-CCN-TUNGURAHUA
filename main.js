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

ipcMain.handle('insertBook', async (event, libro) => {
  return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO books (titulo, autor, estanteria, fila, caja, ejemplares, prestados) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [libro.titulo, libro.autor, libro.estanteria, libro.fila, libro.caja, libro.ejemplares, libro.prestados],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true });
          }
        }
      )
  });
});

ipcMain.handle('getBooks', async (event) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM books ORDER BY id DESC',
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, books: rows });
        }
      }
    );
  });
});

ipcMain.handle('updateBook', async (event, book) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE books
      SET titulo = ?, autor = ?, estanteria = ?, fila = ?, caja = ?, ejemplares = ?, prestados = ?
      WHERE id = ?
    `;
    const values = [
      book.titulo,
      book.autor,
      book.estanteria,
      book.fila,
      book.caja,
      book.ejemplares,
      book.prestados,
      book.id
    ];

    db.run(query, values, function (err) {
      if (err) {
        reject({ success: false, message: 'Error al actualizar el libro', error: err });
      } else {
        resolve({ success: true, message: 'Libro actualizado correctamente' });
      }
    });
  });
});

ipcMain.handle('deleteBook', async (event, bookId) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM books WHERE id = ?`, [bookId], function (err) {
      if (err) {
        reject({ success: false, message: 'Error al eliminar el libro', error: err });
      } else {
        resolve({ success: true, message: 'Libro eliminado correctamente' });
      }
    });
  });
});