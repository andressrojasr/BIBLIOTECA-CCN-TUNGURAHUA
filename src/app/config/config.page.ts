import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
  standalone: false
})
export class ConfigPage implements OnInit {

  constructor(private alertCtrl: AlertController,
    private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  async cambiarContrasena() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'oldPassword',
          type: 'password',
          placeholder: 'Contraseña actual'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Nueva contraseña'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmar contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.password === data.confirmPassword) {
              this.changePassword(data.oldPassword, data.password);
              return true;
            } else {
              this.mostrarToast('Las contraseñas no coinciden');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async changePassword(oldPassword: string, newPassword: string) {
    try {
          const response = await window.electronAPI.changePassword(oldPassword, newPassword);
          if (response.success) {
            const toast = await this.toastCtrl.create({
              message: 'Contraseña cambiada con éxito',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          } else {
            const toast = await this.toastCtrl.create({
              message: response.message || 'Error al cambiar la contraseña',
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

  async hacerRespaldo() {
    try {
          const response = await window.electronAPI.exportDatabase();
          if (response.success) {
            const toast = await this.toastCtrl.create({
              message: response.message,
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          } else {
            const toast = await this.toastCtrl.create({
              message: response.message || 'Error al importar la base de datos',
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

  async cargarRespaldo() {
    try {
          const response = await window.electronAPI.importDatabase();
          if (response.success) {
            const toast = await this.toastCtrl.create({
              message: response.message,
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          } else {
            const toast = await this.toastCtrl.create({
              message: response.message || 'Error al exportar la base de datos',
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

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }

}
