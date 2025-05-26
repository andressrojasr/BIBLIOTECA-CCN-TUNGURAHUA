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
      nodeIntegration: false, // ¡IMPORTANTE! debe ser false para contextIsolation
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

ipcMain.handle('login', async (event, username, password) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? { success: true, user: row } : { success: false, message: 'Credenciales incorrectas' });
        }
      }
    );
  });
});

// Handler para obtener todos los libros
ipcMain.handle('getBooks', async () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM books`, (err, rows) => {
      if (err) {
        reject({ success: false, message: 'Error al obtener libros', error: err });
      } else {
        resolve({ success: true, data: rows });
      }
    });
  });
});

// Handler para obtener todos los usuarios (no los de login, sino los de la tabla 'usuarios')
ipcMain.handle('getUsers', async () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM usuarios`, (err, rows) => { // Asegúrate de que la tabla se llama 'usuarios'
      if (err) {
        reject({ success: false, message: 'Error al obtener usuarios', error: err });
      } else {
        resolve({ success: true, data: rows });
      }
    });
  });
});

// Handler para insertar un nuevo usuario
ipcMain.handle('insertUser', async (event, user) => {
  return new Promise((resolve, reject) => {
    const { nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo } = user;
    db.run(
      `INSERT INTO usuarios (nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo],
      function (err) {
        if (err) {
          reject({ success: false, message: 'Error al insertar usuario', error: err });
        } else {
          resolve({ success: true, id: this.lastID });
        }
      }
    );
  });
});

// Handler para actualizar un usuario
ipcMain.handle('updateUser', async (event, user) => {
  return new Promise((resolve, reject) => {
    const { id, nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo } = user;
    db.run(
      `UPDATE usuarios SET nombres = ?, apellidos = ?, cedula = ?, profesion = ?, lugarTrabajo = ?, tipoUsuario = ?, edad = ?, direccion = ?, canton = ?, celular = ?, correo = ? WHERE id = ?`,
      [nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo, id],
      function (err) {
        if (err) {
          reject({ success: false, message: 'Error al actualizar usuario', error: err });
        } else {
          resolve({ success: true, changes: this.changes });
        }
      }
    );
  });
});

// Handler para eliminar un usuario
ipcMain.handle('deleteUser', async (event, userId) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM usuarios WHERE id = ?`, [userId], function (err) {
      if (err) {
        reject({ success: false, message: 'Error al eliminar usuario', error: err });
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
});

// Handler para insertar un préstamo
ipcMain.handle('insertPrestamo', async (event, { usuarioId, libroIds, fechaPrestamo }) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => { // Usamos serialize para asegurar que las operaciones se ejecuten en orden
      db.run('BEGIN TRANSACTION'); // Iniciar transacción

      // 1. Insertar el préstamo principal
      db.run(
        `INSERT INTO prestamos (usuarioId, fechaPrestamo, completado) VALUES (?, ?, ?)`,
        [usuarioId, fechaPrestamo, 0], // 0 = no completado
        function (err) {
          if (err) {
            db.run('ROLLBACK'); // Revertir transacción si hay error
            reject({ success: false, message: 'Error al insertar préstamo principal', error: err });
            return;
          }
          const prestamoId = this.lastID;

          // 2. Insertar los libros asociados al préstamo en prestamos_libros y actualizar 'prestados' en 'books'
          const promises = libroIds.map(libroId => {
            return new Promise((res, rej) => {
              db.run(
                `INSERT INTO prestamos_libros (prestamoId, libroId) VALUES (?, ?)`,
                [prestamoId, libroId],
                (errInsert) => {
                  if (errInsert) {
                    rej({ success: false, message: `Error al asociar libro ${libroId} al préstamo`, error: errInsert });
                    return;
                  }
                  // Actualizar la cantidad de libros prestados
                  db.run(
                    `UPDATE books SET prestados = prestados + 1 WHERE id = ?`,
                    [libroId],
                    (errUpdate) => {
                      if (errUpdate) {
                        rej({ success: false, message: `Error al actualizar prestados para libro ${libroId}`, error: errUpdate });
                      } else {
                        res(true);
                      }
                    }
                  );
                }
              );
            });
          });

          Promise.all(promises)
            .then(() => {
              db.run('COMMIT', (errCommit) => { // Confirmar transacción
                if (errCommit) {
                  reject({ success: false, message: 'Error al confirmar transacción', error: errCommit });
                } else {
                  resolve({ success: true, prestamoId: prestamoId, message: 'Préstamo registrado con éxito' });
                }
              });
            })
            .catch(error => {
              db.run('ROLLBACK'); // Revertir si alguna operación falla
              reject(error);
            });
        }
      );
    });
  });
});

// Handler para obtener los préstamos existentes (para la tabla principal)
ipcMain.handle('getPrestamos', async (event) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        p.id AS prestamoId,
        p.fechaPrestamo,
        p.completado,
        u.id AS usuarioId,
        u.nombres AS usuarioNombres,
        u.apellidos AS usuarioApellidos,
        GROUP_CONCAT(b.id || '::' || b.titulo || '::' || b.codigo) AS librosDetalle
      FROM prestamos p
      JOIN usuarios u ON p.usuarioId = u.id
      JOIN prestamos_libros pl ON p.id = pl.prestamoId
      JOIN books b ON pl.libroId = b.id
      GROUP BY p.id, u.id
      ORDER BY p.fechaPrestamo DESC;
    `;
    db.all(query, (err, rows) => {
      if (err) {
        reject({ success: false, message: 'Error al obtener préstamos', error: err });
      } else {
        // Formatear los resultados para que los libros sean un array de objetos
        const prestamos = rows.map(row => {
          const libros = row.librosDetalle ? row.librosDetalle.split(',').map(item => {
            const parts = item.split('::');
            return { id: parseInt(parts[0]), titulo: parts[1], codigo: parts[2] };
          }) : [];
          return {
            id: row.prestamoId,
            usuarioId: row.usuarioId,
            usuarioNombre: row.usuarioNombres,
            usuarioApellido: row.usuarioApellidos,
            fechaPrestamo: row.fechaPrestamo,
            completado: row.completado,
            libros: libros
          };
        });
        resolve({ success: true, data: prestamos });
      }
    });
  });
});

// Handler para devolver libros
ipcMain.handle('devolverLibros', async (event, { prestamoId, libroIds }) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      let completedBooks = 0;
      const totalBooksInPrestamo = libroIds.length;

      // Actualizar el contador 'prestados' de los libros
      const updatePromises = libroIds.map(libroId => {
        return new Promise((res, rej) => {
          db.run(
            `UPDATE books SET prestados = prestados - 1 WHERE id = ?`,
            [libroId],
            (err) => {
              if (err) {
                rej({ success: false, message: `Error al actualizar libros devueltos para el libro ${libroId}`, error: err });
              } else {
                res(true);
              }
            }
          );
        });
      });

      // Insertar en historial_devoluciones y eliminar de prestamos_libros
      const historyPromises = libroIds.map(libroId => {
        return new Promise((res, rej) => {
          const fechaDevolucion = new Date().toISOString().split('T')[0]; // Fecha actual
          db.run(
            `INSERT INTO historial_devoluciones (prestamoId, libroId, fechaDevolucion) VALUES (?, ?, ?)`,
            [prestamoId, libroId, fechaDevolucion],
            (errInsert) => {
              if (errInsert) {
                rej({ success: false, message: `Error al insertar en historial de devoluciones para libro ${libroId}`, error: errInsert });
                return;
              }
              db.run(
                `DELETE FROM prestamos_libros WHERE prestamoId = ? AND libroId = ?`,
                [prestamoId, libroId],
                (errDelete) => {
                  if (errDelete) {
                    rej({ success: false, message: `Error al eliminar de prestamos_libros para libro ${libroId}`, error: errDelete });
                  } else {
                    res(true);
                  }
                }
              );
            }
          );
        });
      });

      Promise.all([...updatePromises, ...historyPromises])
        .then(() => {
          // Verificar si quedan libros asociados a este préstamo
          db.get(`SELECT COUNT(*) AS count FROM prestamos_libros WHERE prestamoId = ?`, [prestamoId], (err, row) => {
            if (err) {
              db.run('ROLLBACK');
              reject({ success: false, message: 'Error al verificar libros restantes en préstamo', error: err });
              return;
            }
            if (row.count === 0) {
              // Si no quedan libros, marcar el préstamo como completado
              db.run(`UPDATE prestamos SET completado = 1 WHERE id = ?`, [prestamoId], (errUpdate) => {
                if (errUpdate) {
                  db.run('ROLLBACK');
                  reject({ success: false, message: 'Error al marcar préstamo como completado', error: errUpdate });
                  return;
                }
                db.run('COMMIT', (errCommit) => {
                  if (errCommit) {
                    reject({ success: false, message: 'Error al confirmar transacción de devolución completa', error: errCommit });
                    return;
                  }
                  resolve({ success: true, message: 'Devolución(es) registrada(s) y préstamo completado' });
                });
              });
            } else {
              db.run('COMMIT', (errCommit) => {
                if (errCommit) {
                  reject({ success: false, message: 'Error al confirmar transacción de devolución parcial', error: errCommit });
                  return;
                }
                resolve({ success: true, message: 'Libro(s) devuelto(s) exitosamente' });
              });
            }
          });
        })
        .catch(error => {
          db.run('ROLLBACK');
          reject(error);
        });
    });
  });
});


ipcMain.handle('getHistorialDevoluciones', async (event) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        hd.fechaDevolucion,
        b.titulo AS tituloLibro,
        b.codigo AS codigoLibro,
        u.nombres AS usuarioNombres,
        u.apellidos AS usuarioApellidos
      FROM historial_devoluciones hd
      JOIN prestamos p ON hd.prestamoId = p.id
      JOIN books b ON hd.libroId = b.id
      JOIN usuarios u ON p.usuarioId = u.id
      ORDER BY hd.fechaDevolucion DESC;
    `;
    db.all(query, (err, rows) => {
      if (err) {
        reject({ success: false, message: 'Error al obtener historial de devoluciones', error: err });
      } else {
        resolve({ success: true, data: rows });
      }
    });
  });
});


// Handler para eliminar un libro
ipcMain.handle('deleteBook', async (event, bookId) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM books WHERE id = ?`, [bookId], function (err) {
      if (err) {
        reject({ success: false, message: 'Error al eliminar libro', error: err });
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
});

// Handler para insertar un libro
ipcMain.handle('insertBook', async (event, book) => {
  return new Promise((resolve, reject) => {
    const { codigo, titulo, autor, estanteria, fila, caja, ejemplares } = book;
    db.run(
      `INSERT INTO books (codigo, titulo, autor, estanteria, fila, caja, ejemplares, prestados) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [codigo, titulo, autor, estanteria, fila, caja, ejemplares],
      function (err) {
        if (err) {
          reject({ success: false, message: 'Error al insertar libro', error: err });
        } else {
          resolve({ success: true, id: this.lastID });
        }
      }
    );
  });
});

// Handler para actualizar un libro
ipcMain.handle('updateBook', async (event, book) => {
  return new Promise((resolve, reject) => {
    const { id, codigo, titulo, autor, estanteria, fila, caja, ejemplares } = book;
    db.run(
      `UPDATE books SET codigo = ?, titulo = ?, autor = ?, estanteria = ?, fila = ?, caja = ?, ejemplares = ? WHERE id = ?`,
      [codigo, titulo, autor, estanteria, fila, caja, ejemplares, id],
      function (err) {
        if (err) {
          reject({ success: false, message: 'Error al actualizar libro', error: err });
        } else {
          resolve({ success: true, changes: this.changes });
        }
      }
    );
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});