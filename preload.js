const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  insertBook: (libro) => ipcRenderer.invoke('insertBook', libro),
  getBooks: () => ipcRenderer.invoke('getBooks'),
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  updateBook: (book) => ipcRenderer.invoke('updateBook', book),
  deleteBook: (id) => ipcRenderer.invoke('deleteBook', id),
});
