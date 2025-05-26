// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  insertBook: (libro) => ipcRenderer.invoke('insertBook', libro),
  getBooks: () => ipcRenderer.invoke('getBooks'), // <-- Debe estar aquí
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  updateBook: (book) => ipcRenderer.invoke('updateBook', book),
  deleteBook: (id) => ipcRenderer.invoke('deleteBook', id),

  // Métodos para la gestión de usuarios (tabla 'usuarios')
  getUsuarios: () => ipcRenderer.invoke('getUsuarios'),
  insertUsuario: (user) => ipcRenderer.invoke('insertUsuario', user),
  updateUsuario: (user) => ipcRenderer.invoke('updateUsuario', user),
  deleteUsuario: (id) => ipcRenderer.invoke('deleteUsuario', id),

  // Métodos para préstamos y devoluciones
  insertPrestamo: (data) => ipcRenderer.invoke('insertPrestamo', data),
  getPrestamos: () => ipcRenderer.invoke('getPrestamos'),
  devolverLibros: (data) => ipcRenderer.invoke('devolverLibros', data),
  getHistorialDevoluciones: () => ipcRenderer.invoke('getHistorialDevoluciones'),
  deletePrestamo: (id) => ipcRenderer.invoke('deletePrestamo', id),
});