import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component'; // <-- ¡AÑADIDA ESTA LÍNEA!
// ELIMINAR ESTA LÍNEA: import { SharedModule } from '../../shared.module'; // NO DEBE IMPORTARSE AQUÍ SI ES STANDALONE

@Component({
  selector: 'app-historial-devoluciones',
  templateUrl: './historial-devoluciones.component.html',
  styleUrls: ['./historial-devoluciones.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponent, // <-- ¡AÑADIDA ESTA LÍNEA y reemplaza a SharedModule!
  ],
})
export class HistorialDevolucionesComponent implements OnInit {
  historial: any[] = [];
  isProcessing: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadHistorialDevoluciones();
  }

  async loadHistorialDevoluciones() {
    this.isProcessing = true;
    try {
      this.historial = await (window as any).electronAPI.getHistorialDevoluciones();
      if (this.historial.length === 0) {
        this.presentToast('No hay historial de devoluciones.', 'info');
      }
    } catch (error) {
      console.error('Error al cargar historial de devoluciones:', error);
      this.presentToast('Error al cargar el historial de devoluciones.', 'danger');
    } finally {
      this.isProcessing = false;
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

  cancel() {
    this.modalCtrl.dismiss();
  }
}