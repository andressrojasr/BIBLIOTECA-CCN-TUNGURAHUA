import { Component, ViewChild, OnInit } from '@angular/core';
import { AlertController, IonContent, ModalController, ToastController } from '@ionic/angular'; // Asegúrate de que ModalController esté aquí
import { UtilsService } from '../services/utils.service';
import { User } from '../models/user.model';
import { AddUpdateUserComponent } from '../shared/modals/add-update-user/add-update-user.component'; // Importa el componente AddUpdateUserComponent

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  users: User[] = []; // Esta será la lista completa de usuarios de la tabla 'usuarios'
  filteredUsers: User[] = []; // Esta será la lista de usuarios filtrados
  searchTerm: string = '';
  showScrollToTop = false;

  constructor(
    private utils: UtilsService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController // Inyecta ModalController
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ionViewWillEnter() {
    // Se ejecuta cada vez que la vista va a entrar en pantalla
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const result = await (window as any).electronAPI.getUsuarios();
      if (result.success) {
        this.users = result.users;
        this.filterUsers(); // Aplica el filtro inicial después de cargar los usuarios
        console.log('✅ Usuarios cargados desde Electron:', this.users);
      } else {
        console.error('❌ Error cargando usuarios desde Electron (success: false):', result.message);
        this.presentToast('Error al cargar usuarios: ' + result.message, 'danger');
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios desde Electron:', error);
      this.presentToast('Error de comunicación al cargar usuarios.', 'danger');
    }
  }

  filterUsers() {
    const searchTermLower = this.searchTerm.toLowerCase();

    if (searchTermLower.trim() === '') {
      this.filteredUsers = [...this.users]; // Crea una copia para no modificar el array original
    } else {
      this.filteredUsers = this.users.filter(user => {
        return (
          (user.nombres && user.nombres.toLowerCase().includes(searchTermLower)) ||
          (user.apellidos && user.apellidos.toLowerCase().includes(searchTermLower)) ||
          (user.cedula && user.cedula.toLowerCase().includes(searchTermLower)) ||
          (user.profesion && user.profesion.toLowerCase().includes(searchTermLower)) ||
          (user.lugarTrabajo && user.lugarTrabajo.toLowerCase().includes(searchTermLower)) ||
          (user.direccion && user.direccion.toLowerCase().includes(searchTermLower)) ||
          (user.canton && user.canton.toLowerCase().includes(searchTermLower)) ||
          (user.celular && user.celular.toLowerCase().includes(searchTermLower)) ||
          (user.correo && user.correo.toLowerCase().includes(searchTermLower)) ||
          this.getTipoUsuarioString(user.tipoUsuario).toLowerCase().includes(searchTermLower)
        );
      });
    }
  }

  getTipoUsuarioString(tipo: number | undefined): string {
    if (tipo === undefined || tipo === null) return 'Desconocido'; // Manejo para tipo indefinido o nulo
    switch (tipo) {
      case 0: return 'Niño';
      case 1: return 'Joven';
      case 2: return 'Adulto';
      case 3: return 'Adulto Mayor';
      default: return 'Desconocido';
    }
  }

  async addUser() {
    const modal = await this.modalCtrl.create({
      component: AddUpdateUserComponent,
      componentProps: {
        user: null // Para agregar un nuevo usuario, se pasa null
      }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) { // Si el modal fue cerrado con éxito (se agregó/actualizó un usuario)
      this.loadUsers(); // Recargar usuarios
    }
  }

  async editUser(user: User) { // Método para editar usuario
    const modal = await this.modalCtrl.create({
      component: AddUpdateUserComponent,
      componentProps: {
        user: user // Se pasa el objeto de usuario existente para editar
      }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) { // Si el modal fue cerrado con éxito (se agregó/actualizó un usuario)
      this.loadUsers(); // Recargar usuarios
    }
  }

  async confirmDelete(user: User) { // Método para confirmar y eliminar usuario
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar a ${user.nombres} ${user.apellidos}? Esta acción es irreversible.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            // Asume que user.id existe para la eliminación
            if (user.id !== undefined && user.id !== null) {
              await this.deleteUser(user.id);
            } else {
              this.presentToast('Error: ID de usuario no disponible para eliminar.', 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteUser(userId: number) { // Método para eliminar usuario (llamado desde confirmDelete)
    try {
      const result = await (window as any).electronAPI.deleteUsuario(userId);
      if (result.success) {
        this.presentToast(result.message, 'success');
        this.loadUsers(); // Recargar usuarios después de eliminar
      } else {
        this.presentToast('Error al eliminar usuario: ' + result.message, 'danger');
        console.error('❌ Error en Electron API al eliminar usuario:', result.error);
      }
    } catch (error) {
      this.presentToast('Error de comunicación al eliminar usuario.', 'danger');
      console.error('❌ Error de comunicación al eliminar usuario:', error);
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
    });
    toast.present();
  }

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollToTop = scrollTop > 150;
  }

  scrollToTop() {
    this.content.scrollToTop(300);
  }
}