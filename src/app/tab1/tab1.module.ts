import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Tab1PageRoutingModule } from './tab1-routing.module';
// No necesitas importar Tab1Page aquí si es standalone y no lo vas a declarar
// import { Tab1Page } from './tab1.page';
import { SharedModule } from '../shared/shared.module'; // Asegúrate de que esta importación sea correcta

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab1PageRoutingModule,
    SharedModule // Si Tab1Page usa componentes del SharedModule, mantenlo aquí
  ],
  // Elimina Tab1Page del array declarations
  declarations: []
})
export class Tab1PageModule {}