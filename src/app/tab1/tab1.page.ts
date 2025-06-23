import { Component, ViewChild } from '@angular/core';
import { AlertController, IonContent, ToastController } from '@ionic/angular';
import { UtilsService } from '../services/utils.service';
import { Prestamo } from '../models/prestamo.model';
import { AddPrestamoComponent } from '../shared/modals/add-prestamo/add-prestamo.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

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
  
  prestamos: Prestamo[] = [];
  filteredPrestamos: Prestamo[] = [];
  searchTerm: string = '';
  offset = 0;
  limit = 25; // Número de libros a cargar por petición
  loading = false;
  selectedFilter: string = 'id'; // Filtro por defecto



  async editPrestamo(prestamo: Prestamo) {
    
  }
  
  async addPrestamo(){
    let success = await this.utils.presentModal({
      component: AddPrestamoComponent,
      cssClass: 'add-update-modal',
      componentProps: {  }
    })
    if (success) 'Agregado con exito';
  }

  async loadMore(event?: any) {
    if (this.loading) return;

    this.loading = true;

    const result = await window.electronAPI.getPrestamos(this.offset, this.limit);
    this.prestamos = [...this.prestamos, ...result.prestamos];
    this.filteredPrestamos = this.prestamos
    this.offset += this.limit;
    this.loading = false;

    event.target.complete();

    if (result.prestamos.length < this.limit) {
      event.target.disabled = true; // No hay más libros
    }
  }

  async confirmDelete(prestamo: Prestamo) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar libro?',
      message: `¿Estás seguro de eliminar el prestamo ${prestamo.id}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deletePrestamo(prestamo.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async deletePrestamo(bookId: number) {
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
    this.prestamos = [];       // Reinicia resultados
    this.filteredPrestamos = [];
  }

  if (searchTerm === '') {
    this.loadMore(); // Si no hay término de búsqueda, cargar todos
    return;
  }

  if (this.loading) return;

  this.loading = true;

  try {
    const result = await window.electronAPI.getBook(this.offset, this.limit, this.selectedFilter, searchTerm);

    const newBooks = result.prestamos || [];

    // Concatenar si no es reset
    this.prestamos = reset ? newBooks : [...this.prestamos, ...newBooks];
    this.filteredPrestamos = this.prestamos;

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
