import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { User } from '../../../models/user.model';
import { Book } from '../../../models/book.model';
import { Prestamo } from '../../../models/prestamo.model';
import { SharedModule } from '../../shared.module'; // Importa tu SharedModule para app-header

// Definimos la interfaz PrestamoLibro para claridad, asumiendo estas son las propiedades que llegan con el prestamo
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
    SharedModule // <-- Importante: si app-header está en SharedModule
  ],
})
export class AddUpdatePrestamoComponent implements OnInit {
  @Input() prestamo: Prestamo | null = null; // Puede ser un préstamo existente o nulo
  
  title: string = 'Registrar Nuevo Préstamo';
  prestamoForm!: FormGroup;
  users: User[] = [];
  books: Book[] = []; // Todos los libros disponibles (Book[] tiene todas las propiedades)
  selectedBooks: Book[] = []; // Libros seleccionados para el préstamo (Book[] tiene todas las propiedades)
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
    this.loadBooks(); // Asegúrate de cargar todos los libros al inicio
    // La llamada a patchFormWithPrestamoData() se moverá dentro de loadBooks()
    // para asegurar que this.books esté disponible.
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
    // Asegúrate de que this.books ya esté poblado antes de llamar a esto
    if (this.prestamo && this.books.length > 0) {
      this.prestamoForm.patchValue({
        usuarioId: this.prestamo.usuarioId,
        fechaPrestamo: this.prestamo.fechaPrestamo
      });

      if (this.prestamo.libros) {
        // Mapea los PrestamoLibro a Book completos usando la lista 'books' cargada
        this.selectedBooks = this.prestamo.libros
          .map((prestamoLibro: PrestamoLibro) => 
            this.books.find(book => book.id === prestamoLibro.id)
          )
          .filter((book): book is Book => book !== undefined); // Filtra los undefined
      }
    }
  }

  async loadUsers() {
    try {
      const result = await window.electronAPI.getUsers();
      if (result.success) {
        this.users = result.data;
      } else {
        this.presentToast('Error al cargar usuarios: ' + result.message, 'danger');
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios desde Electron:', error);
      this.presentToast('Error de comunicación al cargar usuarios.', 'danger');
    }
  }

  async loadBooks() {
    try {
      const result = await window.electronAPI.getBooks();
      if (result.success) {
        this.books = result.data;
        // Una vez que los libros están cargados, parchea el formulario si estamos en modo edición
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

  onUsuarioSelected(event: any) {
    console.log('Usuario seleccionado ID:', event.detail.value);
  }

  addBookToPrestamo(event: any) {
    const bookId = event.detail.value;
    const selectedBook = this.books.find(b => b.id === bookId);

    if (selectedBook && !this.selectedBooks.some(b => b.id === bookId)) {
      if (this.selectedBooks.length < 3) {
        this.selectedBooks.push(selectedBook);
      } else {
        this.presentToast('Solo se pueden prestar un máximo de 3 libros.', 'warning');
      }
    }
    // Para resetear el ion-select después de la selección
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
      usuarioId: formValue.usuarioId,
      libroIds: libroIds,
      fechaPrestamo: formValue.fechaPrestamo
    };

    try {
      let result;
      if (this.prestamo && this.prestamo.id) {
        // Asumiendo que existe una función 'updatePrestamo' en tu electronAPI
        result = await window.electronAPI.updatePrestamo({ ...prestamoData, id: this.prestamo.id });
      } else {
        result = await window.electronAPI.insertPrestamo(prestamoData);
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