// src/app/tab2/tab2.page.ts
import { Component, ViewChild, OnInit } from '@angular/core';
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
export class Tab2Page implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  constructor(private utils: UtilsService, private toastCtrl: ToastController, private alertCtrl: AlertController) {
    // No llamar loadBooks aquí, lo haremos en ionViewWillEnter o ngOnInit
  }

  ngOnInit() {
    // Se ejecuta una vez al inicializar el componente
    this.loadBooks();
  }

  ionViewWillEnter() {
    // Se ejecuta cada vez que la vista va a entrar en pantalla (al navegar a la pestaña)
    this.loadBooks();
  }

  showScrollToTop = false;

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollToTop = scrollTop > 150;
  }

  scrollToTop() {
    this.content.scrollToTop(300);
  }

  books: Book[] = [];
  filteredBooks: Book[] = [];
  searchTerm: string = '';

  async loadBooks() {
    try {
      const result = await window.electronAPI.getBooks(); // Usa la interfaz tipada
      if (result.success) {
        this.books = result.data;
        this.filterBooks();
      } else {
        const toast = await this.toastCtrl.create({
          message: result.message || 'Error al cargar los libros',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error al cargar los libros:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error de conexión al cargar libros',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }


  async addBook() {
    const { success } = await this.utils.presentModal({
      component: AddUpdateBookComponent,
      cssClass: 'modal-fullscreen', // <-- Corregido: cssClasses a cssClass
      componentProps: {
        // No pasamos un 'book' ya que es para agregar
      }
    });

    if (success) {
      this.loadBooks();
    }
  }

  async editBook(book: Book) {
    const { success } = await this.utils.presentModal({
      component: AddUpdateBookComponent,
      cssClass: 'modal-fullscreen', // <-- Corregido: cssClasses a cssClass
      componentProps: {
        book: book
      }
    });

    if (success) {
      this.loadBooks();
    }
  }

  async confirmDelete(book: Book) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el libro "${book.titulo}"?`,
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
      const result = await window.electronAPI.deleteBook(bookId); // Usa la interfaz tipada
      if (result.success) {
        const toast = await this.toastCtrl.create({
          message: 'Libro Eliminado exitosamente',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        this.loadBooks();
      } else {
        const toast = await this.toastCtrl.create({
          message: result.message || 'Error al eliminar el libro',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (err) {
      console.error('❌ Error al eliminar el libro:', err);
      const toast = await this.toastCtrl.create({
        message: 'Error de conexión al eliminar libro',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  filterBooks() {
    const searchTerm = this.searchTerm.toLowerCase();

    if (searchTerm.trim() === '') {
      this.filteredBooks = this.books;
    } else {
      this.filteredBooks = this.books.filter(book => {
        return (
          (book.titulo && book.titulo.toLowerCase().includes(searchTerm)) ||
          (book.autor && book.autor.toLowerCase().includes(searchTerm)) ||
          (book.codigo && book.codigo.toLowerCase().includes(searchTerm)) ||
          (book.estanteria && book.estanteria.toLowerCase().includes(searchTerm)) ||
          (book.fila && book.fila.toLowerCase().includes(searchTerm)) ||
          (book.caja && book.caja.toLowerCase().includes(searchTerm))
        );
      });
    }
  }
}

// LA DECLARACIÓN GLOBAL SE MOVIO A src/types/electron.d.ts
// REMUEVE CUALQUIER DECLARACIÓN SIMILAR DE ESTE ARCHIVO PARA EVITAR CONFLICTOS