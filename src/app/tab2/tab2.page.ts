import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { AlertController, IonContent, ToastController } from '@ionic/angular';
import { UtilsService } from '../services/utils.service';
import { Book } from '../models/book.model';
import { AddUpdateBookComponent } from '../shared/modals/add-update-book/add-update-book.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page{

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  constructor(private utils: UtilsService, private toastCtrl: ToastController, private alertCtrl: AlertController) {
    this.loadBooks();
  }

  showScrollToTop = false;

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollToTop = scrollTop > 150; // muestra si se ha scrolleado más de 150px
  }

  scrollToTop() {
    this.content.scrollToTop(300);
  }
  
  books: Book[] = [];
  filteredBooks: Book[] = [];
  searchTerm: string = '';


  async editBook(book: Book) {
    let success = await this.utils.presentModal({
      component: AddUpdateBookComponent,
      cssClass: 'add-update-modal',
      componentProps: { book }
    })
    if (success) {
      this.loadBooks();
    };
  }
  
  async addBook(){
    let success = await this.utils.presentModal({
      component: AddUpdateBookComponent,
      cssClass: 'add-update-modal',
      componentProps: {  }
    })
    if (success) {
      this.loadBooks();
      const toast = await this.toastCtrl.create({
        message: 'Libro agregado con éxito',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    };
  }


  async loadBooks() {
    try {
      const result = await window.electronAPI.getBooks();
      if (result.success) {
        this.books = result.books || [];
        this.filteredBooks = this.books; // Inicializa filteredBooks con todos los libros
      } else {
        console.warn('No se encontraron libros.');
      }
    } catch (err) {
      console.error('Error al obtener libros:', err);
    }
  }

  async confirmDelete(book: Book) {
    if (book.prestados > 0) {
    const toast = await this.toastCtrl.create({
      message: `No se puede eliminar el libro "${book.titulo}" porque tiene ejemplares prestados.`,
      duration: 3000,
      color: 'warning'
    });
    await toast.present();
    return;
    }
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar libro?',
      message: `¿Estás seguro de eliminar el libro ${book.titulo} con código ${book.codigo}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteBook(book.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteBook(bookId: number) {
    try {
      const result = await window.electronAPI.deleteBook(bookId);
      if (result.success) {
        const toast = await this.toastCtrl.create({
          message: 'Libro Eliminado exitosamente',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        this.loadBooks(); // Vuelve a cargar los libros actualizados
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Error al eliminar el libro',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (err) {
      console.error('❌ Error al eliminar el libro:', err);
    }
  }

  filterBooks() {
          const searchTerm = this.searchTerm.toLowerCase();
      
          if (searchTerm.trim() === '') {
            this.filteredBooks = this.books;
          } else {
            this.filteredBooks = this.books.filter(book => {
              return (
                book.titulo.toLowerCase().includes(searchTerm) ||
                book.autor.toLowerCase().includes(searchTerm) ||
                (book.codigo && book.codigo.toLowerCase().includes(searchTerm)) ||
                String(book.id).toLowerCase().includes(searchTerm)
              );
            });
          }
  }
}