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
});
