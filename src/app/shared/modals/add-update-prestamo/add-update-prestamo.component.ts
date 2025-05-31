import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { User } from '../../../models/user.model';
import { Book } from '../../../models/book.model';
import { Prestamo } from '../../../models/prestamo.model';
import { HeaderComponent } from '../../components/header/header.component';

interface PrestamoLibro {
  id: number;
  titulo: string;
  codigo: string;
}

@Component({
  selector: 'app-add-update-prestamo',
  templateUrl: './add-update-prestamo.component.html',
  styleUrls: ['./add-update-prestamo.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderComponent
  ],
})
export class AddUpdatePrestamoComponent implements OnInit {
  @Input() prestamo: Prestamo | null = null;

  title: string = 'Registrar Nuevo Préstamo';
  prestamoForm!: FormGroup;
  users: User[] = [];
  usuarios: User[] = [];
  books: Book[] = [];
  selectedBooks: Book[] = [];
  isProcessing: boolean = false;
  currentDate: string = new Date().toISOString();
  usuarioNombre: string = '';

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController
  ) {
    this.initForm();
  }

  async ngOnInit() {
    console.log('🔄 Iniciando AddUpdatePrestamoComponent');
    console.log('📋 Prestamo recibido:', this.prestamo);
    
    if (this.prestamo) {
      this.title = 'Actualizar Préstamo';
      this.usuarioNombre = 'Cargando usuario...';
      
      // Cargar usuarios y libros en paralelo
      await Promise.all([
        this.loadUsers(),
        this.loadBooks()
      ]);
      
      // Una vez cargados los datos, actualizar el formulario
      this.patchFormWithPrestamoData();
      this.updateUsuarioNombre();
    } else {
      await Promise.all([
        this.loadUsers(),
        this.loadBooks()
      ]);
    }
  }

  initForm() {
    this.prestamoForm = this.formBuilder.group({
      usuarioId: ['', Validators.required],
      fechaPrestamo: [new Date().toISOString(), Validators.required],
    });
  }

  patchFormWithPrestamoData() {
    if (this.prestamo && this.books.length > 0) {
      console.log('📝 Aplicando datos del préstamo al formulario');
      
      this.prestamoForm.patchValue({
        usuarioId: this.prestamo.usuarioId,
        fechaPrestamo: this.prestamo.fechaPrestamo
      });

      // Mapear los libros seleccionados
      if (this.prestamo.libros && Array.isArray(this.prestamo.libros)) {
        this.selectedBooks = this.prestamo.libros
          .map((prestamoLibro: PrestamoLibro) => {
            const book = this.books.find(book => book.id === prestamoLibro.id);
            console.log(`🔍 Buscando libro ID ${prestamoLibro.id}:`, book ? 'Encontrado' : 'No encontrado');
            return book;
          })
          .filter((book): book is Book => book !== undefined);
        
        console.log('📚 Libros seleccionados mapeados:', this.selectedBooks);
      }
    }
  }

  updateUsuarioNombre(): void {
    if (this.prestamo && this.usuarios.length > 0) {
      console.log('👤 Actualizando nombre de usuario');
      console.log('🔍 Buscando usuario con ID:', this.prestamo.usuarioId);
      console.log('📋 Usuarios disponibles:', this.usuarios.map(u => ({ id: u.id, nombres: u.nombres, apellidos: u.apellidos })));
      
      const usuario = this.usuarios.find(u => u.id === this.prestamo?.usuarioId);
      
      if (usuario) {
        this.usuarioNombre = `${usuario.nombres} ${usuario.apellidos} (${usuario.cedula})`;
        console.log('✅ Usuario encontrado:', this.usuarioNombre);
      } else {
        this.usuarioNombre = 'Usuario no encontrado';
        console.error('❌ Usuario no encontrado para ID:', this.prestamo.usuarioId);
      }
    }
  }

  async loadUsers() {
    try {
      console.log('👥 Cargando usuarios...');
      const result = await (window as any).electronAPI.getUsuarios();
      if (result.success) {
        this.usuarios = result.users;
        console.log('✅ Usuarios cargados:', this.usuarios.length);
        console.log('📋 Primeros usuarios:', this.usuarios.slice(0, 3).map(u => ({ id: u.id, nombres: u.nombres, apellidos: u.apellidos })));
      } else {
        console.error('❌ Error al cargar usuarios:', result.message);
        this.presentToast('Error al cargar usuarios: ' + result.message, 'danger');
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      this.presentToast('Error al cargar usuarios', 'danger');
      this.usuarioNombre = 'Error al cargar usuario';
    }
  }

  async loadBooks() {
    try {
      console.log('📚 Cargando libros...');
      const result = await (window as any).electronAPI.getBooks();
      console.log('📚 Resultado de getBooks en AddUpdatePrestamo:', result);
      
      if (result.success) {
        this.books = result.books;
        console.log('✅ Libros cargados:', this.books.length);
      } else {
        console.error('❌ Error al cargar libros:', result.message);
        this.presentToast('Error al cargar libros: ' + result.message, 'danger');
      }
    } catch (error) {
      console.error('❌ Error cargando libros desde Electron:', error);
      this.presentToast('Error de comunicación al cargar libros.', 'danger');
    }
  }

  async addBookToPrestamo(event: any) {
    const bookId = event.detail.value;
    const selectedBook = this.books.find(b => b.id === bookId);

    if (selectedBook) {
      const availability = await (window as any).electronAPI.checkBookAvailabilityForPrestamo(bookId);
      
      if (availability.success && availability.canLend) {
        if (!this.selectedBooks.some(b => b.id === bookId)) {
          if (this.selectedBooks.length < 3) {
            this.selectedBooks.push(selectedBook);
          } else {
            this.presentToast('Solo se pueden prestar un máximo de 3 libros.', 'warning');
          }
        }
      } else {
        this.presentToast(availability.message || 'No hay ejemplares disponibles de este libro', 'warning');
      }
    }
    event.target.value = undefined;
  }

  removeBookFromPrestamo(bookToRemove: Book) {
    this.selectedBooks = this.selectedBooks.filter(book => book.id !== bookToRemove.id);
  }

  async confirmarPrestamo() {
    if (this.prestamoForm.invalid || this.selectedBooks.length === 0 || this.selectedBooks.length > 3) {
      this.presentToast('Por favor, completa todos los campos requeridos y selecciona entre 1 y 3 libros.', 'warning');
      return;
    }

    this.isProcessing = true;
    const formValue = this.prestamoForm.value;

    const prestamoData = {
      userId: this.prestamo ? this.prestamo.usuarioId : formValue.usuarioId,
      libros: this.selectedBooks.map(book => ({ id: book.id, titulo: book.titulo, codigo: book.codigo })),
      fechaPrestamo: formValue.fechaPrestamo
    };

    console.log('💾 Datos a enviar:', prestamoData);

    try {
      let result;
      if (this.prestamo && this.prestamo.id) {
        console.log('🔄 Actualizando préstamo ID:', this.prestamo.id);
        result = await (window as any).electronAPI.updatePrestamo({ ...prestamoData, id: this.prestamo.id });
      } else {
        console.log('➕ Creando nuevo préstamo');
        result = await (window as any).electronAPI.insertPrestamo(prestamoData);
      }

      if (result.success) {
        this.presentToast(
          this.prestamo ? 'Préstamo actualizado correctamente' : 'Préstamo registrado correctamente', 
          'success'
        );
        this.modalCtrl.dismiss(true);
      } else {
        this.presentToast('Error al registrar/actualizar el préstamo: ' + result.message, 'danger');
        console.error('❌ Error en Electron API al registrar/actualizar préstamo:', result.error);
      }
    } catch (error) {
      this.presentToast('Error de comunicación al registrar/actualizar el préstamo.', 'danger');
      console.error('❌ Error de comunicación al registrar/actualizar el préstamo:', error);
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

  closeModal() {
    this.modalCtrl.dismiss(false);
  }
}