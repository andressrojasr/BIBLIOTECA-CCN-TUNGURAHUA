// src/app/shared/modals/devolver-libro/devolver-libro.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Prestamo, PrestamoLibro } from '../../../models/prestamo.model';
import { Book } from '../../../models/book.model';
import { HeaderComponent } from '../../components/header/header.component'; // <-- ¡AÑADIDA ESTA LÍNEA!
// ELIMINAR ESTA LÍNEA: import { SharedModule } from '../../shared.module'; // NO DEBE IMPORTARSE AQUÍ SI ES STANDALONE

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
    HeaderComponent // <-- ¡AÑADIDA ESTA LÍNEA y reemplaza a SharedModule!
  ],
})
export class DevolverLibroComponent implements OnInit {
  @Input() prestamo!: Prestamo; // El préstamo que se pasa desde tab1.page.ts

  devolucionForm!: FormGroup;
  librosDisponiblesParaDevolucion: PrestamoLibro[] = [];
  selectedLibrosToDevolver: number[] = [];

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController
  ) {
    this.initDevolucionForm();
  }

  ngOnInit() {
    if (this.prestamo && this.prestamo.libros) {
      this.librosDisponiblesParaDevolucion = this.prestamo.libros;
      console.log('✅ Libros del préstamo en modal de devolución:', this.librosDisponiblesParaDevolucion);
    } else {
      console.warn('⚠️ No se recibieron libros para este préstamo en el modal de devolución.');
      this.presentToast('No se encontraron libros para este préstamo.', 'warning');
    }
  }

  initDevolucionForm() {
    this.devolucionForm = this.formBuilder.group({
      libroIds: [[], Validators.required]
    });
  }

  onBookSelectionChange(event: any) {
    this.selectedLibrosToDevolver = event.detail.value;
    console.log('Libros seleccionados para devolver:', this.selectedLibrosToDevolver);
  }

  async confirmarDevolucion() {
    if (this.devolucionForm.invalid || this.selectedLibrosToDevolver.length === 0) {
      this.presentToast('Por favor, selecciona al menos un libro para devolver.', 'warning');
      return;
    }

    try {
      const result = await (window as any).electronAPI.devolverLibros({
        prestamoId: this.prestamo.id,
        libroIds: this.selectedLibrosToDevolver,
      });

      if (result.success) {
        this.presentToast(result.message, 'success');
        this.modalCtrl.dismiss(true);
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
    this.modalCtrl.dismiss(false);
  }
}