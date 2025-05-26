// src/models/prestamo.model.ts

// Interfaz para cada libro dentro del array 'libros' de un préstamo
export interface PrestamoLibro {
  id: number;
  titulo: string;
  codigo: string;
}

// Interfaz principal para un objeto de préstamo
export interface Prestamo {
  id: number;
  usuarioId: number;
  usuarioNombre: string; // <-- AGREGADO: Nombre del usuario
  usuarioApellido: string; // <-- AGREGADO: Apellido del usuario
  fechaPrestamo: string;
  completado: number; // <-- AGREGADO: Para indicar si el préstamo está completado (0 o 1)
  libros: PrestamoLibro[]; // <-- CORREGIDO: Ahora es un array de PrestamoLibro
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