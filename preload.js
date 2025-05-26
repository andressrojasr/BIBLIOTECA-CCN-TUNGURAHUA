// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  insertBook: (libro) => ipcRenderer.invoke('insertBook', libro),
  getBooks: () => ipcRenderer.invoke('getBooks'),
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  updateBook: (book) => ipcRenderer.invoke('updateBook', book),
  deleteBook: (id) => ipcRenderer.invoke('deleteBook', id),
  getUsers: () => ipcRenderer.invoke('getUsers'),
  insertUser: (user) => ipcRenderer.invoke('insertUser', user),
  updateUser: (user) => ipcRenderer.invoke('updateUser', user),
  deleteUser: (id) => ipcRenderer.invoke('deleteUser', id),
  insertPrestamo: (data) => ipcRenderer.invoke('insertPrestamo', data),
  getPrestamos: () => ipcRenderer.invoke('getPrestamos'),
  devolverLibros: (data) => ipcRenderer.invoke('devolverLibros', data),
  getHistorialDevoluciones: () => ipcRenderer.invoke('getHistorialDevoluciones'),
  updatePrestamo: (data) => ipcRenderer.invoke('updatePrestamo', data), // <-- ¡AÑADE ESTA LÍNEA!
});