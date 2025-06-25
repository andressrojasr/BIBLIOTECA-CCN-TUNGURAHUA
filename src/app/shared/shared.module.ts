import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddUpdateBookComponent } from './modals/add-update-book/add-update-book.component';
import { AddUpdateUserComponent } from './modals/add-update-user/add-update-user.component';
import { AddPrestamoComponent } from './modals/add-prestamo/add-prestamo.component';
import { SelectUsuarioComponent } from './modals/select-usuario/select-usuario.component';
import { SelectBookComponent } from './modals/select-book/select-book.component';
import { InfoPrestamoComponent } from './modals/info-prestamo/info-prestamo.component';



@NgModule({
  declarations: [HeaderComponent, AddUpdateBookComponent, AddUpdateUserComponent, AddPrestamoComponent, SelectUsuarioComponent, SelectBookComponent, InfoPrestamoComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    HeaderComponent,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
