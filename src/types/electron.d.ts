// src/types/electron.d.ts
import { Book } from '../app/models/book.model'; // Asegúrate de que la ruta sea correcta
import { User } from '../app/models/user.model'; // Asegúrate de que la ruta sea correcta
import { Prestamo } from '../app/models/prestamo.model'; // Asegúrate de que la ruta sea correcta

// Define la interfaz para los métodos de Electron API
interface IElectronAPI {
  getBooks: () => Promise<any>;
  insertBook: (book: Book) => Promise<any>;
  updateBook: (book: Book) => Promise<any>;
  deleteBook: (id: number) => Promise<any>;

  getUsuarios: () => Promise<any>;
  insertUsuario: (user: User) => Promise<any>;
  updateUsuario: (user: User) => Promise<any>;
  deleteUsuario: (id: number) => Promise<any>;

  insertPrestamo: (data: { userId: number, libros: Book[] }) => Promise<any>;
  getPrestamos: () => Promise<any>;
  devolverLibros: (data: { prestamoId: number, librosDevueltos: Book[] }) => Promise<any>;
  getHistorialDevoluciones: () => Promise<any>;
  deletePrestamo: (id: number) => Promise<any>; // <--- ¡AÑADE ESTA LÍNEA!

  login: (username: string, password: string) => Promise<any>;
}

// Declara la interfaz globalmente para que TypeScript la reconozca en `window`
// Esta debe ser la ÚNICA declaración global de electronAPI
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}