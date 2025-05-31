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

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadUsers();
    this.loadBooks();
    if (this.prestamo) {
      this.title = 'Actualizar Préstamo';
    }
  }

  initForm() {
    this.prestamoForm = this.formBuilder.group({
      usuarioId: ['', Validators.required],
      fechaPrestamo: [new Date().toISOString(), Validators.required],
    });
  }

  async patchFormWithPrestamoData() {
    if (this.prestamo && this.books.length > 0) {
      this.prestamoForm.patchValue({
        usuarioId: this.prestamo.usuarioId,
        fechaPrestamo: this.prestamo.fechaPrestamo
      });

      if (this.prestamo.libros) {
        this.selectedBooks = this.prestamo.libros
          .map((prestamoLibro: PrestamoLibro) =>
            this.books.find(book => book.id === prestamoLibro.id)
          )
          .filter((book): book is Book => book !== undefined);
      }
    }
  }

  async loadUsers() {
  try {
    const result = await (window as any).electronAPI.getUsuarios();
    if (result.success) {
      this.usuarios = result.users;
      console.log('✅ Usuarios cargados:', this.usuarios);
      
      if (this.prestamo) {
        // Buscar el usuario específico del préstamo
        const usuarioPrestamo = this.usuarios.find(u => u.id === this.prestamo?.usuarioId);
        if (usuarioPrestamo) {
          console.log('Usuario encontrado:', usuarioPrestamo);
          this.prestamoForm.patchValue({
            usuarioId: this.prestamo.usuarioId
          });
        } else {
          console.warn('Usuario no encontrado para el préstamo');
        }
      }
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    this.presentToast('Error al cargar usuarios', 'danger');
  }
}

getUsuarioNombre(): string {
  if (this.prestamo) {
    const usuario = this.usuarios.find(u => u.id === this.prestamo?.usuarioId);
    if (!usuario) {
      console.warn('Usuario no encontrado en getUsuarioNombre()');
      this.loadUsers(); // Intenta recargar si no se encontró
    }
    return usuario ? `${usuario.nombres} ${usuario.apellidos} (${usuario.cedula})` : 'Usuario no encontrado';
  }
  return '';
}

  async loadBooks() {
    try {
      const result = await (window as any).electronAPI.getBooks();
      console.log('Resultado de getBooks en AddUpdatePrestamo:', result);
      if (result.success) {
        this.books = result.books;
        console.log('Libros cargados para selección:', this.books);
        if (this.prestamo) {
          this.patchFormWithPrestamoData();
        }
      } else {
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
    const libroIds = this.selectedBooks.map(book => book.id);

    const prestamoData = {
      userId: this.prestamo ? this.prestamo.usuarioId : formValue.usuarioId,
      libros: this.selectedBooks.map(book => ({ id: book.id, titulo: book.titulo, codigo: book.codigo })),
      fechaPrestamo: formValue.fechaPrestamo
    };

    try {
      let result;
      if (this.prestamo && this.prestamo.id) {
        result = await (window as any).electronAPI.updatePrestamo({ ...prestamoData, id: this.prestamo.id });
      } else {
        result = await (window as any).electronAPI.insertPrestamo(prestamoData);
      }

      if (result.success) {
        this.presentToast(result.message, 'success');
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