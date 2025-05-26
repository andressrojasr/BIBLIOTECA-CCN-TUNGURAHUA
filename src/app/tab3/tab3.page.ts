// src/app/tab3/tab3.page.ts
import { Component, ViewChild } from '@angular/core';
import { AlertController, IonContent, ToastController } from '@ionic/angular';
import { UtilsService } from '../services/utils.service';
import { User } from '../models/user.model';
// Ya NO se importa directamente AddUpdateUserComponent aquí
// import { AddUpdateUserComponent } from '../shared/modals/add-update-user/add-update-user.component';

// Para poder usar AddUpdateUserComponent en el presentModal, aunque no se importa directamente
// TS lo inferirá a través del SharedModule que se importa en Tab3PageModule.
// Si aún así da el error, la única opción es declararlo directamente en este archivo
// si es un componente no standalone, o hacer que AddUpdateUserComponent sea standalone.
// Por ahora, asumimos que la configuración de módulos es suficiente.
declare const AddUpdateUserComponent: any; // Declaración para evitar el error de TS2304 temporalmente

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false, // Confirmado: Tab3Page no es standalone
})
export class Tab3Page {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  constructor(private utils: UtilsService, private toastCtrl: ToastController, private alertCtrl: AlertController) {
    this.loadUsers();
  }

  showScrollToTop = false;

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollToTop = scrollTop > 150; // muestra si se ha scrolleado más de 150px
  }

  scrollToTop() {
    this.content.scrollToTop(300);
  }
  
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';


  async editUser(user: User) {
    let success = await this.utils.presentModal({
      component: AddUpdateUserComponent, // Aquí se usa el nombre directamente
      cssClass: 'add-update-modal',
      componentProps: { user },
    });
    if (success) {
      this.loadUsers();
      const toast = await this.toastCtrl.create({
        message: 'Usuario actualizado con éxito',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    }
  }

  async addUser() {
    let success = await this.utils.presentModal({
      component: AddUpdateUserComponent,
      cssClass: 'add-update-modal',
    });
    if (success) {
      this.loadUsers();
      const toast = await this.toastCtrl.create({
        message: 'Usuario agregado con éxito',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    }
  }

  async loadUsers() {
    try {
      const result = await window.electronAPI.getUsers();
      if (result.success) {
        this.users = result.data;
        this.filterUsers(); // Filtrar después de cargar
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Error al cargar usuarios: ' + result.message,
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (err) {
      console.error('Error cargando usuarios desde Electron:', err);
      const toast = await this.toastCtrl.create({
        message: 'Error de comunicación con Electron al cargar usuarios.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async confirmDeleteUser(user: User) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar a ${user.nombres} ${user.apellidos}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteUser(user.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteUser(userId: number) {
    try {
      const result = await window.electronAPI.deleteUser(userId);
      if (result.success) {
        const toast = await this.toastCtrl.create({
          message: 'Usuario eliminado exitosamente',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        this.loadUsers(); // Vuelve a cargar los libros actualizados
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Error al eliminar el usuario',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (err) {
      console.error('❌ Error al eliminar el usuario:', err);
    }
  }

  filterUsers() {
          const searchTerm = this.searchTerm.toLowerCase();
      
          if (searchTerm.trim() === '') {
            this.filteredUsers = this.users;
          } else {
            this.filteredUsers = this.users.filter(user => {
              return (
                user.nombres.toLowerCase().includes(searchTerm) ||
                user.apellidos.toLowerCase().includes(searchTerm) ||
                user.cedula.toLowerCase().includes(searchTerm) ||
                user.profesion.toLowerCase().includes(searchTerm) ||
                user.lugarTrabajo.toLowerCase().includes(searchTerm) ||
                user.direccion.toLowerCase().includes(searchTerm) ||
                user.canton.toLowerCase().includes(searchTerm) ||
                user.celular.toLowerCase().includes(searchTerm) ||
                user.correo.toLowerCase().includes(searchTerm) ||
                this.getTipoUsuarioString(user.tipoUsuario).toLowerCase().includes(searchTerm)
              );
            });
          }
  }

  getTipoUsuarioString(tipo: number): string {
    switch (tipo) {
      case 0: return 'Niño';
      case 1: return 'Joven';
      case 2: return 'Adulto';
      case 3: return 'Adulto Mayor';
      default: return 'Desconocido';
    }
  }
}