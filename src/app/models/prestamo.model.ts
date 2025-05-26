// src/app/models/prestamo.model.ts

// Interfaz para cada libro dentro del array 'libros' de un préstamo
export interface PrestamoLibro {
  id: number;
  titulo: string;
  codigo: string;
  // Agrega otras propiedades del libro si son relevantes para el préstamo (e.g., autor)
  // autor?: string;
}

// Interfaz principal para un objeto de préstamo
export interface Prestamo {
  id: number;
  // Asegúrate de que estos nombres coincidan EXACTAMENTE con lo que tu main.js retorna en el objeto Prestamo
  usuarioId: number;         // <-- ¡Propiedad 'usuarioId' agregada/corregida!
  usuarioNombres: string;    // Nombres del usuario (coincide con 'usuarioNombres' de main.js)
  usuarioApellidos: string;  // Apellidos del usuario (coincide con 'usuarioApellidos' de main.js)

  fechaPrestamo: string;
  fechaDevolucion?: string | null; // Es opcional porque puede ser null (préstamo activo)
  completado?: number;       // Tu modelo actual lo tiene. Si lo usas, mantenlo.

  libros: PrestamoLibro[];   // Array de libros asociados al préstamo
}

// Tus otras interfaces, si las sigues usando:
export interface PrestamoDetalle {
  id: number;
  usuarioId: number;
  fechaPrestamo: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  libroId: number;
  codigo: string;
  titulo: string;
  autor: string;
}

export interface Devolucion {
  id: number;
  fechaDevolucion: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  codigo: string;
  titulo: string;
  autor: string;
  fechaPrestamo: string;
}