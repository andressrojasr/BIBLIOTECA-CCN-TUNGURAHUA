import { Component, inject, Input, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent  implements OnInit {

  @Input() title: string = '';
  @Input() showBackButton: boolean = false;
  @Input() showCloseSessionButton: boolean = false;

  navigateCtrl = inject(NavController);
  toastCtrl = inject(ToastController);
  
  constructor() { }

  ngOnInit() {}

  goBack() {
    window.history.back();
  }

  async closeSession() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user){
      localStorage.removeItem('user');
      this.navigateCtrl.navigateRoot('/login');
      const toast = await this.toastCtrl.create({
              message: 'Sesión cerrada exitosamente',
              duration: 2000,
              color: 'success',
            });
            await toast.present();
    }
  }
}
