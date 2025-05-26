import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';
// import { SharedModule } from '../shared/shared.module'; // <-- ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ COMENTADA O ELIMINADA!

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    // SharedModule // ¡ASEGÚRATE DE QUE ESTA LÍNEA TAMBIÉN ESTÉ COMENTADA O ELIMINADA!
  ],
  declarations: [] // Correcto para un LoginPage standalone
})
export class LoginPageModule {}