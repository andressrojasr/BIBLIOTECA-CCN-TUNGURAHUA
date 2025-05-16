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

    // Crear tabla si no existe
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        status INTEGER
      );`,
      (err) => {
        if (err) {
          console.error('❌ Error al crear tabla users:', err);
        } else {
          // Verificar si el usuario "admin" ya existe
          db.get(`SELECT * FROM users WHERE username = 'admin'`, (err, row) => {
            if (err) {
              console.error('❌ Error al consultar admin:', err);
            } else if (!row) {
              // Insertar admin si no existe
              db.run(
                `INSERT INTO users (username, password, status) VALUES (?, ?, ?)`,
                ['admin', 'admin', 0],
                (err) => {
                  if (err) {
                    console.error('❌ Error al insertar usuario admin:', err);
                  }
                }
              );
            } else {
              console.log('ℹ️ Usuario admin ya existe');
            }
          });
        }
      }
    );
  }
});

module.exports = db;
