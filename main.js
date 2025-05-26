// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');
const db = require('./db'); // Asegúrate de que esta ruta sea correcta
require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 1280,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
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

// ======================= HANDLERS IPCMAIN =======================

// Handler para login (usuarios de la tabla 'users' para la aplicación)
ipcMain.handle('login', async (event, username, password) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, row) => {
        if (err) {
          console.error('Error en login (Electron):', err);
          resolve({ success: false, message: err.message || 'Error en la base de datos' });
        } else if (row) {
          resolve({ success: true, message: 'Login exitoso' });
        } else {
          resolve({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
      }
    );
  });
});

// Handler para obtener todos los usuarios (tabla 'usuarios')
ipcMain.handle('getUsuarios', async (event) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM usuarios ORDER BY nombres ASC`, (err, rows) => {
      if (err) {
        console.error('Error en getUsuarios (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al obtener usuarios' });
      } else {
        resolve({ success: true, users: rows });
      }
    });
  });
});

// Handler para eliminar un usuario (tabla 'usuarios')
ipcMain.handle('deleteUsuario', async (event, userId) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM usuarios WHERE id = ?`, userId, function(err) {
      if (err) {
        console.error('Error en deleteUsuario (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al eliminar usuario', error: err.message });
      } else {
        if (this.changes > 0) {
          console.log(`Usuario con ID ${userId} eliminado.`);
          resolve({ success: true, message: 'Usuario eliminado con éxito' });
        } else {
          console.warn(`No se encontró usuario con ID ${userId} para eliminar.`);
          resolve({ success: false, message: 'No se encontró el usuario para eliminar' });
        }
      }
    });
  });
});

// Handler para obtener todos los libros
ipcMain.handle('getBooks', async (event) => {
  return new Promise((resolve) => {
    db.all(`SELECT * FROM books ORDER BY titulo ASC`, [], (err, rows) => {
      if (err) {
        console.error('Error en getBooks (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al obtener libros' });
      } else {
        resolve({ success: true, data: rows });
      }
    });
  });
});

// Handler para insertar un nuevo libro
ipcMain.handle('insertBook', async (event, book) => {
  return new Promise((resolve) => {
    const { codigo, titulo, autor, estanteria, fila, caja, ejemplares } = book;
    db.run(
      `INSERT INTO books (codigo, titulo, autor, estanteria, fila, caja, ejemplares, prestados) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [codigo, titulo, autor, estanteria, fila, caja, ejemplares],
      function (err) {
        if (err) {
          console.error('Error en insertBook (Electron):', err);
          resolve({ success: false, message: err.message || 'Error al insertar libro' });
        } else {
          resolve({ success: true, id: this.lastID });
        }
      }
    );
  });
});

// Handler para actualizar un libro existente
ipcMain.handle('updateBook', async (event, book) => {
  return new Promise((resolve) => {
    const { id, codigo, titulo, autor, estanteria, fila, caja, ejemplares, prestados } = book;
    db.run(
      `UPDATE books SET codigo = ?, titulo = ?, autor = ?, estanteria = ?, fila = ?, caja = ?, ejemplares = ?, prestados = ? WHERE id = ?`,
      [codigo, titulo, autor, estanteria, fila, caja, ejemplares, prestados, id],
      function (err) {
        if (err) {
          console.error('Error en updateBook (Electron):', err);
          resolve({ success: false, message: err.message || 'Error al actualizar libro' });
        } else {
          resolve({ success: true, changes: this.changes });
        }
      }
    );
  });
});

// Handler para eliminar un libro
ipcMain.handle('deleteBook', async (event, id) => {
  return new Promise((resolve) => {
    db.run(`DELETE FROM books WHERE id = ?`, [id], function (err) {
      if (err) {
        console.error('Error en deleteBook (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al eliminar libro' });
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
});


// Handler para obtener todos los préstamos activos
ipcMain.handle('getPrestamos', async (event) => {
  return new Promise((resolve) => {
    const query = `
      SELECT
        p.id AS prestamoId,
        p.fechaPrestamo,
        p.userId,
        u.nombres AS usuarioNombres,
        u.apellidos AS usuarioApellidos,
        p.librosJson
      FROM prestamos p
      JOIN usuarios u ON p.userId = u.id
      WHERE p.fechaDevolucion IS NULL -- Solo préstamos activos
      ORDER BY p.fechaPrestamo DESC
    `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error en getPrestamos (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al obtener préstamos' });
      } else {
        const prestamos = rows.map(row => {
          let librosParsed = [];
          try {
            librosParsed = row.librosJson ? JSON.parse(row.librosJson) : [];
          } catch (parseError) {
            console.error('Error al parsear librosJson en préstamo:', parseError);
            librosParsed = [];
          }
          return {
            id: row.prestamoId,
            fechaPrestamo: row.fechaPrestamo,
            userId: row.userId,
            usuarioNombre: row.usuarioNombres,
            usuarioApellido: row.usuarioApellidos,
            libros: librosParsed
          };
        });
        resolve({ success: true, prestamos: prestamos });
      }
    });
  });
});

// Handler para insertar un nuevo préstamo
ipcMain.handle('insertPrestamo', async (event, prestamoData) => {
  return new Promise((resolve) => {
    const { userId, fechaPrestamo, libros } = prestamoData;
    const librosJson = JSON.stringify(libros);

    db.run(`INSERT INTO prestamos (userId, fechaPrestamo, librosJson) VALUES (?, ?, ?)`,
      [userId, fechaPrestamo, librosJson],
      function(err) {
        if (err) {
          console.error('Error al insertar préstamo:', err);
          resolve({ success: false, message: err.message || 'Error al registrar el préstamo', error: err.message });
        } else {
          const prestamoId = this.lastID;
          // Actualizar la cantidad de libros prestados
          const updatePromises = libros.map(libro => {
            return new Promise((resolveUpdate) => {
              db.run(`UPDATE books SET prestados = prestados + 1 WHERE id = ?`, libro.id, function(errUpdate) {
                if (errUpdate) {
                  console.error(`Error al actualizar prestados para libro ${libro.id}:`, errUpdate);
                  resolveUpdate({ success: false, message: `Error al actualizar libro ${libro.codigo}` });
                } else {
                  resolveUpdate({ success: true });
                }
              });
            });
          });

          Promise.all(updatePromises).then(() => {
            console.log(`✅ Préstamo insertado con ID: ${prestamoId}`);
            resolve({ success: true, message: 'Préstamo registrado con éxito', prestamoId: prestamoId });
          }).catch(error => {
            console.error('Error en promesas de actualización de libros:', error);
            resolve({ success: false, message: 'Préstamo registrado, pero hubo un error al actualizar libros.' });
          });
        }
      }
    );
  });
});

// Handler para registrar la devolución de libros y actualizar el estado
ipcMain.handle('devolverLibros', async (event, data) => {
  return new Promise((resolve) => {
    const { prestamoId, fechaDevolucion, librosDevueltos } = data;

    db.serialize(() => {
      db.run('BEGIN TRANSACTION;');

      // 1. Actualizar la fecha de devolución en la tabla 'prestamos'
      const updatePrestamoQuery = `UPDATE prestamos SET fechaDevolucion = ? WHERE id = ?`;
      db.run(updatePrestamoQuery, [fechaDevolucion, prestamoId], function(err) {
        if (err) {
          console.error('Error al actualizar fechaDevolucion:', err);
          db.run('ROLLBACK;');
          return resolve({ success: false, message: err.message || 'Error al registrar la devolución del préstamo.' });
        }
        console.log(`Fecha de devolución actualizada para préstamo ID: ${prestamoId}`);

        // 2. Decrementar la cantidad de libros 'prestados' en la tabla 'books'
        let allUpdatesSuccessful = true;
        librosDevueltos.forEach(libro => {
          db.run(`UPDATE books SET prestados = prestados - 1 WHERE id = ?`, libro.id, function(errUpdate) {
            if (errUpdate) {
              console.error(`Error al decrementar 'prestados' para libro ID ${libro.id}:`, errUpdate);
              allUpdatesSuccessful = false;
            } else {
              console.log(`'prestados' decremented for book ID: ${libro.id}`);
            }
          });
        });

        if (allUpdatesSuccessful) {
          db.run('COMMIT;');
          resolve({ success: true, message: 'Libros devueltos y préstamo cerrado con éxito.' });
        } else {
          db.run('ROLLBACK;');
          resolve({ success: false, message: 'Error parcial al actualizar la cantidad de libros prestados.' });
        }
      });
    });
  });
});

ipcMain.handle('deletePrestamo', async (event, prestamoId) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get('SELECT librosJson FROM prestamos WHERE id = ?', [prestamoId], (err, row) => {
        if (err) {
          console.error('Error al obtener librosJson del préstamo para eliminar:', err);
          return resolve({ success: false, message: err.message || 'Error al obtener datos del préstamo' });
        }
        if (!row) {
          return resolve({ success: false, message: 'Préstamo no encontrado' });
        }

        const librosPrestados = JSON.parse(row.librosJson || '[]');

        // Iniciar transacción
        db.run('BEGIN TRANSACTION;', (err) => {
          if (err) {
            console.error('Error al iniciar transacción para eliminar préstamo:', err);
            return resolve({ success: false, message: 'Error de transacción' });
          }

          let updatePromises = [];
          for (const libro of librosPrestados) {
            updatePromises.push(new Promise((res, rej) => {
              db.run(
                'UPDATE books SET prestados = prestados - 1 WHERE id = ?',
                [libro.id],
                function (updateErr) {
                  if (updateErr) {
                    console.error('Error al decrementar prestados del libro:', updateErr);
                    rej(updateErr);
                  } else {
                    res();
                  }
                }
              );
            }));
          }

          Promise.all(updatePromises)
            .then(() => {
              db.run('DELETE FROM prestamos WHERE id = ?', [prestamoId], function (deleteErr) {
                if (deleteErr) {
                  console.error('Error al eliminar préstamo:', deleteErr);
                  db.run('ROLLBACK;', () => {
                    resolve({ success: false, message: deleteErr.message || 'Error al eliminar préstamo' });
                  });
                } else {
                  db.run('COMMIT;', () => {
                    resolve({ success: true, message: 'Préstamo eliminado exitosamente' });
                  });
                }
              });
            })
            .catch((rollbackErr) => {
              db.run('ROLLBACK;', () => {
                resolve({ success: false, message: rollbackErr.message || 'Error al actualizar libros y eliminar préstamo' });
              });
            });
        });
      });
    });
  });
});

// Handler para obtener el historial de devoluciones
ipcMain.handle('getHistorialDevoluciones', async (event) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        p.id AS prestamoId,
        p.fechaPrestamo,
        p.fechaDevolucion,
        u.id AS usuarioId,
        u.nombres AS usuarioNombres,
        u.apellidos AS usuarioApellidos,
        p.librosJson
      FROM prestamos p
      JOIN usuarios u ON p.userId = u.id
      WHERE p.fechaDevolucion IS NOT NULL
      ORDER BY p.fechaDevolucion DESC
    `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error en getHistorialDevoluciones (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al obtener historial de devoluciones' });
      } else {
        const historial = rows.map(row => {
          let librosParsed = [];
          try {
            librosParsed = row.librosJson ? JSON.parse(row.librosJson) : [];
          } catch (parseError) {
            console.error('Error al parsear librosJson en historial:', parseError);
            librosParsed = [];
          }
          return {
            id: row.prestamoId,
            fechaPrestamo: row.fechaPrestamo,
            fechaDevolucion: row.fechaDevolucion,
            userId: row.usuarioId,
            usuarioNombre: row.usuarioNombres,
            usuarioApellido: row.usuarioApellidos,
            libros: librosParsed
          };
        });
        resolve({ success: true, historial: historial });
      }
    });
  });
});

// Handler para insertar un nuevo usuario (tabla 'usuarios')
ipcMain.handle('insertUsuario', async (event, userData) => {
  return new Promise((resolve) => {
    const {
      nombres, apellidos, cedula, profesion, lugarTrabajo,
      tipoUsuario, edad, direccion, canton, celular, correo
    } = userData;
    const query = `INSERT INTO usuarios (nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [
      nombres, apellidos, cedula, profesion, lugarTrabajo,
      tipoUsuario, edad, direccion, canton, celular, correo
    ], function(err) {
      if (err) {
        console.error('❌ Error al insertar usuario:', err);
        resolve({ success: false, message: err.message || 'Error al insertar usuario', error: err.message });
      } else {
        console.log(`✅ Usuario insertado con ID: ${this.lastID}`);
        resolve({ success: true, message: 'Usuario agregado con éxito', userId: this.lastID });
      }
    });
  });
});

// Handler para actualizar un usuario existente (tabla 'usuarios')
ipcMain.handle('updateUsuario', async (event, userData) => {
  return new Promise((resolve) => {
    const {
      id, nombres, apellidos, cedula, profesion, lugarTrabajo,
      tipoUsuario, edad, direccion, canton, celular, correo
    } = userData;
    const query = `UPDATE usuarios SET nombres = ?, apellidos = ?, cedula = ?, profesion = ?, lugarTrabajo = ?, tipoUsuario = ?, edad = ?, direccion = ?, canton = ?, celular = ?, correo = ? WHERE id = ?`;
    db.run(query, [
      nombres, apellidos, cedula, profesion, lugarTrabajo,
      tipoUsuario, edad, direccion, canton, celular, correo, id
    ], function(err) {
      if (err) {
        console.error('❌ Error al actualizar usuario:', err);
        resolve({ success: false, message: err.message || 'Error al actualizar usuario', error: err.message });
      } else {
        if (this.changes > 0) {
          console.log(`✅ Usuario con ID ${id} actualizado.`);
          resolve({ success: true, message: 'Usuario actualizado con éxito' });
        } else {
          console.warn(`⚠️ No se encontró usuario con ID ${id} para actualizar.`);
          resolve({ success: false, message: 'No se encontró el usuario para actualizar o no hubo cambios' });
        }
      }
    });
  });
});