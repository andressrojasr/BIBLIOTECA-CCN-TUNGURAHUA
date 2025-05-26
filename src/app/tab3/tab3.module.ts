// src/app/tab3/tab3.module.ts
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Tab3Page } from './tab3.page';
import { Tab3PageRoutingModule } from './tab3-routing.module';

// ¡IMPORTANTE! Asegúrate de que SharedModule esté importado aquí
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule, // <-- ¡SharedModule debe estar aquí!
    Tab3PageRoutingModule
  ],
  declarations: [Tab3Page] // Tab3Page es un componente no-standalone y se declara aquí
})
export class Tab3PageModule {}