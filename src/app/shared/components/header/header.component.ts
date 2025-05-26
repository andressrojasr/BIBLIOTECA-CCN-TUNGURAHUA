import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    // Si HeaderComponent usa formularios, añade FormsModule y/o ReactiveFormsModule
  ]
})
export class HeaderComponent implements OnInit {
  @Input() title: string = '';
  @Input() showCloseSessionButton: boolean = false;
  @Input() isModal: boolean = false;
  @Input() showBackButton: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  // Método para volver a la página anterior
  goBack() {
    this.location.back();
  }

  // Método para cerrar un modal
  async dismissModal() {
    // Solo intenta cerrar el modal si el componente actual está siendo usado como modal
    if (this.isModal) {
        await this.modalCtrl.dismiss(null, 'cancel');
    } else {
        // Si no es un modal, puedes optar por la navegación "atrás" por defecto
        // o a una ruta específica si es necesario.
        this.location.back();
    }
  }

  closeSession() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}