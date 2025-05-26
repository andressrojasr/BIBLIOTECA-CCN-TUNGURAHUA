// src/app/tab3/tab3.module.ts
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Tab3Page } from './tab3.page';
import { Tab3PageRoutingModule } from './tab3-routing.module';

// AÑADIR ESTAS LÍNEAS para importar los componentes standalone
import { AddUpdateUserComponent } from '../shared/modals/add-update-user/add-update-user.component';
import { HeaderComponent } from '../shared/components/header/header.component';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab3PageRoutingModule,
    // AÑADIR ESTOS COMPONENTES STANDALONE
    AddUpdateUserComponent,
    HeaderComponent,
  ],
  declarations: [Tab3Page]
})
export class Tab3PageModule {}