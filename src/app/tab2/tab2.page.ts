import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  showScrollToTop = false;

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollToTop = scrollTop > 150; // muestra si se ha scrolleado más de 150px
  }

  scrollToTop() {
    this.content.scrollToTop(300);
  }
  
  books = [
    { id: 1000, title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 2000, title: '1984', author: 'George Orwell', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 3000, title: 'Don Quijote', author: 'Miguel de Cervantes', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 400, title: 'El Principito', author: 'Antoine de Saint-Exupéry', ubicacion: 'Estante 2, fila 3', ejemplares: 4},
    { id: 1000, title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 2000, title: '1984', author: 'George Orwell', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 3000, title: 'Don Quijote', author: 'Miguel de Cervantes', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 400, title: 'El Principito', author: 'Antoine de Saint-Exupéry', ubicacion: 'Estante 2, fila 3', ejemplares: 4},
    { id: 1000, title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 2000, title: '1984', author: 'George Orwell', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 3000, title: 'Don Quijote', author: 'Miguel de Cervantes', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 400, title: 'El Principito', author: 'Antoine de Saint-Exupéry', ubicacion: 'Estante 2, fila 3', ejemplares: 4},
    { id: 1000, title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 2000, title: '1984', author: 'George Orwell', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 3000, title: 'Don Quijote', author: 'Miguel de Cervantes', ubicacion: 'Estante 2, fila 3', ejemplares: 4 },
    { id: 400, title: 'El Principito', author: 'Antoine de Saint-Exupéry', ubicacion: 'Estante 2, fila 3', ejemplares: 4}
  ];

  constructor() {}

  editBook(book: any) {
    console.log('Edit book:', book);
    // Implement your edit logic here
  }

  deleteBook(book: any) {
    console.log('Delete book:', book);
    // Implement your delete logic here
  }

}
