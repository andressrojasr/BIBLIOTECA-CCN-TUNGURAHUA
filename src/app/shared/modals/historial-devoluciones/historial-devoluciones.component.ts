import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

// Interfaz para el historial de devoluciones
interface LibroDevuelto {
  titulo: string;
  codigo: string;
}

interface HistorialDevolucion {
  id: number;
  usuarioNombres: string;
  usuarioApellidos: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  librosDevueltos: LibroDevuelto[];
  totalLibrosPrestamo?: number; // Total de libros en el préstamo original
  prestamoId?: number; // ID del préstamo original para referencia
}

@Component({
  selector: 'app-historial-devoluciones',
  templateUrl: './historial-devoluciones.component.html',
  styleUrls: ['./historial-devoluciones.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderComponent,
  ],
})
export class HistorialDevolucionesComponent implements OnInit {
  historial: HistorialDevolucion[] = [];
  filteredHistorial: HistorialDevolucion[] = [];
  searchTerm: string = '';
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
      const result = await (window as any).electronAPI.getHistorialDevoluciones();
      
      if (result && result.success) {
        this.historial = result.historial || [];
        console.log('✅ Historial cargado:', this.historial);
      } else if (Array.isArray(result)) {
        // Si el resultado es directamente un array (compatibilidad)
        this.historial = result;
      } else {
        this.historial = [];
        this.presentToast(result?.message || 'No se pudo cargar el historial.', 'warning');
      }
      
      this.filterHistorial();
      
      if (this.historial.length === 0) {
        console.log('ℹ️ No hay historial de devoluciones disponible');
      }
    } catch (error) {
      console.error('❌ Error al cargar historial de devoluciones:', error);
      this.historial = [];
      this.filteredHistorial = [];
      this.presentToast('Error al cargar el historial de devoluciones.', 'danger');
    } finally {
      this.isProcessing = false;
    }
  }

  filterHistorial() {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    
    if (searchTerm === '') {
      this.filteredHistorial = [...this.historial];
    } else {
      this.filteredHistorial = this.historial.filter(item => {
        // Búsqueda por nombre del usuario
        const userMatch = (item.usuarioNombres?.toLowerCase().includes(searchTerm) || false) ||
                         (item.usuarioApellidos?.toLowerCase().includes(searchTerm) || false);
        
        // Búsqueda por nombre completo del usuario
        const fullNameMatch = `${item.usuarioNombres} ${item.usuarioApellidos}`.toLowerCase().includes(searchTerm);
        
        // Búsqueda en los libros devueltos
        const booksMatch = item.librosDevueltos?.some(libro => 
          libro.titulo?.toLowerCase().includes(searchTerm) ||
          libro.codigo?.toLowerCase().includes(searchTerm)
        ) || false;
        
        return userMatch || fullNameMatch || booksMatch;
      });
    }
    
    console.log(`🔍 Búsqueda: "${searchTerm}" - Resultados: ${this.filteredHistorial.length}/${this.historial.length}`);
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

  cancel() {
    this.modalCtrl.dismiss();
  }

  // Método adicional para limpiar la búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.filterHistorial();
  }

  // Método para refrescar el historial
  async refreshHistorial() {
    await this.loadHistorialDevoluciones();
  }
}