import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController, ToastController } from '@ionic/angular';
import { Book } from 'src/app/models/book.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-select-book',
  templateUrl: './select-book.component.html',
  styleUrls: ['./select-book.component.scss'],
  standalone: false,
})
export class SelectBookComponent {

  @ViewChild(IonContent, { static: false }) content!: IonContent;
  
    constructor(private utils: UtilsService, private toastCtrl: ToastController, private alertCtrl: AlertController) {
      this.loadMore();
    }

    modalCtrl = inject(ModalController);
  
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
    limit = 25; // Número de usuarios a cargar por petición
    loading = false;
    selectedFilter: string = 'id'; // Filtro por defecto
  
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
  
    async filterBooks(reset: boolean = true) {
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
  
      const newUsers = result.books || [];
  
      // Concatenar si no es reset
      this.books = reset ? newUsers : [...this.books, ...newUsers];
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

  select(book: Book) {
    this.modalCtrl.dismiss(book);
  }

}
