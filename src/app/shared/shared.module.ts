import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// ¡Los componentes que hemos hecho standalone YA NO SE DECLARAN aquí!
// Eliminar las siguientes líneas de importación si los archivos no-standalone ya no existen
// import { AddUpdateBookComponent } from './modals/add-update-book/add-update-book.component';
// import { AddUpdateUserComponent } from './modals/add-update-user/add-update-user.component';

// Importar todos los componentes standalone que SharedModule necesita re-exportar
import { HeaderComponent } from './components/header/header.component';
import { AddUpdateBookComponent } from './modals/add-update-book/add-update-book.component'; // <-- ¡AÑADIDO!
import { AddUpdateUserComponent } from './modals/add-update-user/add-update-user.component'; // <-- ¡AÑADIDO!
import { AddUpdatePrestamoComponent } from './modals/add-update-prestamo/add-update-prestamo.component';
import { DevolverLibroComponent } from './modals/devolver-libro/devolver-libro.component';
import { HistorialDevolucionesComponent } from './modals/historial-devoluciones/historial-devoluciones.component';


@NgModule({
  declarations: [
    // ¡Este array debe estar VACÍO si todos los componentes que solías declarar ahora son standalone!
    // Solo si tienes componentes NO-standalone que aún necesiten ser declarados aquí, ponlos.
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    // Importa todos los componentes standalone que este módulo re-exportará
    HeaderComponent
  ],
  exports: [
    // Exporta todos los componentes (standalone o no) que otros módulos usarán
    HeaderComponent
  ]
})
export class SharedModule { }