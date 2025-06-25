import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Prestamo } from 'src/app/models/prestamo.model';

@Component({
  selector: 'app-info-prestamo',
  templateUrl: './info-prestamo.component.html',
  styleUrls: ['./info-prestamo.component.scss'],
  standalone: false,
})
export class InfoPrestamoComponent  implements OnInit {

  @Input() prestamo: Prestamo

    toastCtrl = inject(ToastController)
  
    title = ''
    isProcessing = false;
    
  
    constructor(private modalController: ModalController) {
    }
  
    ngOnInit() {
      this.title = 'Finalizar Préstamo';
    }
  
    async onSubmit() {
      this.FinishPrestamo()
    }
  
    async FinishPrestamo() {
      try {
            const response = await window.electronAPI.updatePrestamo(this.getTodayDate(), this.prestamo.id);
            if (response.success) {
              const toast = await this.toastCtrl.create({
                message: 'Préstamo finalizado exitosamente',
                duration: 3000,
                color: 'success'
              });
              await toast.present();
              this.modalController.dismiss(true);
            } else {
              let message ='Error al finalizar el préstamo'
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



  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
