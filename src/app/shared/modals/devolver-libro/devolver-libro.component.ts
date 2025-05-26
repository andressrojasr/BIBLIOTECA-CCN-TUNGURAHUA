// src/app/shared/modals/devolver-libro/devolver-libro.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Prestamo, PrestamoLibro } from '../../../models/prestamo.model'; // Asegúrate de que la ruta sea correcta
import { Book } from '../../../models/book.model'; // Asegúrate de que la ruta sea correcta
import { SharedModule } from '../../shared.module'; // Importa tu SharedModule si lo usas

// NO necesitas el declare global aquí, ya lo tienes en src/types/electron.d.ts

@Component({
  selector: 'app-devolver-libro',
  templateUrl: './devolver-libro.component.html',
  styleUrls: ['./devolver-libro.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule // Si usas app-header u otros componentes compartidos aquí
  ],
})
export class DevolverLibroComponent implements OnInit {
  @Input() prestamo!: Prestamo; // El préstamo que se pasa desde tab1.page.ts

  devolucionForm!: FormGroup;
  librosDisponiblesParaDevolucion: PrestamoLibro[] = [];
  selectedLibrosToDevolver: number[] = []; // Array de IDs de los libros seleccionados para devolver

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController
  ) {
    this.initDevolucionForm();
  }

  ngOnInit() {
    if (this.prestamo && this.prestamo.libros) {
      // Los libros asociados al préstamo se pasan como 'prestamo.libros'
      this.librosDisponiblesParaDevolucion = this.prestamo.libros;
      console.log('✅ Libros del préstamo en modal de devolución:', this.librosDisponiblesParaDevolucion);
    } else {
      console.warn('⚠️ No se recibieron libros para este préstamo en el modal de devolución.');
      this.presentToast('No se encontraron libros para este préstamo.', 'warning');
    }
  }

  initDevolucionForm() {
    this.devolucionForm = this.formBuilder.group({
      // Aquí el control 'libroIds' va a manejar la selección múltiple
      libroIds: [[], Validators.required]
    });
  }

  // Método para manejar la selección de libros (Ion-select múltiple)
  onBookSelectionChange(event: any) {
    this.selectedLibrosToDevolver = event.detail.value; // Array de IDs de libros seleccionados
    console.log('Libros seleccionados para devolver:', this.selectedLibrosToDevolver);
  }

  async confirmarDevolucion() {
    if (this.devolucionForm.invalid || this.selectedLibrosToDevolver.length === 0) {
      this.presentToast('Por favor, selecciona al menos un libro para devolver.', 'warning');
      return;
    }

    try {
      const result = await window.electronAPI.devolverLibros({
        prestamoId: this.prestamo.id,
        libroIds: this.selectedLibrosToDevolver, // <-- ¡CORRECCIÓN AQUÍ!
      });

      if (result.success) {
        this.presentToast(result.message, 'success');
        this.modalCtrl.dismiss(true); // Cerrar modal y pasar 'true' para indicar éxito
      } else {
        this.presentToast('Error al procesar la devolución: ' + result.message, 'danger');
        console.error('❌ Error al procesar devolución:', result.error);
      }
    } catch (error) {
      this.presentToast('Error de comunicación con Electron al devolver libros.', 'danger');
      console.error('❌ Error en Electron API al devolver libros:', error);
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
    });
    toast.present();
  }

  closeModal() {
    this.modalCtrl.dismiss(false); // Cerrar modal y pasar 'false' para indicar cancelación
  }
}