import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-add-update-user',
  templateUrl: './add-update-user.component.html',
  styleUrls: ['./add-update-user.component.scss'],
  standalone: false,
})
export class AddUpdateUserComponent  implements OnInit {

  @Input() user: User

  fb = inject(FormBuilder)
  toastCtrl = inject(ToastController)

  userForm: FormGroup;
  title = ''
  isProcessing = false;
  

  constructor(private modalController: ModalController) {
    this.userForm = this.fb.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      profesion: ['', []],
      lugarTrabajo: ['', []],
      tipoUsuario: [, [Validators.required]],
      edad: [, [Validators.required, Validators.min(1)]],
      direccion: ['', [Validators.required]],
      canton: ['', [Validators.required]],
      celular: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    if (this.user) {
      this.userForm.patchValue({
        nombres: this.user.nombres,
        apellidos: this.user.apellidos,
        cedula: this.user.cedula,
        profesion: this.user.profesion || '',
        lugarTrabajo: this.user.lugarTrabajo || '',
        tipoUsuario: this.user.tipoUsuario,
        edad: this.user.edad,
        direccion: this.user.direccion,
        canton: this.user.canton,
        celular: this.user.celular || '',
        correo: this.user.correo,
      });
      this.title = 'Editar usuario';
    } else {
      this.title = 'Agregar usuario';
    }
  }

  async onSubmit() {
    if (this.userForm.valid) {
      if (this.isProcessing) return;
      this.isProcessing = true;
      const formData = this.userForm.value;
      let userData: User;
      userData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        cedula: formData.cedula,
        profesion: formData.profesion || '',
        lugarTrabajo: formData.lugarTrabajo || '',
        tipoUsuario: formData.tipoUsuario,
        edad: formData.edad,
        direccion: formData.direccion,
        canton: formData.canton,
        celular: formData.celular || '',
        correo: formData.correo,
      };
      if (this.user) {
        userData.id = this.user.id;
        await this.editUser(userData);
      }
      else {
        await this.addUser(userData);
      }
    } else {
      console.log('Formulario inválido');
    }
    this.isProcessing = false;
  }

  async addUser(user: User) {
    try {
          const response = await window.electronAPI.insertUser(user);
          if (response.success) {
            this.modalController.dismiss({ success: true });
          } else {
            const toast = await this.toastCtrl.create({
              message: 'Error al agregar el usuario',
              duration: 2000,
              color: 'danger'
            });
            await toast.present();            
          }
        } catch (err) {
          console.error('Error al agregar el usuario:', err);
          const toast = await this.toastCtrl.create({
            message: 'Error de conexión',
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
        }
  }

  async editUser(user: any) {
    try {
      const result = await window.electronAPI.updateUser(user);
      if (result.success) {
        const toast = await this.toastCtrl.create({
          message: 'Usuario editado exitosamente',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        this.modalController.dismiss({ success: true });
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Error al editar el usuario',
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
