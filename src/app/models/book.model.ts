export interface Book {
  id?: number;
  codigo: string;
  titulo: string;
  autor: string;
  estanteria: string;
  fila: string;
  caja: string;
  ejemplares: number;
  prestados: number;
}