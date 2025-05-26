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

  prestamos: Prestamo[] = []; // Esta será la lista completa de préstamos
  filteredPrestamos: Prestamo[] = []; // Esta será la lista de préstamos filtrados/mostrados
  searchTerm: string = '';
  showScrollToTop = false;

  constructor(
    private utils: UtilsService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadPrestamos();
  }

  ionViewWillEnter() {
    this.loadPrestamos();
  }

  async loadPrestamos() {
    console.log('Intentando cargar préstamos...');
    try {
      const result = await (window as any).electronAPI.getPrestamos();
      console.log('Resultado de getPrestamos (ElectronAPI):', result);

      if (result.success) {
        // Asegúrate de que result.prestamos es un array antes de asignarlo
        if (Array.isArray(result.prestamos)) {
          this.prestamos = result.prestamos;
          console.log('Préstamos cargados (this.prestamos):', this.prestamos); // Verificar aquí el contenido
        } else {
          console.warn('Advertencia: result.prestamos no es un array o está vacío.', result.prestamos);
          this.prestamos = []; // Asegurarse de que sea un array vacío si no es válido
        }
        this.filterPrestamos(); // Llama al filtro después de cargar
      } else {
        this.presentToast(
          result.message || 'Error al cargar los préstamos',
          'danger'
        );
        this.prestamos = [];
        this.filterPrestamos(); // Asegurarse de vaciar la lista en caso de error
      }
    } catch (error) {
      console.error('Error en loadPrestamos (catch block):', error);
      this.presentToast('Error de conexión al cargar préstamos', 'danger');
      this.prestamos = [];
      this.filterPrestamos(); // Asegurarse de vaciar la lista en caso de error
    }
  }

  filterPrestamos() {
    const searchTermLower = this.searchTerm.toLowerCase();
    console.log('Filtrando préstamos con término:', searchTermLower);
    console.log('Estado de this.prestamos al inicio de filterPrestamos:', this.prestamos); // Nuevo log

    // 1. Verificar si this.prestamos es un array válido
    if (!Array.isArray(this.prestamos)) {
      console.error('Error: this.prestamos no es un array en filterPrestamos.', this.prestamos);
      this.filteredPrestamos = [];
      return;
    }

    // 2. Si el array está vacío, no hay nada que filtrar
    if (this.prestamos.length === 0) {
      console.log('No hay préstamos para filtrar o el array está vacío.');
      this.filteredPrestamos = [];
      return;
    }

    if (searchTermLower.trim() === '') {
      this.filteredPrestamos = this.prestamos;
    } else {
      this.filteredPrestamos = this.prestamos.filter(prestamo => {
        // Asegúrate de que prestamo y sus propiedades existan antes de acceder a ellas
        const usuarioNombre = prestamo.usuarioNombre?.toLowerCase() ?? '';
        const usuarioApellido = prestamo.usuarioApellido?.toLowerCase() ?? '';
        const fechaPrestamo = prestamo.fechaPrestamo?.toLowerCase() ?? '';

        const librosMatch = prestamo.libros?.some((libro) => {
          const titulo = libro.titulo?.toLowerCase() ?? '';
          const codigo = libro.codigo?.toLowerCase() ?? '';
          return titulo.includes(searchTermLower) || codigo.includes(searchTermLower);
        }) ?? false; // Si prestamo.libros es undefined o null, librosMatch es false

        const match =
          usuarioNombre.includes(searchTermLower) ||
          usuarioApellido.includes(searchTermLower) ||
          fechaPrestamo.includes(searchTermLower) ||
          librosMatch;
        // console.log(`Préstamo: ${prestamo.usuarioNombre} ${prestamo.usuarioApellido}, Coincide: ${match}`); // Descomentar para depurar el filtro
        return match;
      });
      console.log('Préstamos filtrados (con término de búsqueda):', this.filteredPrestamos);
    }
  }

  async addPrestamo() {
    const { success } = await this.utils.presentModal({
      component: AddUpdatePrestamoComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        // No pasamos préstamo para agregar
      },
    });

    if (success) {
      this.loadPrestamos();
    }
  }

  async devolverLibro(prestamo: Prestamo) {
    const { success } = await this.utils.presentModal({
      component: DevolverLibroComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        prestamo: prestamo,
      },
    });

    if (success) {
      this.loadPrestamos();
    }
  }

  async confirmDelete(prestamo: Prestamo) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el préstamo de ${prestamo.usuarioNombre} ${prestamo.usuarioApellido}?`, // <-- CORRECCIÓN AQUÍ TAMBIÉN
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deletePrestamo(prestamo.id);
          },
        },
      ],
    });
    await alert.present();
  }

  async deletePrestamo(prestamoId: number) {
    try {
      const result = await window.electronAPI.deletePrestamo(prestamoId);
      if (result.success) {
        await this.presentToast('Préstamo eliminado exitosamente', 'success');
        this.loadPrestamos();
      } else {
        await this.presentToast(result.message || 'Error al eliminar préstamo', 'danger');
      }
    } catch (err) {
      console.error('Error al eliminar el préstamo:', err);
      await this.presentToast('Error de conexión al eliminar préstamo', 'danger');
    }
  }

  async showHistorialDevoluciones() {
    await this.utils.presentModal({
      component: HistorialDevolucionesComponent,
      cssClass: 'modal-fullscreen',
    });
  }

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
      duration: 2000,
      color: color
    });
    await toast.present();
  }
}