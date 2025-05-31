import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

interface LibroDevuelto {
  id: number;
  titulo: string;
  codigo: string;
}

interface HistorialDevolucion {
  id: number;
  prestamoId: number;
  usuarioId: number;
  usuarioNombres: string;
  usuarioApellidos: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  librosDevueltos: LibroDevuelto[];
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
    console.log('🔄 Cargando historial de devoluciones...');
    const result = await (window as any).electronAPI.getHistorialDevoluciones();
    
    console.log('📋 Resultado del historial:', result);
    
    if (result && result.success) {
      this.historial = result.historial || [];
      console.log('✅ Historial cargado:', this.historial.length, 'transacciones');
      
      // Verificación detallada de los datos
      this.historial.forEach(item => {
        if (!item.librosDevueltos || !Array.isArray(item.librosDevueltos)) {
          console.warn('⚠️ Formato incorrecto en librosDevueltos para préstamo:', item.prestamoId);
          item.librosDevueltos = [];
        }
      });
      
    } else {
      this.historial = [];
      const errorMsg = result?.message || 'No se pudo cargar el historial.';
      console.log('⚠️ Error al cargar historial:', errorMsg);
      this.presentToast(errorMsg, 'warning');
    }
    
    this.filterHistorial();
    
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
        
        // Búsqueda en los libros devueltos - MEJORADA
        const booksMatch = item.librosDevueltos?.some(libro => 
          libro.titulo?.toLowerCase().includes(searchTerm) ||
          libro.codigo?.toLowerCase().includes(searchTerm)
        ) || false;
        
        // Búsqueda por fecha
        const dateMatch = item.fechaDevolucion?.includes(searchTerm) || false;
        
        // Búsqueda por ID de préstamo
        const prestamoIdMatch = item.prestamoId?.toString().includes(searchTerm) || false;
        
        return userMatch || fullNameMatch || booksMatch || dateMatch || prestamoIdMatch;
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

  clearSearch() {
    this.searchTerm = '';
    this.filterHistorial();
  }

  async refreshHistorial() {
    await this.loadHistorialDevoluciones();
  }

  // Método utilitario para formatear fecha
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  // Método para obtener el texto descriptivo de los libros - MEJORADO
  getLibrosDescription(libros: LibroDevuelto[]): string {
    if (!libros || libros.length === 0) return 'Sin libros registrados';
    if (libros.length === 1) return '1 libro devuelto';
    return `${libros.length} libros devueltos`;
  }

  // NUEVO: Método para verificar si hay libros para mostrar
  hasLibros(libros: LibroDevuelto[]): boolean {
    return libros && libros.length > 0;
  }

  // NUEVO: Método para generar un ID único para la transacción
  getTransactionId(item: HistorialDevolucion): string {
    return `${item.prestamoId}-${this.formatDate(item.fechaDevolucion).replace(/\//g, '')}`;
  }

  // NUEVO: Método para calcular el total de libros devueltos
  getTotalLibrosDevueltos(): number {
    return this.filteredHistorial.reduce((total, item) => {
      return total + (item.librosDevueltos?.length || 0);
    }, 0);
  }
}