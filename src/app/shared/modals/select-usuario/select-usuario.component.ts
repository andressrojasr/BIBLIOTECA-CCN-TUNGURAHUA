import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController, ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-select-usuario',
  templateUrl: './select-usuario.component.html',
  styleUrls: ['./select-usuario.component.scss'],
  standalone: false,
})
export class SelectUsuarioComponent {

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
    
    users: User[] = [];
    filteredUsers: User[] = [];
    searchTerm: string = '';
    offset = 0;
    limit = 25; // Número de usuarios a cargar por petición
    loading = false;
    selectedFilter: string = 'id'; // Filtro por defecto
  
    async loadMore(event?: any) {
      if (this.loading) return;
  
      this.loading = true;
  
      const result = await window.electronAPI.getUsers(this.offset, this.limit);
      this.users = [...this.users, ...result.users];
      this.filteredUsers = this.users
      this.offset += this.limit;
      this.loading = false;
  
      event.target.complete();
  
      if (result.books.length < this.limit) {
        event.target.disabled = true; // No hay más libros
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

  select(usuario: User) {
    this.modalCtrl.dismiss(usuario);
  }

}
