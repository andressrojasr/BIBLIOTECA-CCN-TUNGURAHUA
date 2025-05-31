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
          resolve({ success: false, message: 'Error interno del servidor' });
        } else if (row) {
          resolve({ success: true, user: row });
        } else {
          resolve({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
      }
    );
  });
});

// Books Handlers
ipcMain.handle('insertBook', async (event, book) => {
  return new Promise((resolve, reject) => {
    const { codigo, titulo, autor, estanteria, fila, caja, ejemplares } = book;
    db.run(
      `INSERT INTO books (codigo, titulo, autor, estanteria, fila, caja, ejemplares, prestados) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [codigo, titulo, autor, estanteria, fila, caja, ejemplares],
      function (err) {
        if (err) {
          console.error('Error al insertar libro (Electron):', err);
          resolve({ success: false, message: err.message || 'Error al insertar libro' });
        } else {
          resolve({ success: true, id: this.lastID });
        }
      }
    );
  });
});

ipcMain.handle('getBooks', async () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM books`, [], (err, rows) => {
      if (err) {
        console.error('Error en getBooks (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al obtener libros' });
      } else {
        resolve({ success: true, books: rows });
      }
    });
  });
});

ipcMain.handle('updateBook', async (event, book) => {
  return new Promise((resolve, reject) => {
    const { id, codigo, titulo, autor, estanteria, fila, caja, ejemplares, prestados } = book;
    db.run(
      `UPDATE books SET codigo = ?, titulo = ?, autor = ?, estanteria = ?, fila = ?, caja = ?, ejemplares = ?, prestados = ? WHERE id = ?`,
      [codigo, titulo, autor, estanteria, fila, caja, ejemplares, prestados, id],
      function (err) {
        if (err) {
          console.error('Error al actualizar libro (Electron):', err);
          resolve({ success: false, message: err.message || 'Error al actualizar libro' });
        } else {
          resolve({ success: true, changes: this.changes });
        }
      }
    );
  });
});

ipcMain.handle('deleteBook', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM books WHERE id = ?`, [id], function (err) {
      if (err) {
        console.error('Error al eliminar libro (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al eliminar libro' });
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
});

// User (usuarios) Handlers
ipcMain.handle('getUsuarios', async () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM usuarios`, [], (err, rows) => {
      if (err) {
        console.error('Error en getUsuarios (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al obtener usuarios' });
      } else {
        resolve({ success: true, users: rows });
      }
    });
  });
});

ipcMain.handle('insertUsuario', async (event, user) => {
  return new Promise((resolve, reject) => {
    const { nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo } = user;
    db.run(
      `INSERT INTO usuarios (nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo],
      function (err) {
        if (err) {
          console.error('Error al insertar usuario (Electron):', err);
          // sqlite3.Error.SQLITE_CONSTRAINT para duplicados
          if (err.message.includes('UNIQUE constraint failed')) {
            resolve({ success: false, message: 'La cédula ya está registrada.' });
          } else {
            resolve({ success: false, message: err.message || 'Error al insertar usuario' });
          }
        } else {
          resolve({ success: true, id: this.lastID });
        }
      }
    );
  });
});

ipcMain.handle('updateUsuario', async (event, user) => {
  return new Promise((resolve, reject) => {
    const { id, nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo } = user;
    db.run(
      `UPDATE usuarios SET nombres = ?, apellidos = ?, cedula = ?, profesion = ?, lugarTrabajo = ?, tipoUsuario = ?, edad = ?, direccion = ?, canton = ?, celular = ?, correo = ? WHERE id = ?`,
      [nombres, apellidos, cedula, profesion, lugarTrabajo, tipoUsuario, edad, direccion, canton, celular, correo, id],
      function (err) {
        if (err) {
          console.error('Error al actualizar usuario (Electron):', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            resolve({ success: false, message: 'La cédula ya está registrada para otro usuario.' });
          } else {
            resolve({ success: false, message: err.message || 'Error al actualizar usuario' });
          }
        } else {
          resolve({ success: true, changes: this.changes });
        }
      }
    );
  });
});

ipcMain.handle('deleteUsuario', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM usuarios WHERE id = ?`, [id], function (err) {
      if (err) {
        console.error('Error al eliminar usuario (Electron):', err);
        resolve({ success: false, message: err.message || 'Error al eliminar usuario' });
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
});

// Préstamos y Devoluciones Handlers
ipcMain.handle('insertPrestamo', async (event, data) => {
  return new Promise(async (resolve, reject) => {
    const { userId, fechaPrestamo, libros } = data;

    // Iniciar transacción
    db.run('BEGIN TRANSACTION;', async function (err) {
      if (err) {
        console.error('Error al iniciar transacción:', err);
        return resolve({ success: false, message: 'Error al iniciar transacción.' });
      }

      try {
        // 1. Insertar el préstamo
        const insertPrestamoResult = await new Promise((res, rej) => {
          db.run(
            `INSERT INTO prestamos (userId, fechaPrestamo, librosJson) VALUES (?, ?, ?)`,
            [userId, fechaPrestamo, JSON.stringify(libros)],
            function (err) {
              if (err) {
                rej(err);
              } else {
                res({ success: true, id: this.lastID });
              }
            }
          );
        });

        // 2. Actualizar el contador 'prestados' para cada libro
        for (const libro of libros) {
          const updateBookResult = await new Promise((res, rej) => {
            db.run(
              `UPDATE books SET prestados = prestados + 1 WHERE id = ?`,
              [libro.id],
              function (err) {
                if (err) {
                  rej(err);
                } else {
                  res({ success: true, changes: this.changes });
                }
              }
            );
          });
        }

        // Si todo fue bien, confirmar transacción
        db.run('COMMIT;', function (err) {
          if (err) {
            console.error('Error al confirmar transacción:', err);
            db.run('ROLLBACK;'); // Rollback en caso de error de commit
            resolve({ success: false, message: 'Error al confirmar préstamo.' });
          } else {
            resolve({ success: true, prestamoId: insertPrestamoResult.id });
          }
        });

      } catch (error) {
        console.error('Error durante la transacción de préstamo:', error);
        db.run('ROLLBACK;'); // Rollback si hay cualquier error
        resolve({ success: false, message: error.message || 'Error al realizar el préstamo.' });
      }
    });
  });
});

// Reemplaza la función getPrestamos en main.js (líneas aproximadamente 201-245)
ipcMain.handle('getPrestamos', async () => {
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
      WHERE p.fechaDevolucion IS NULL
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
            console.error('Error al parsear librosJson:', parseError);
            librosParsed = [];
          }
          return {
            id: row.prestamoId,
            fechaPrestamo: row.fechaPrestamo,
            fechaDevolucion: row.fechaDevolucion,
            usuarioId: row.usuarioId, // ✅ CORREGIDO: era userId, ahora es usuarioId
            usuarioNombres: row.usuarioNombres,
            usuarioApellidos: row.usuarioApellidos,
            libros: librosParsed,
          };
        });
        console.log('✅ Préstamos mapeados:', prestamos.map(p => ({ id: p.id, usuarioId: p.usuarioId, libros: p.libros.length })));
        resolve({ success: true, prestamos: prestamos });
      }
    });
  });
});

ipcMain.handle('devolverLibrosParcial', async (event, data) => {
  return new Promise(async (resolve, reject) => {
    const { prestamoId, librosDevueltosIds, fechaDevolucion } = data;
    
    try {
      // 1. Obtener el préstamo actual
      const prestamo = await new Promise((res, rej) => {
        db.get('SELECT * FROM prestamos WHERE id = ?', [prestamoId], (err, row) => {
          if (err) rej(err);
          else res(row);
        });
      });

      if (!prestamo) {
        return resolve({ success: false, message: 'Préstamo no encontrado' });
      }

      // 2. Parsear libros actuales
      const librosActuales = JSON.parse(prestamo.librosJson);
      const librosRestantes = librosActuales.filter(libro => 
        !librosDevueltosIds.includes(libro.id)
      );

      // 3. Actualizar libros prestados
      await new Promise((res, rej) => {
        db.run(
          'UPDATE books SET prestados = prestados - 1 WHERE id IN (' + 
          librosDevueltosIds.map(() => '?').join(',') + ')',
          librosDevueltosIds,
          (err) => err ? rej(err) : res(true)
        );
      });

      // 4. Si quedan libros, actualizar el préstamo
      if (librosRestantes.length > 0) {
        await new Promise((res, rej) => {
          db.run(
            'UPDATE prestamos SET librosJson = ? WHERE id = ?',
            [JSON.stringify(librosRestantes), prestamoId],
            (err) => err ? rej(err) : res(true)
          );
        });
      } else {
        // Si no quedan libros, marcar como devuelto
        await new Promise((res, rej) => {
          db.run(
            'UPDATE prestamos SET fechaDevolucion = ?, librosJson = ? WHERE id = ?',
            [fechaDevolucion, JSON.stringify([]), prestamoId],
            (err) => err ? rej(err) : res(true)
          );
        });
      }

      resolve({ success: true, message: 'Devolución registrada' });
    } catch (error) {
      console.error('Error en devolución parcial:', error);
      resolve({ success: false, message: 'Error al procesar devolución' });
    }
  });
});

// Reemplaza la función getHistorialDevoluciones en main.js (líneas aproximadamente 320-365)
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
            usuarioId: row.usuarioId, // ✅ CORREGIDO: era userId, ahora es usuarioId
            usuarioNombres: row.usuarioNombres,
            usuarioApellidos: row.usuarioApellidos,
            libros: librosParsed,
          };
        });
        console.log('✅ Historial mapeado:', historial.map(h => ({ id: h.id, usuarioId: h.usuarioId, libros: h.libros.length })));
        resolve({ success: true, historial: historial });
      }
    });
  });
});

// NUEVO HANDLER: Verificar si se puede prestar un libro (Límite de 2 ejemplares)
ipcMain.handle('checkBookAvailabilityForPrestamo', async (event, bookId) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT ejemplares, prestados FROM books WHERE id = ?`, [bookId], (err, row) => {
      if (err) {
        console.error('Error al verificar disponibilidad del libro:', err);
        resolve({ success: false, message: 'Error al verificar disponibilidad del libro.' });
      } else if (row) {
        const MAX_PRESTAMOS_POR_LIBRO = 2; // Define tu límite máximo aquí para cualquier libro

        if (row.prestados < MAX_PRESTAMOS_POR_LIBRO) {
          resolve({ success: true, canLend: true, message: 'Libro disponible para préstamo.' });
        } else {
          resolve({ success: true, canLend: false, message: `Ya se han prestado ${MAX_PRESTAMOS_POR_LIBRO} ejemplares de este libro. No se puede prestar uno adicional.` });
        }

      } else {
        resolve({ success: false, message: 'Libro no encontrado.' });
      }
    });
  });
});


process.on('exit', () => {
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos:', err.message);
    } else {
      console.log('❌ Base de datos desconectada.');
    }
  });
});

// Handler mejorado para updatePrestamo en main.js
ipcMain.handle('updatePrestamo', async (event, data) => {
  return new Promise(async (resolve, reject) => {
    const { id, userId, fechaPrestamo, libros } = data;
    
    console.log('🔄 Actualizando préstamo ID:', id);
    console.log('📋 Nuevos datos:', { userId, fechaPrestamo, libros: libros.length });

    // Iniciar transacción para manejar la actualización de forma segura
    db.run('BEGIN TRANSACTION;', async function (err) {
      if (err) {
        console.error('❌ Error al iniciar transacción:', err);
        return resolve({ success: false, message: 'Error al iniciar transacción.' });
      }

      try {
        // 1. Obtener el préstamo actual para comparar los libros
        const prestamoActual = await new Promise((res, rej) => {
          db.get('SELECT librosJson FROM prestamos WHERE id = ?', [id], (err, row) => {
            if (err) rej(err);
            else res(row);
          });
        });

        if (!prestamoActual) {
          db.run('ROLLBACK;');
          return resolve({ success: false, message: 'Préstamo no encontrado.' });
        }

        // 2. Parsear libros actuales y nuevos
        const librosAnteriores = JSON.parse(prestamoActual.librosJson || '[]');
        const librosNuevos = libros;

        console.log('📚 Libros anteriores:', librosAnteriores.map(l => l.id));
        console.log('📚 Libros nuevos:', librosNuevos.map(l => l.id));

        // 3. Identificar libros que se removieron y agregaron
        const librosRemovidosIds = librosAnteriores
          .filter(libroAnterior => !librosNuevos.some(libroNuevo => libroNuevo.id === libroAnterior.id))
          .map(libro => libro.id);

        const librosAgregadosIds = librosNuevos
          .filter(libroNuevo => !librosAnteriores.some(libroAnterior => libroAnterior.id === libroNuevo.id))
          .map(libro => libro.id);

        console.log('➖ Libros removidos:', librosRemovidosIds);
        console.log('➕ Libros agregados:', librosAgregadosIds);

        // 4. Actualizar contadores de libros removidos (disminuir prestados)
        for (const libroId of librosRemovidosIds) {
          await new Promise((res, rej) => {
            db.run(
              'UPDATE books SET prestados = prestados - 1 WHERE id = ? AND prestados > 0',
              [libroId],
              function (err) {
                if (err) {
                  console.error('❌ Error al decrementar libro:', err);
                  rej(err);
                } else {
                  console.log('✅ Decrementado libro ID:', libroId);
                  res(true);
                }
              }
            );
          });
        }

        // 5. Verificar disponibilidad y actualizar contadores de libros agregados
        for (const libroId of librosAgregadosIds) {
          // Verificar disponibilidad antes de agregar
          const availability = await new Promise((res, rej) => {
            db.get('SELECT ejemplares, prestados FROM books WHERE id = ?', [libroId], (err, row) => {
              if (err) rej(err);
              else res(row);
            });
          });

          if (availability && availability.prestados < 2) { // Límite máximo de 2 préstamos
            await new Promise((res, rej) => {
              db.run(
                'UPDATE books SET prestados = prestados + 1 WHERE id = ?',
                [libroId],
                function (err) {
                  if (err) {
                    console.error('❌ Error al incrementar libro:', err);
                    rej(err);
                  } else {
                    console.log('✅ Incrementado libro ID:', libroId);
                    res(true);
                  }
                }
              );
            });
          } else {
            // Si no hay disponibilidad, hacer rollback
            db.run('ROLLBACK;');
            return resolve({ 
              success: false, 
              message: `No hay ejemplares disponibles del libro ID: ${libroId}` 
            });
          }
        }

        // 6. Actualizar el préstamo con los nuevos datos
        await new Promise((res, rej) => {
          db.run(
            `UPDATE prestamos SET 
              fechaPrestamo = ?,
              librosJson = ?
            WHERE id = ?`,
            [fechaPrestamo, JSON.stringify(librosNuevos), id],
            function (err) {
              if (err) {
                console.error('❌ Error al actualizar préstamo:', err);
                rej(err);
              } else {
                console.log('✅ Préstamo actualizado, cambios:', this.changes);
                res({ success: true, changes: this.changes });
              }
            }
          );
        });

        // 7. Confirmar transacción
        db.run('COMMIT;', function (err) {
          if (err) {
            console.error('❌ Error al confirmar transacción:', err);
            db.run('ROLLBACK;');
            resolve({ success: false, message: 'Error al confirmar actualización.' });
          } else {
            console.log('✅ Préstamo actualizado correctamente');
            resolve({ 
              success: true, 
              message: 'Préstamo actualizado correctamente',
              changes: 1 
            });
          }
        });

      } catch (error) {
        console.error('❌ Error durante la transacción de actualización:', error);
        db.run('ROLLBACK;');
        resolve({ success: false, message: error.message || 'Error al actualizar el préstamo.' });
      }
    });
  });
});