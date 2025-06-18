import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Book } from 'src/app/models/book.model';


@Component({
  selector: 'app-add-update-book',
  templateUrl: './add-update-book.component.html',
  styleUrls: ['./add-update-book.component.scss'],
  standalone: false,
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
      id: ['', [Validators.required, Validators.min(1)]],
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
        id: this.book.id,
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
      
      if (this.book) {
        if(this.book.ejemplares < this.book.prestados) {
          const toast = await this.toastCtrl.create({
            message: 'No se puede editar el libro, el número de ejemplares no puede ser menor que los prestados',
            duration: 3000,
            color: 'danger'
          });
          await toast.present();
          this.isProcessing = false;
          return;
        }
        bookData = {
          id: formData.id,
          titulo: formData.titulo,
          autor: formData.autor,
          estanteria: formData.estanteria || 0,
          fila: formData.fila || 0,
          caja: formData.caja || 0,
          ejemplares: formData.ejemplares,
          prestados: this.book.prestados || 0, // Mantener el número de prestados si se edita
        };
        bookData.id = this.book.id;
        await this.editBook(bookData);
      }
      else {
        bookData = {
          id: formData.id,
          titulo: formData.titulo,
          autor: formData.autor,
          estanteria: formData.estanteria || 0,
          fila: formData.fila || 0,
          caja: formData.caja || 0,
          ejemplares: formData.ejemplares,
          prestados: 0,
        };
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
            let message ='Error al agregar el libro'
            if (response.error = 'DUPLICATE_PRIMARY_KEY') message = 'Ya existe un libro con ese código'
            const toast = await this.toastCtrl.create({
              message: message,
              duration: 2000,
              color: 'danger'
            });
            await toast.present();            
          }
        } catch (err) {
          console.error('Error al agregar el libro:', err);
          const toast = await this.toastCtrl.create({
            message: 'Error de conexión: '+ err,
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
          message: 'Libro editado exitosamente',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Error al editar el libro',
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
