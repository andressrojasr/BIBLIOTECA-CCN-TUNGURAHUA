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
    this.loadMore();
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
  offset = 0;
  limit = 50;
  loading = false;
  selectedFilter: string = 'id'; // Filtro por defecto



  async editBook(book: Book) {
    let success = await this.utils.presentModal({
      component: AddUpdateBookComponent,
      cssClass: 'add-update-modal',
      componentProps: { book }
    })
    if (success) {
      this.loadMore()
      const toast = await this.toastCtrl.create({
          message: 'Libro editado con exito',
          duration: 3000,
          color: 'success'
        });
      toast.present()
    };
  }
  
  async addBook(){
    let success = await this.utils.presentModal({
      component: AddUpdateBookComponent,
      cssClass: 'add-update-modal',
      componentProps: {  }
    })
    if (success) 'Agregado con exito';
  }

  async loadMore(event?: any) {
    if (this.loading) return;

    this.loading = true;

    const result = await window.electronAPI.getBooks(this.offset, this.limit);
    this.books = [...this.books, ...result.books];
    this.filteredBooks = this.books
    this.offset += this.limit;
    this.loading = false;

    event.target.complete();

    if (result.books.length < this.limit) {
      event.target.disabled = true; // No hay más libros
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
      message: `¿Estás seguro de eliminar el libro ${book.titulo}?`,
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
        this.loadMore();
        const toast = await this.toastCtrl.create({
          message: 'Libro Eliminado exitosamente',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
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

  async filterBooks(reset: boolean = true) {
  console.log('Filtrando libros con término:', this.searchTerm, 'y filtro:', this.selectedFilter);

  const searchTerm = this.searchTerm.trim().toLowerCase();

  if (reset) {
    this.offset = 0;       // Reinicia offset si es un nuevo término de búsqueda
    this.books = [];       // Reinicia resultados
    this.filteredBooks = [];
  }

  if (searchTerm === '') {
    this.loadMore(); // Si no hay término de búsqueda, cargar todos
    return;
  }

  if (this.loading) return;

  this.loading = true;

  try {
    const result = await window.electronAPI.getBook(this.offset, this.limit, this.selectedFilter, searchTerm);

    const newBooks = result.books || [];

    // Concatenar si no es reset
    this.books = reset ? newBooks : [...this.books, ...newBooks];
    this.filteredBooks = this.books;

    // Aumenta el offset para la próxima carga
    this.offset += this.limit;
  } catch (error) {
    const toast = await this.toastCtrl.create({
      message: 'Error al buscar libro: ' + error,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  } finally {
    this.loading = false;
  }
}
}
