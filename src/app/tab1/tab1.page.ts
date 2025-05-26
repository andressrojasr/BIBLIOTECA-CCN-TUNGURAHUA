// src/app/tab1/tab1.page.ts
import { Component, ViewChild } from '@angular/core';
import { AlertController, IonContent, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UtilsService } from '../services/utils.service';
import { AddUpdatePrestamoComponent } from '../shared/modals/add-update-prestamo/add-update-prestamo.component';
import { DevolverLibroComponent } from '../shared/modals/devolver-libro/devolver-libro.component';
import { HistorialDevolucionesComponent } from '../shared/modals/historial-devoluciones/historial-devoluciones.component';
import { SharedModule } from '../shared/shared.module';
import { Prestamo } from '../models/prestamo.model'; // Asegúrate de importar el modelo Prestamo

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AddUpdatePrestamoComponent,
    DevolverLibroComponent,
    HistorialDevolucionesComponent,
  ],
})
export class Tab1Page {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  showScrollToTop = false;
  prestamos: Prestamo[] = []; // Usa el tipo Prestamo[]
  filteredPrestamos: Prestamo[] = []; // Usa el tipo Prestamo[]
  searchTerm: string = '';

  constructor(
    private utils: UtilsService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    // Llama a cargar los préstamos cuando el componente se inicializa
    this.loadPrestamos();
  }

  // Hook de ciclo de vida de Ionic para asegurar la recarga al entrar en la vista
  ionViewWillEnter() {
    this.loadPrestamos();
  }

  async loadPrestamos() {
    try {
      const result = await window.electronAPI.getPrestamos();
      if (result.success) {
        this.prestamos = result.data;
        this.filterPrestamos(); // Aplica el filtro inicial (o si el searchTerm está vacío, mostrará todos)
      } else {
        console.error('Error al cargar préstamos:', result.message);
        this.presentToast('Error al cargar préstamos: ' + result.message, 'danger');
      }
    } catch (error) {
      console.error('❌ Error cargando préstamos desde Electron:', error);
      this.presentToast('Error de comunicación al cargar préstamos.', 'danger');
    }
  }

  async addPrestamo() {
    const { data: success } = await this.utils.presentModal({
      component: AddUpdatePrestamoComponent,
      cssClass: 'add-update-modal',
    });
    if (success) {
      this.loadPrestamos(); // Recarga la lista de préstamos
      const toast = await this.toastCtrl.create({
        message: 'Préstamo registrado con éxito',
        duration: 3000,
        color: 'success',
      });
      await toast.present();
    }
  }

  async devolverLibro(prestamo: Prestamo) { // Usa el tipo Prestamo
    const { data: success } = await this.utils.presentModal({
      component: DevolverLibroComponent,
      cssClass: 'devolver-modal',
      componentProps: { prestamo },
    });
    if (success) {
      this.loadPrestamos(); // Recarga la lista de préstamos
      const toast = await this.toastCtrl.create({
        message: 'Libro(s) devuelto(s) exitosamente',
        duration: 3000,
        color: 'success',
      });
      await toast.present();
    }
  }

  async showHistorialDevoluciones() {
    await this.utils.presentModal({
      component: HistorialDevolucionesComponent,
      cssClass: 'historial-devoluciones-modal',
    });
  }

  filterPrestamos() {
    const searchTermLower = this.searchTerm.toLowerCase();
    if (searchTermLower.trim() === '') {
      this.filteredPrestamos = [...this.prestamos]; // Muestra todos si no hay término de búsqueda
    } else {
      this.filteredPrestamos = this.prestamos.filter((prestamo) => {
        // Asegúrate de que las propiedades existan antes de llamar a toLowerCase
        const usuarioNombre = prestamo.usuarioNombre ? prestamo.usuarioNombre.toLowerCase() : '';
        const usuarioApellido = prestamo.usuarioApellido ? prestamo.usuarioApellido.toLowerCase() : '';
        const fechaPrestamo = prestamo.fechaPrestamo ? prestamo.fechaPrestamo.toLowerCase() : '';

        // Busca en los títulos y códigos de los libros prestados
        const librosMatch = prestamo.libros.some((libro) => {
          const titulo = libro.titulo ? libro.titulo.toLowerCase() : '';
          const codigo = libro.codigo ? libro.codigo.toLowerCase() : '';
          return titulo.includes(searchTermLower) || codigo.includes(searchTermLower);
        });

        return (
          usuarioNombre.includes(searchTermLower) ||
          usuarioApellido.includes(searchTermLower) ||
          fechaPrestamo.includes(searchTermLower) ||
          librosMatch
        );
      });
    }
  }

  // Métodos para scroll
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollToTop = scrollTop > 150;
  }

  scrollToTop() {
    this.content.scrollToTop(300);
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
    });
    toast.present();
  }
}