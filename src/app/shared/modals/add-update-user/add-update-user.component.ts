import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular'; // Asegúrate de importar ModalController
import { User } from 'src/app/models/user.model';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-add-update-user',
  templateUrl: './add-update-user.component.html',
  styleUrls: ['./add-update-user.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponent
  ]
})
export class AddUpdateUserComponent implements OnInit {

  @Input() user: User | undefined; // Puede ser User o undefined

  fb = inject(FormBuilder);
  toastCtrl = inject(ToastController);
  modalCtrl = inject(ModalController); // Inyecta ModalController

  userForm: FormGroup;
  title = '';
  isProcessing = false;

  constructor() {
    this.userForm = this.fb.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      profesion: [''],
      lugarTrabajo: [''],
      tipoUsuario: [0, [Validators.required]], // Valor por defecto
      edad: [null, [Validators.required, Validators.min(0), Validators.max(120)]],
      direccion: [''],
      canton: [''],
      celular: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    if (this.user) {
      this.title = 'Editar Usuario';
      this.userForm.patchValue(this.user);
    } else {
      this.title = 'Agregar Usuario';
    }
  }

  async saveUser() {
    if (this.userForm.invalid) {
      this.presentToast('Por favor, completa todos los campos requeridos y asegúrate de que sean válidos.', 'warning');
      return;
    }

    this.isProcessing = true;
    const userData = this.userForm.value;

    try {
      let result;
      if (this.user && this.user.id) {
        // Modo edición: llamar a la función de actualización
        userData.id = this.user.id; // Asegúrate de pasar el ID para la actualización
        result = await (window as any).electronAPI.updateUsuario(userData);
      } else {
        // Modo creación: llamar a la función de inserción
        result = await (window as any).electronAPI.insertUsuario(userData);
      }

      if (result.success) {
        this.presentToast(result.message, 'success');
        this.modalCtrl.dismiss(true); // Cerrar modal y pasar 'true' para indicar éxito
      } else {
        this.presentToast('Error al procesar el usuario: ' + result.message, 'danger');
        console.error('❌ Error al procesar usuario:', result.error);
      }
    } catch (error) {
      this.presentToast('Error de comunicación con Electron al guardar usuario.', 'danger');
      console.error('❌ Error en Electron API al guardar usuario:', error);
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

  cancel() {
    this.modalCtrl.dismiss();
  }
}