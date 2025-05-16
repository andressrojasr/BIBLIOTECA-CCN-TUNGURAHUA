import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';

declare global {
  interface Window {
    electronAPI: {
      login: (username: string, password: string) => Promise<any>;
    };
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  fb = inject(FormBuilder)
  navCtrl = inject(NavController)
  toastCtrl = inject(ToastController)

  showPassword: boolean = false;
  type: string = 'password';
  icon = 'eye-outline';
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      this.icon = 'eye-off-outline';
      this.type = 'text';
    } else {
      this.icon = 'eye-outline';
      this.type = 'password';
    }
  }

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
   }

  ngOnInit() {
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
       try {
          const response = await window.electronAPI.login(username, password);
          if (response.success) {
            const toast = await this.toastCtrl.create({
              message: 'Login exitoso',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
            this.navCtrl.navigateRoot(['/tabs'], {replaceUrl: true});
          } else {
            const toast = await this.toastCtrl.create({
              message: 'Credenciales inválidas',
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
}
