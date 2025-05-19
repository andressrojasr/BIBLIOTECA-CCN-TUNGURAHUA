import { Component, ViewChild } from '@angular/core';
import { AlertController, IonContent, ToastController } from '@ionic/angular';
import { UtilsService } from '../services/utils.service';
import { User } from '../models/user.model';
import { AddUpdateUserComponent } from '../shared/modals/add-update-user/add-update-user.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
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
      component: AddUpdateUserComponent,
      cssClass: 'add-update-modal',
      componentProps: { user }
    })
    if (success) {
      this.loadUsers();
    };
  }
  
  async addUser(){
    let success = await this.utils.presentModal({
      component: AddUpdateUserComponent,
      cssClass: 'add-update-modal',
      componentProps: {  }
    })
    if (success) 'Agregado con exito';
  }


  async loadUsers() {
    try {
      const result = await window.electronAPI.getUsers();
      if (result.success) {
        this.users = result.users || [];
        this.filteredUsers = this.users; // Inicializa filteredUsers con todos los libros
      } else {
        console.warn('No se encontraron libros.');
      }
    } catch (err) {
      console.error('Error al obtener libros:', err);
    }
  }

  async confirmDelete(user: User) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar usuario?',
      message: `¿Estás seguro de eliminar el usuario ${user.nombres} ${user.apellidos}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
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
                String(user.id).toLowerCase().includes(searchTerm)
              );
            });
          }
  }

}
