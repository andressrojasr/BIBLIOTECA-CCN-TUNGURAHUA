const { contextBridge, ipcRenderer } = require('electron');
const { filter } = require('rxjs');

contextBridge.exposeInMainWorld('electronAPI', {
  insertBook: (libro) => ipcRenderer.invoke('insertBook', libro),
  getBooks: (offset, limit) => ipcRenderer.invoke('getBooks', offset, limit),
  getBook: (offset, limit, filterField, filterValue) => ipcRenderer.invoke('getBook', offset, limit, filterField, filterValue),
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  updateBook: (book) => ipcRenderer.invoke('updateBook', book),
  deleteBook: (id) => ipcRenderer.invoke('deleteBook', id),
  getUsers: (offset, limit) => ipcRenderer.invoke('getUsers', offset, limit),
  getUser: (offset, limit, filterField, filterValue) => ipcRenderer.invoke('getUser', offset, limit, filterField, filterValue),
  insertUser: (user) => ipcRenderer.invoke('insertUser', user),
  updateUser: (user) => ipcRenderer.invoke('updateUser', user),
  deleteUser: (id) => ipcRenderer.invoke('deleteUser', id),
  getPrestamos: (offset, limit) => ipcRenderer.invoke('getPrestamos', offset, limit),
  getPrestamo: (offset, limit, filterColumn, searchTerm) => ipcRenderer.invoke('getPrestamo', offset, limit, filterColumn, searchTerm),
  insertPrestamo: (prestamo) => ipcRenderer.invoke('insertPrestamo', prestamo),
  updatePrestamo: (fechaDevolucion, id) => ipcRenderer.invoke('updatePrestamo', fechaDevolucion, id),
  deletePrestamo: (prestamoId) => ipcRenderer.invoke('deletePrestamo', prestamoId)
});
