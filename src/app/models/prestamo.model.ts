import { Book } from "./book.model";
import { User } from "./user.model";

export interface Prestamo {
    id?: number,
    usuario: User,
    libro: Book,
    fechaPrestamo: string,
    fechaDevolucion: string,
}