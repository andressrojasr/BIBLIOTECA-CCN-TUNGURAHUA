# 📦 APP DE GESTIÓN BIBLIOTECARIA CCN tUNGURAHUA

Esta es una aplicación desarrollada con Ionic y SQLite que permite gestionar usuarios, libros y prestamos en una biblioteca. 

## 🚀 Tecnologías utilizadas

- Ionic
- SQLite
- Angular
- TypeScript

## 📁 Estructura del proyecto
- Para agregar sqlite, se debe agregar un main.js en la raiz, un db.js y un fix-base.js y asi lograr que corra
- Se debe modificar el script en package.json
"scripts": {
    "ng": "ng",
    "build": "ionic build",
    "postbuild": "node fix-base.js",
    "start": "npm run build && npm run postbuild && electron .",
    "electron-dev": "cross-env NODE_ENV=development electron .",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  },
- Se puede correr en modo desarrollador o en producción
- para producción npm start
- para desarrollador iniciar en un terminar un ng serve y en otra terminar un npm run electron-dev
