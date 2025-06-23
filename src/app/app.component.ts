import { Component } from '@angular/core';

declare global {
  interface Window {
    electronAPI: {
      login: (username: string, password: string) => Promise<any>;
      insertBook: (book: any) => Promise<any>;
      getBooks: (offset: number, limit: number) => Promise<any>;
      getBook: (offset:number, limit:number, filterField: string, filterValue: string) => Promise<any>;
      updateBook: (book: any) => Promise<any>;
      deleteBook: (bookId: number) => Promise<any>;
      getUsers: (offset: number, limit: number) => Promise<any>;
      getUser: (offset: number, limit: number, filterField: string, filterValue: string) => Promise<any>;
      insertUser: (user: any) => Promise<any>;
      updateUser: (user: any) => Promise<any>;
      deleteUser: (userId: number) => Promise<any>;
      getPrestamos: (offset: number, limit: number) => Promise<any>;
      getPrestamo: (offset: number, limit: number, filterColumn: string, searchTerm: string) => Promise<any>;
      insertPrestamo: (prestamo: any) => Promise<any>;
      updatePrestamo: (fechaDevolucion: any, id: number) => Promise<any>;
      deletePrestamo: (prestamoId: number) => Promise<any>;
    };
  }
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  constructor() {
  }
}
