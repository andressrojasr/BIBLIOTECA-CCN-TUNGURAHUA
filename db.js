const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Ruta de la base de datos (junto al ejecutable o en carpeta específica)
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
        id INTEGER PRIMARY KEY,
        titulo TEXT,
        autor TEXT,
        estanteria TEXT,
        fila TEXT,
        caja TEXT,
        ejemplares INTEGER,
        prestados INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombres TEXT,
        apellidos TEXT,
        cedula TEXT,
        profesion TEXT,
        lugarTrabajo TEXT,
        tipoUsuario INTEGER,
        edad INTEGER,
        direccion TEXT,
        canton TEXT,
        celular TEXT,
        correo TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS prestamos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuarioId INTEGER,
        fechaPrestamo TEXT,
        fechaDevolucion TEXT,
        libroId INTEGER,
        FOREIGN KEY (libroId) REFERENCES books(id),
        FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
      )`,
    ];

    // Ejecutar todas las sentencias secuencialmente
    db.serialize(() => {
      createTables.forEach((sql) => {
        db.run(sql, (err) => {
          if (err) {
            console.error('❌ Error al crear tabla:', err.message);
          }
        });
      });
      const createTriggers = [
        `CREATE TRIGGER IF NOT EXISTS trg_prestamo_insert
        AFTER INSERT ON prestamos
        BEGIN
          UPDATE books
          SET prestados = prestados + 1
          WHERE id = NEW.libroId;
        END;`,

        `CREATE TRIGGER IF NOT EXISTS trg_prestamo_delete
        AFTER DELETE ON prestamos
        BEGIN
          UPDATE books
          SET prestados = prestados - 1
          WHERE id = OLD.libroId;
        END;`,

        `CREATE TRIGGER IF NOT EXISTS trg_prestamo_update
        AFTER UPDATE OF libroId ON prestamos
        BEGIN
          UPDATE books
          SET prestados = prestados - 1
          WHERE id = OLD.libroId;

          UPDATE books
          SET prestados = prestados + 1
          WHERE id = NEW.libroId;
        END;`,
      ];

      createTriggers.forEach((sql) => {
        db.run(sql, (err) => {
          if (err) {
            console.error('❌ Error al crear trigger:', err.message);
          } else {
            console.log('✅ Trigger creado');
          }
        });
      });
      // Verificar/insertar admin después de crear tablas
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
    });
  }
});

module.exports = db;
