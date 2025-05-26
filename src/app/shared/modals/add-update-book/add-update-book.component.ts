import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- ¡AÑADIDO!
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- ¡AÑADIDOS!
import { IonicModule, ToastController } from '@ionic/angular'; // <-- ¡AÑADIDOS!
import { Book } from 'src/app/models/book.model';
import { HeaderComponent } from '../../components/header/header.component';


@Component({
  selector: 'app-add-update-book',
  templateUrl: './add-update-book.component.html',
  styleUrls: ['./add-update-book.component.scss'],
  standalone: true, // <-- ¡CAMBIADO A TRUE!
  imports: [ // <-- ¡SECCIÓN AÑADIDA!
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponent // <-- ¡AÑADIDO!
  ]
})
export class AddUpdateBookComponent  implements OnInit {

  @Input() book: Book

  fb = inject(FormBuilder)
  toastCtrl = inject(ToastController)

  bookForm: FormGroup;
  title = ''
  isProcessing = false;
  

  constructor() {
    this.bookForm = this.fb.group({
      codigo: ['', [Validators.required]], // Campo código obligatorio
      titulo: ['', [Validators.required]],
      autor: ['', [Validators.required]],
      estanteria: ['', [Validators.min(1)]],
      fila: ['', [Validators.min(1)]],
      caja: ['', [Validators.min(1)]],
      ejemplares: [, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    if (this.book) {
      this.bookForm.patchValue({
        codigo: this.book.codigo, // Incluir código existente
        titulo: this.book.titulo,
        autor: this.book.autor,
        estanteria: this.book.estanteria == '0' ? '' : this.book.estanteria,
        fila: this.book.fila == '0' ? '' : this.book.fila,
        caja: this.book.caja == '0' ? '' : this.book.caja,
        ejemplares: this.book.ejemplares
      });
      this.title = 'Editar libro';
    } else {
      this.title = 'Agregar libro';
    }
  }

  async onSubmit() {
    if (this.bookForm.valid) {
      if (this.isProcessing) return;
      this.isProcessing = true;
      const formData = this.bookForm.value;
      let bookData: Book;
      
      bookData = {
        codigo: formData.codigo, // Usar el código del formulario
        titulo: formData.titulo,
        autor: formData.autor,
        estanteria: formData.estanteria || 0,
        fila: formData.fila || 0,
        caja: formData.caja || 0,
        ejemplares: formData.ejemplares,
        prestados: 0
      };
      
      if (this.book) {
        bookData.id = this.book.id;
        bookData.prestados = this.book.prestados; // Mantener prestados existentes
        await this.editBook(bookData);
      }
      else {
        await this.addBook(bookData);
      }
    } else {
      console.log('Formulario inválido');
    }
    this.isProcessing = false;
  }

  async addBook(book: Book) {
    try {
          const response = await window.electronAPI.insertBook(book);
          if (response.success) {
            const toast = await this.toastCtrl.create({
              message: 'Libro agregado exitosamente',
              duration: 3000,
              color: 'success'
            });
            await toast.present();
          } else {
            const toast = await this.toastCtrl.create({
              message: 'Error al agregar el libro',
              duration: 2000,
              color: 'danger'
            });
            await toast.present();            
          }
        } catch (err) {
          console.error('Error al agregar el libro:', err);
          const toast = await this.toastCtrl.create({
            message: 'Error de conexión',
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
        }
  }

  async editBook(book: any) {
    try {
      const result = await window.electronAPI.updateBook(book);
      if (result.success) {
        const toast = await this.toastCtrl.create({
          message: 'Libro actualizado exitosamente',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Error al actualizar el libro',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'Error de conexión',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

}