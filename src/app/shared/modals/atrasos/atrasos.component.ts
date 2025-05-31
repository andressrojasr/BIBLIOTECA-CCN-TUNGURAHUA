import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { Prestamo } from '../../../models/prestamo.model';
import { UtilsService } from '../../../services/utils.service';
import { DevolverLibroComponent } from '../devolver-libro/devolver-libro.component';

@Component({
  selector: 'app-atrasos',
  templateUrl: './atrasos.component.html',
  styleUrls: ['./atrasos.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponent
  ],
})
export class AtrasosComponent implements OnInit {

  prestamosAtrasados: Prestamo[] = [];
  isLoading: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private utils: UtilsService
  ) {}

  async ngOnInit() {
    console.log('🔄 Iniciando AtrasosComponent');
    await this.loadPrestamosAtrasados();
  }

  async loadPrestamosAtrasados() {
    this.isLoading = true;
    try {
      console.log('📚 Cargando préstamos atrasados...');
      const result = await (window as any).electronAPI.getPrestamos();
      
      if (result.success) {
        // Filtrar préstamos con más de 30 días sin devolver
        const today = new Date();
        this.prestamosAtrasados = result.prestamos.filter((prestamo: Prestamo) => {
          // Solo considerar préstamos que no han sido devueltos
          if (prestamo.fechaDevolucion) {
            return false;
          }
          
          const fechaPrestamo = new Date(prestamo.fechaPrestamo);
          const diffTime = Math.abs(today.getTime() - fechaPrestamo.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return diffDays > 30;
        });
        
        console.log('✅ Préstamos atrasados encontrados:', this.prestamosAtrasados.length);
        console.log('📋 Préstamos atrasados:', this.prestamosAtrasados);
        
      } else {
        console.error('❌ Error al cargar préstamos:', result.message);
        this.presentToast('Error al cargar préstamos: ' + result.message, 'danger');
      }
    } catch (error) {
      console.error('❌ Error cargando préstamos atrasados:', error);
      this.presentToast('Error de comunicación al cargar préstamos.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  getDiasAtraso(fechaPrestamo: string): number {
    const today = new Date();
    const fechaPrest = new Date(fechaPrestamo);
    const diffTime = Math.abs(today.getTime() - fechaPrest.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getTotalLibrosAtrasados(): number {
    return this.prestamosAtrasados.reduce((total, prestamo) => {
      return total + prestamo.libros.length;
    }, 0);
  }

  async mostrarDetallesDevolucion(prestamo: Prestamo) {
    console.log('🔄 Abriendo modal de devolución para préstamo:', prestamo.id);
    
    const response = await this.utils.presentModal({
      component: DevolverLibroComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        prestamo: prestamo
      }
    });

    if (response && response.success) {
      console.log('✅ Devolución exitosa, recargando préstamos atrasados');
      await this.loadPrestamosAtrasados();
      this.presentToast('Devolución procesada correctamente', 'success');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}