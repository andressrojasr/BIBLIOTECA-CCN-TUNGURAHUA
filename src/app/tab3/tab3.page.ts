import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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

  constructor(private utils: UtilsService, private toastCtrl: ToastController, private alertCtrl: AlertController, private cdr: ChangeDetectorRef) {
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
  
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  offset = 0;
  limit = 25; // Número de usuarios a cargar por petición
  loading = false;
  selectedFilter: string = 'id'; // Filtro por defecto


  async editUser(user: User) {
    let success = await this.utils.presentModal({
      component: AddUpdateUserComponent,
      cssClass: 'add-update-modal',
      componentProps: { user }
    })
    if (success) {
      this.offset = 0;
      this.users = [];
      this.filteredUsers = [];
      await this.loadMore();
      this.cdr.detectChanges();     
    };
  }
  
  async addUser(){
    let success = await this.utils.presentModal({
      component: AddUpdateUserComponent,
      cssClass: 'add-update-modal',
      componentProps: {  }
    })
    if (success) {
      const toast = await this.toastCtrl.create({
        message: 'Usuario agregado con éxito',
        duration: 3000,
        color: 'success'
      });
      toast.present()
      this.offset = 0;
      this.users = [];
      this.filteredUsers = [];
      await this.loadMore();
      this.cdr.detectChanges();
    } 
  }

  async loadMore(event?: any) {
    if (this.loading) return;

    this.loading = true;

    const result = await window.electronAPI.getUsers(this.offset, this.limit);
    this.users = [...this.users, ...result.users];
    this.filteredUsers = this.users
    this.offset += this.limit;
    this.loading = false;

    if (event) {
      event.target.complete();
      if (result.users.length < this.limit) {
        event.target.disabled = true;
      }
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
        this.offset = 0;
        this.users = [];
        this.filteredUsers = [];
        await this.loadMore();
        this.cdr.detectChanges();
      } else {
        const toast = await this.toastCtrl.create({
          message: result.message || 'Error al eliminar el usuario',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (err) {
      const toast = await this.toastCtrl.create({
          message: 'Error al eliminar el usuario' + err,
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
    }
  }

  async filterUsers(reset: boolean = true) {
  console.log('Filtrando usuarios con término:', this.searchTerm, 'y filtro:', this.selectedFilter);

  const searchTerm = this.searchTerm.trim().toLowerCase();

  if (reset) {
    this.offset = 0;       // Reinicia offset si es un nuevo término de búsqueda
    this.users = [];       // Reinicia resultados
    this.filteredUsers = [];
  }

  if (searchTerm === '') {
    this.loadMore(); // Si no hay término de búsqueda, cargar todos
    return;
  }

  if (this.loading) return;

  this.loading = true;

  try {
    const result = await window.electronAPI.getUser(this.offset, this.limit, this.selectedFilter, searchTerm);

    const newUsers = result.users || [];

    // Concatenar si no es reset
    this.users = reset ? newUsers : [...this.users, ...newUsers];
    this.filteredUsers = this.users;

    // Aumenta el offset para la próxima carga
    this.offset += this.limit;
  } catch (error) {
    const toast = await this.toastCtrl.create({
      message: 'Error al buscar usuario: ' + error,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  } finally {
    this.loading = false;
  }
}

}
