import { inject, Injectable } from '@angular/core';
import { LoadingController, ModalController, ModalOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  

  modalCtrl = inject(ModalController)
  loadingCtrl = inject(LoadingController)

  async presentModal(opt:ModalOptions)
  {
    const modal = await this.modalCtrl.create(opt)
    await modal.present()

    const { data } = await modal.onWillDismiss()
    if (data) return data;
  }

  dismissModal(data?:any)
  {
    return this.modalCtrl.dismiss(data)
  }

  loading(){
    return this.loadingCtrl.create({
      message: 'Cargando...',
      spinner: 'crescent',
    })
  }

  constructor() { }
}
