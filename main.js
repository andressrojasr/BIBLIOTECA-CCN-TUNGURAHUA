const { app, BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain, dialog } = require('electron');
const fs = require('fs');
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
        `INSERT INTO books (id, titulo, autor, estanteria, fila, caja, ejemplares, prestados) VALUES (?,?, ?, ?, ?, ?, ?, ?)`,
        [libro.id, libro.titulo, libro.autor, libro.estanteria, libro.fila, libro.caja, libro.ejemplares, libro.prestados],
        (err) => {
          if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            resolve({ success: false, error: 'DUPLICATE_PRIMARY_KEY' });
          } else {
            resolve({ success: false, error: 'UNKNOWN_ERROR' });
          }
        } else {
          resolve({ success: true });
        }
        }
      )
  });
});

ipcMain.handle('getBook', async (event, offset, limit, filterField, filterValue) => {
  return new Promise((resolve, reject) => {
    // Lista de campos permitidos para evitar inyecciones
    const allowedFields = ['id', 'titulo', 'autor'];
    if (!allowedFields.includes(filterField)) {
      return reject(new Error('Campo de filtrado no permitido'));
    }

    let query = '';
    let params = [];

    // Construir la consulta según el tipo de filtro
    if (filterField === 'id') {
      query = `
        SELECT * FROM books
        WHERE id = ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;
      params = [filterValue, limit, offset]; // búsqueda exacta
    } else {
      query = `
        SELECT * FROM books
        WHERE ${filterField} LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;
      params = [`%${filterValue}%`, limit, offset]; // búsqueda parcial
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ success: true, books: rows });
      }
    });
  });
});

ipcMain.handle('getBooks', async (event, offset,limit) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM books ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset],
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
    // Primero verificar si hay préstamos para ese libro
    db.get(
      `SELECT COUNT(*) AS count FROM prestamos WHERE libroId = ?`,
      [bookId],
      (err, row) => {
        if (err) {
          return reject({ success: false, message: 'Error al verificar préstamos', error: err });
        }

        if (row.count > 0) {
          // No permitir eliminar
          return resolve({ success: false, message: 'No se puede eliminar el libro porque tiene préstamos registrados.' });
        }

        // Si no tiene préstamos, eliminar libro
        db.run(`DELETE FROM books WHERE id = ?`, [bookId], function (err) {
          if (err) {
            reject({ success: false, message: 'Error al eliminar el libro', error: err });
          } else {
            resolve({ success: true, message: 'Libro eliminado correctamente' });
          }
        });
      }
    );
  });
});


ipcMain.handle('getUsers', async (event, offset,limit) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM usuarios ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, users: rows });
        }
      }
    );
  });
});

ipcMain.handle('getUser', async (event, offset, limit, filterField, filterValue) => {
  return new Promise((resolve, reject) => {
    // Lista de campos permitidos para evitar inyecciones
    const allowedFields = ['id', 'cedula', 'apellidos', 'nombres'];
    if (!allowedFields.includes(filterField)) {
      return reject(new Error('Campo de filtrado no permitido'));
    }

    let query = '';
    let params = [];

    // Construir la consulta según el tipo de filtro
    if (filterField === 'id') {
      query = `
        SELECT * FROM usuarios
        WHERE id = ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;
      params = [filterValue, limit, offset]; // búsqueda exacta
    } else {
      query = `
        SELECT * FROM usuarios
        WHERE ${filterField} LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;
      params = [`%${filterValue}%`, limit, offset]; // búsqueda parcial
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ success: true, users: rows });
      }
    });
  });
});


ipcMain.handle('insertUser', async (event, usuario) => {
  return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO usuarios (nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [usuario.nombres, usuario.apellidos, usuario.cedula, usuario.profesion, usuario.lugarTrabajo, usuario.tipoUsuario, usuario.edad, usuario.direccion, usuario.canton, usuario.celular, usuario.correo],
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

ipcMain.handle('updateUser', async (event, user) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE usuarios
      SET nombres = ?, apellidos = ?, cedula = ?, profesion = ?, lugarTrabajo = ?, tipoUsuario = ?, edad = ?, direccion = ?, canton = ?, celular = ?, correo = ?
      WHERE id = ?
    `;
    const values = [
      user.nombres,
      user.apellidos,
      user.cedula,
      user.profesion,
      user.lugarTrabajo,
      user.tipoUsuario,
      user.edad,
      user.direccion,
      user.canton,
      user.celular,
      user.correo,
      user.id
    ];

    db.run(query, values, function (err) {
      if (err) {
        reject({ success: false, message: 'Error al actualizar el usuario', error: err });
      } else {
        resolve({ success: true, message: 'Usuario actualizado correctamente' });
      }
    });
  });
});

ipcMain.handle('deleteUser', async (event, userId) => {
  return new Promise((resolve, reject) => {
    // Primero verificar si hay préstamos para ese usuario
    db.get(
      `SELECT COUNT(*) AS count FROM prestamos WHERE usuarioId = ?`,
      [userId],
      (err, row) => {
        if (err) {
          return reject({ success: false, message: 'Error al verificar préstamos', error: err });
        }

        if (row.count > 0) {
          // No permitir eliminar
          return resolve({ success: false, message: 'No se puede eliminar el usuario porque tiene préstamos registrados.' });
        }

        // Si no tiene préstamos, eliminar usuario
        db.run(`DELETE FROM usuarios WHERE id = ?`, [userId], function (err) {
          if (err) {
            reject({ success: false, message: 'Error al eliminar usuario', error: err });
          } else {
            resolve({ success: true, message: 'Usuario eliminado correctamente' });
          }
        });
      }
    );
  });
});


ipcMain.handle('getPrestamos', async (event, offset, limit) => {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT p.id as prestamoId, p.fechaPrestamo, p.fechaDevolucion,
             u.*, u.id as usuarioId, b.*, b.id as libroId
      FROM prestamos p
      JOIN usuarios u ON p.usuarioId = u.id
      JOIN books b ON p.libroId = b.id
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset],
      (err, rows) => {
        if (err) {
          return reject(err);
        }

        const prestamos = rows.map(row => ({
          id: row.prestamoId,
          fechaPrestamo: row.fechaPrestamo,
          fechaDevolucion: row.fechaDevolucion,
          usuario: {
            id: row.usuarioId, // depende del aliasing de sqlite
            nombres: row.nombres,
            apellidos: row.apellidos,
            cedula: row.cedula,
            profesion: row.profesion,
            lugarTrabajo: row.lugarTrabajo,
            tipoUsuario: row.tipoUsuario,
            edad: row.edad,
            direccion: row.direccion,
            canton: row.canton,
            celular: row.celular,
            correo: row.correo,
          },
          libro: {
            id: row.libroId, // idem arriba
            titulo: row.titulo,
            autor: row.autor,
            estanteria: row.estanteria,
            fila: row.fila,
            caja: row.caja,
            ejemplares: row.ejemplares,
            prestados: row.prestados
          }
        }));

        resolve({ success: true, prestamos });
      }
    );
  });
});

ipcMain.handle('getPrestamo', async (event, offset, limit, filterColumn, searchTerm) => {
  return new Promise((resolve, reject) => {
    // Mapear filtro de frontend a columna de la consulta
    let column;
    switch (filterColumn) {
      case 'id':
        column = 'p.id';
        break;
      case 'cedula':
        column = 'u.cedula';
        break;
      case 'nombres':
        column = 'u.nombres';
        break;
      case 'apellidos':
        column = 'u.apellidos';
        break;
      case 'libro':
        column = 'b.titulo';
        break;
      default:
        column = 'p.id';
    }

    const sql = `
      SELECT p.id as prestamoId, p.fechaPrestamo, p.fechaDevolucion,
             u.*, u.id as usuarioId, b.*, b.id as libroId
      FROM prestamos p
      JOIN usuarios u ON p.usuarioId = u.id
      JOIN books b ON p.libroId = b.id
      WHERE ${column} LIKE ?
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?`;

    db.all(sql, [`%${searchTerm}%`, limit, offset], (err, rows) => {
      if (err) {
        return reject(err);
      }

      const prestamos = rows.map(row => ({
        id: row.prestamoId,
        fechaPrestamo: row.fechaPrestamo,
        fechaDevolucion: row.fechaDevolucion,
        usuario: {
          id: row.usuarioId,
          nombres: row.nombres,
          apellidos: row.apellidos,
          cedula: row.cedula,
          profesion: row.profesion,
          lugarTrabajo: row.lugarTrabajo,
          tipoUsuario: row.tipoUsuario,
          edad: row.edad,
          direccion: row.direccion,
          canton: row.canton,
          celular: row.celular,
          correo: row.correo,
        },
        libro: {
          id: row.libroId,
          titulo: row.titulo,
          autor: row.autor,
          estanteria: row.estanteria,
          fila: row.fila,
          caja: row.caja,
          ejemplares: row.ejemplares,
          prestados: row.prestados,
        },
      }));

      resolve({ success: true, prestamos });
    });
  });
});


ipcMain.handle('insertPrestamo', async (event, prestamo) => {
  return new Promise((resolve, reject) => {
    const { usuarioId, libroId, fechaPrestamo } = prestamo;

    const query = `
      INSERT INTO prestamos (usuarioId, libroId, fechaPrestamo)
      VALUES (?, ?, ?)
    `;

    db.run(query, [usuarioId, libroId, fechaPrestamo], function (err) {
      if (err) {
        console.error('❌ Error al insertar préstamo:', err.message);
        resolve({ success: false });
      } else {
        resolve({ success: true, id: this.lastID });
      }
    });
  });
});

ipcMain.handle('updatePrestamo', async (event, fechaDevolucion, id) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE prestamos
      SET fechaDevolucion = ?
      WHERE id = ?
    `;

    db.run(query, [fechaDevolucion, id], function (err) {
      if (err) {
        reject({ success: false, message: 'Error al finalizar el préstamo', error: err });
      } else {
        resolve({ success: true, message: 'Préstamo finalizado correctamente' });
      }
    });
  });
});

ipcMain.handle('deletePrestamo', async (event, prestamoId) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM prestamos WHERE id = ?`, [prestamoId], function (err) {
      if (err) {
        reject({ success: false, message: 'Error al eliminar prestamo', error: err });
      } else {
        resolve({ success: true, message: 'Préstamo eliminado correctamente' });
      }
    });
  });
});

ipcMain.handle('changePassword', async (event, passwordActual, passwordNueva ) => {
  return new Promise((resolve, reject) => {
    // Paso 1: Verificar contraseña actual
    const querySelect = `SELECT password FROM users WHERE username = 'admin'`;
    db.get(querySelect, (err, row) => {
      if (err) {
        return reject({ success: false, message: 'Error al buscar usuario', error: err });
      }
      if (!row) {
        return resolve({ success: false, message: 'Usuario no encontrado' });
      }
      if (row.password !== passwordActual) {
        return resolve({ success: false, message: 'Contraseña actual incorrecta' });
      }

      // Paso 2: Actualizar contraseña
      const queryUpdate = `UPDATE users SET password = ? WHERE username = 'admin'`;
      db.run(queryUpdate, [passwordNueva], function (err) {
        if (err) {
          return reject({ success: false, message: 'Error al actualizar contraseña', error: err });
        }
        resolve({ success: true, message: 'Contraseña cambiada correctamente' });
      });
    });
  });
});

const dbPath = path.join(__dirname, 'data', 'app.db');

ipcMain.handle('exportDatabase', async (event) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Guardar copia de seguridad',
    filters: [{ name: 'Base de datos SQLite', extensions: ['db'] }]
  });
  if (canceled || !filePath) {
    return { success: false, message: 'Guardado cancelado' };
  }
  fs.copyFileSync(dbPath, filePath);
  return { success: true, message: 'Base de datos exportada correctamente' };
});

ipcMain.handle('importDatabase', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Selecciona la base de datos para importar',
    filters: [{ name: 'Base de datos SQLite', extensions: ['db'] }],
    properties: ['openFile']
  });
  if (canceled || !filePaths.length) {
    return { success: false, message: 'Importación cancelada' };
  }
  fs.copyFileSync(filePaths[0], dbPath);
  return { success: true, message: 'Base de datos importada correctamente' };
});