import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Importar todos los componentes standalone que SharedModule necesita re-exportar
import { HeaderComponent } from './components/header/header.component';
import { AddUpdateBookComponent } from './modals/add-update-book/add-update-book.component';
import { AddUpdateUserComponent } from './modals/add-update-user/add-update-user.component';
import { AddUpdatePrestamoComponent } from './modals/add-update-prestamo/add-update-prestamo.component';
import { DevolverLibroComponent } from './modals/devolver-libro/devolver-libro.component';
import { HistorialDevolucionesComponent } from './modals/historial-devoluciones/historial-devoluciones.component';


@NgModule({
  declarations: [], // ¡Este array debe estar VACÍO si todos los componentes que usas son standalone!
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    // Importa todos los componentes standalone que este módulo re-exportará
    HeaderComponent,
    AddUpdateBookComponent,
    AddUpdateUserComponent, // <-- AÑADE ESTO
    AddUpdatePrestamoComponent,
    DevolverLibroComponent,
    HistorialDevolucionesComponent
  ],
  exports: [
    // Exporta todos los componentes (standalone o no) que otros módulos usarán
    HeaderComponent,
    AddUpdateBookComponent,
    AddUpdateUserComponent, // <-- AÑADE ESTO
    AddUpdatePrestamoComponent,
    DevolverLibroComponent,
    HistorialDevolucionesComponent
  ]
})
export class SharedModule { }