import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Prestamo } from 'src/app/models/prestamo.model';
import { SelectUsuarioComponent } from '../select-usuario/select-usuario.component';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-prestamo',
  templateUrl: './add-prestamo.component.html',
  styleUrls: ['./add-prestamo.component.scss'],
  standalone: false,
})
export class AddPrestamoComponent  implements OnInit {

   @Input() prestamo: Prestamo
  
    fb = inject(FormBuilder)
    toastCtrl = inject(ToastController)
    modalCtrl = inject(ModalController)
  
    prestamoForm: FormGroup;
    title = ''
    isProcessing = false;
    
  
    constructor() {
      this.prestamoForm = this.fb.group({
        id: ['', []],
        usuario: [, [Validators.required]],
        libro: [, [Validators.required]],
        fechaPrestamo: ['', [Validators.required]],
        fechaDevolucion: ['', [Validators.required]],
      });
    }
  
    ngOnInit() {
      this.title = 'Añadir Préstamo';
    }
  
    async onSubmit() {
      if (this.prestamoForm.valid) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        const formData = this.prestamoForm.value;
        let prestamoData: any;
        prestamoData = {
          id: formData.id,
          usuarioId: formData.usuario.id,
          libroId: formData.libro.id,
          fechaPrestamo: formData.fechaPrestamo,
        };
        await this.addPrestamo(prestamoData);
      }
      else {
        console.log('Formulario inválido');
      }
      this.isProcessing = false;
    }
  
    async addPrestamo(prestamo: any) {
      try {
            const response = await window.electronAPI.insertPrestamo(prestamo);
            if (response.success) {
              const toast = await this.toastCtrl.create({
                message: 'Prestamo agregado exitosamente',
                duration: 3000,
                color: 'success'
              });
              await toast.present();
            } else {
              let message ='Error al agregar el prestamo'
              const toast = await this.toastCtrl.create({
                message: message,
                duration: 2000,
                color: 'danger'
              });
              await toast.present();            
            }
          } catch (err) {
            const toast = await this.toastCtrl.create({
              message: 'Error de conexión: '+ err,
              duration: 2000,
              color: 'danger'
            });
            await toast.present();
          }
    }

  async openUsuarioModal() {
      const modal = await this.modalCtrl.create({
        component: SelectUsuarioComponent,
        cssClass: 'add-update-modal'
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();

      if (data) {
        this.prestamoForm.patchValue({ usuario: data });
        const toast = await this.toastCtrl.create({
          message: 'Usuario seleccionado con éxito',
          duration: 3000,
          color: 'success'
        });
        toast.present();
      }
    }
    openLibroModal() {}
}
