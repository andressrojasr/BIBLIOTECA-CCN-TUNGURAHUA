const { contextBridge, ipcRenderer } = require('electron');
const { filter } = require('rxjs');

contextBridge.exposeInMainWorld('electronAPI', {
  insertBook: (libro) => ipcRenderer.invoke('insertBook', libro),
  getBooks: (offset, limit) => ipcRenderer.invoke('getBooks', offset, limit),
  getBook: (offset, limit, filterField, filterValue) => ipcRenderer.invoke('getBook', offset, limit, filterField, filterValue),
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  updateBook: (book) => ipcRenderer.invoke('updateBook', book),
  deleteBook: (id) => ipcRenderer.invoke('deleteBook', id),
  getUsers: () => ipcRenderer.invoke('getUsers'),
  insertUser: (user) => ipcRenderer.invoke('insertUser', user),
  updateUser: (user) => ipcRenderer.invoke('updateUser', user),
  deleteUser: (id) => ipcRenderer.invoke('deleteUser', id),

});
