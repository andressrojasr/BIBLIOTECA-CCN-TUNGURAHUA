// src/app/tab1/tab1.page.ts
import { Component, ViewChild, OnInit } from '@angular/core';
import { AlertController, IonContent, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UtilsService } from '../services/utils.service';
import { AddUpdatePrestamoComponent } from '../shared/modals/add-update-prestamo/add-update-prestamo.component';
import { DevolverLibroComponent } from '../shared/modals/devolver-libro/devolver-libro.component';
import { HistorialDevolucionesComponent } from '../shared/modals/historial-devoluciones/historial-devoluciones.component';
import { SharedModule } from '../shared/shared.module';
import { Prestamo } from '../models/prestamo.model';
// Ya no necesitamos importar User aquí si la información del usuario viene directamente en Prestamo
// import { User } from '../models/user.model';

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
export class Tab1Page implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  prestamos: Prestamo[] = [];
  filteredPrestamos: Prestamo[] = [];
  // Ya no necesitamos la lista de users separada
  // users: User[] = [];
  searchTerm: string = '';
  showScrollToTop = false;

  constructor(
    private utils: UtilsService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    // Ya no necesitamos cargar usuarios separadamente
    // await this.loadUsers();
    this.loadPrestamos();
  }

  ionViewWillEnter() {
    this.loadPrestamos();
  }

  // Eliminamos la función loadUsers, ya no es necesaria
  /*
  async loadUsers() {
    try {
      const result = await (window as any).electronAPI.getUsuarios();
      if (result.success) {
        this.users = result.users;
        console.log('✅ Usuarios cargados en Tab1Page:', this.users);
      } else {
        console.error('❌ Error cargando usuarios en Tab1Page:', result.message);
        this.presentToast('Error al cargar usuarios.', 'danger');
      }
    } catch (error) {
      console.error('❌ Error de conexión al cargar usuarios en Tab1Page:', error);
      this.presentToast('Error de conexión al cargar usuarios.', 'danger');
    }
  }
  */

  async loadPrestamos() {
    try {
      const result = await (window as any).electronAPI.getPrestamos();
      if (result.success) {
        // Asignamos directamente los préstamos, ya contienen la información del usuario
        this.prestamos = result.prestamos;
        console.log('✅ Préstamos cargados y procesados:', this.prestamos);
        this.filterPrestamos();
      } else {
        const toast = await this.toastCtrl.create({
          message: result.message || 'Error al cargar los préstamos',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error al cargar los préstamos (catch):', error);
      const toast = await this.toastCtrl.create({
        message: 'Error de conexión al cargar préstamos',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  filterPrestamos() {
    const searchTerm = this.searchTerm.toLowerCase();

    if (searchTerm.trim() === '') {
      this.filteredPrestamos = this.prestamos;
    } else {
      this.filteredPrestamos = this.prestamos.filter(prestamo => {
        // Usamos las propiedades usuarioNombres, usuarioApellidos y usuarioCedula directamente
        const userMatch = prestamo.usuarioNombres?.toLowerCase().includes(searchTerm) ||
                          prestamo.usuarioApellidos?.toLowerCase().includes(searchTerm);
                          // Si tienes cedula en Prestamo, úsala también:
                          // prestamo.usuarioCedula?.toLowerCase().includes(searchTerm);

        const bookMatch = prestamo.libros.some(libro =>
          libro.titulo.toLowerCase().includes(searchTerm) ||
          libro.codigo.toLowerCase().includes(searchTerm)
        );

        return userMatch || bookMatch;
      });
    }
  }

  async addPrestamo() {
    const response = await this.utils.presentModal({
      component: AddUpdatePrestamoComponent,
      cssClass: 'modal-fullscreen',
    });

    if (response && response.success) {
      this.loadPrestamos();
    }
  }

  async devolverLibro(prestamo: Prestamo) {
    const response = await this.utils.presentModal({
      component: DevolverLibroComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        prestamo: prestamo
      }
    });

    if (response && response.success) {
      this.loadPrestamos();
    }
  }

  async confirmDelete(prestamo: Prestamo) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      // Usamos las propiedades directamente del préstamo
      message: `¿Estás seguro de que quieres eliminar el préstamo de "${prestamo.usuarioNombres} ${prestamo.usuarioApellidos}"?`,
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

  async deletePrestamo(prestamoId: number) {
    try {
      const result = await (window as any).electronAPI.deletePrestamo(prestamoId);
      if (result.success) {
        this.presentToast('Préstamo eliminado exitosamente.', 'success');
        this.loadPrestamos();
      } else {
        this.presentToast(result.message || 'Error al eliminar el préstamo.', 'danger');
        console.error('❌ Error en Electron API al eliminar préstamo:', result.error);
      }
    } catch (err) {
      console.error('❌ Error al eliminar el préstamo:', err);
      this.presentToast('Error de comunicación al eliminar el préstamo.', 'danger');
    }
  }

  async showHistorialDevoluciones() {
    await this.utils.presentModal({
      component: HistorialDevolucionesComponent,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
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
      duration: 3000,
      color: color,
    });
    toast.present();
  }

  async editarPrestamo(prestamo: Prestamo) {
  const response = await this.utils.presentModal({
    component: AddUpdatePrestamoComponent,
    cssClass: 'modal-fullscreen',
    componentProps: {
      prestamo: prestamo
    }
  });

  if (response && response.success) {
    this.loadPrestamos();
  }
}
}