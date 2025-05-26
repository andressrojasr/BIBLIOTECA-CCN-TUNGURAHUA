// src/types/electron.d.ts

interface IElectronAPI {
  // Métodos para Libros
  insertBook: (libro: any) => Promise<any>;
  getBooks: () => Promise<any>;
  updateBook: (book: any) => Promise<any>;
  deleteBook: (id: number) => Promise<any>;

  // Métodos de Autenticación
  login: (username: string, password: string) => Promise<any>;

  // Métodos para Usuarios
  getUsers: () => Promise<any>;
  insertUser: (user: any) => Promise<any>;
  updateUser: (user: any) => Promise<any>;
  deleteUser: (id: number) => Promise<any>;

  // Métodos para Préstamos
  insertPrestamo: (data: { usuarioId: number; libroIds: number[]; fechaPrestamo: string; }) => Promise<any>;
  getPrestamos: () => Promise<any>;
  devolverLibros: (data: { prestamoId: number; libroIds: number[] }) => Promise<any>;
  getHistorialDevoluciones: () => Promise<any>;
  updatePrestamo: (data: { id: number; usuarioId: number; libroIds: number[]; fechaPrestamo: string; }) => Promise<any>; // <-- ¡AÑADE ESTA LÍNEA!
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

export {};