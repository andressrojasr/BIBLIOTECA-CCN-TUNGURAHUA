import { Component } from '@angular/core';

declare global {
  interface Window {
    electronAPI: {
      login: (username: string, password: string) => Promise<any>;
      insertBook: (book: any) => Promise<any>;
      getBooks: () => Promise<any>;
      updateBook: (book: any) => Promise<any>;
      deleteBook: (bookId: number) => Promise<any>;
      getUsers: () => Promise<any>;
      insertUser: (user: any) => Promise<any>;
      updateUser: (user: any) => Promise<any>;
      deleteUser: (userId: number) => Promise<any>;
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
