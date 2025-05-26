// db.js
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Ruta de la base de datos
const dbPath = path.join(__dirname, 'data', 'app.db');

// Crea carpeta si no existe
const dirPath = path.dirname(dbPath);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Conecta a la base
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Base de datos conectada:', dbPath);
    const createTables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        titulo TEXT,
        autor TEXT,
        estanteria TEXT,
        fila TEXT,
        caja TEXT,
        ejemplares INTEGER,
        prestados INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombres TEXT,
        apellidos TEXT,
        cedula TEXT UNIQUE,
        profesion TEXT,
        lugarTrabajo TEXT,
        tipoUsuario TEXT,
        edad INTEGER,
        direccion TEXT,
        canton TEXT,
        celular TEXT,
        correo TEXT
      )`,
      // ¡¡FALTA ESTO!! Añade la tabla de préstamos aquí
      `CREATE TABLE IF NOT EXISTS prestamos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        fechaPrestamo TEXT NOT NULL,
        librosJson TEXT NOT NULL, -- Aquí es donde se guarda el JSON de los libros
        fechaDevolucion TEXT,
        FOREIGN KEY (userId) REFERENCES usuarios(id)
      )`,
      `CREATE TABLE IF NOT EXISTS historial_devoluciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prestamoId INTEGER NOT NULL,
        libroId INTEGER NOT NULL,
        usuarioId INTEGER NOT NULL,
        fechaDevolucion TEXT NOT NULL,
        tituloLibro TEXT,
        codigoLibro TEXT,
        nombreUsuario TEXT,
        apellidoUsuario TEXT,
        FOREIGN KEY (prestamoId) REFERENCES prestamos(id),
        FOREIGN KEY (libroId) REFERENCES books(id),
        FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
      )`
    ];

    // Ejecuta la creación de todas las tablas
    createTables.forEach(sql => {
      db.run(sql, (err) => {
        if (err) {
          console.error('❌ Error al crear tabla:', err.message);
        } else {
          console.log('✅ Tabla creada o ya existente: ', sql.substring(0, 50) + '...'); // Descomentar y modificar para depuración
        }
      });
    });

    // Código existente para verificar y añadir columna 'prestados' a 'books'
    db.all("PRAGMA table_info(books)", (err, columns) => {
      if (err) {
        console.error('❌ Error al obtener información de la tabla books:', err);
      } else {
        const hasPrestadosColumn = columns.some(col => col.name === 'prestados');
        if (!hasPrestadosColumn) {
          db.run("ALTER TABLE books ADD COLUMN prestados INTEGER DEFAULT 0", (err) => {
            if (err) {
              console.error('❌ Error al agregar columna prestados:', err);
            } else {
              console.log('✅ Columna prestados agregada a la tabla books');
            }
          });
        }
      }
    });

    // Verificar/insertar usuario admin si no existe
    db.get(`SELECT * FROM users WHERE username = 'admin'`, (err, row) => {
      if (err) {
        console.error('❌ Error al consultar admin:', err);
      } else if (!row) {
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['admin', 'admin'], (err) => {
          if (err) {
            console.error('❌ Error al insertar usuario admin:', err);
          } else {
            console.log('✅ Usuario admin creado');
          }
        });
      } else {
        console.log('ℹ️ Usuario admin ya existe');
      }
    });
  }
});

process.on('exit', () => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error al cerrar la base de datos:', err.message);
    } else {
      console.log('✅ Base de datos cerrada.');
    }
  });
});

module.exports = db;