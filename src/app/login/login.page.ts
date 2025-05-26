import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module'; // Importa tu SharedModule


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule, // LoginPage importa SharedModule directamente
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  type: string = 'password';
  icon: string = 'eye';

  @ViewChild('usernameInput', { static: true }) usernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput', { static: true }) passwordInput!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private formBuilder: FormBuilder
  ) {
    this.initLoginForm();
  }

  ngOnInit() {
    this.clearInputFields();
  }

  ionViewWillEnter() {
    this.clearInputFields();
  }

  initLoginForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.type = 'password';
    this.icon = 'eye';
  }

  clearInputFields() {
    if (this.usernameInput && this.usernameInput.nativeElement) {
      this.usernameInput.nativeElement.value = '';
    }
    if (this.passwordInput && this.passwordInput.nativeElement) {
      this.passwordInput.nativeElement.value = '';
    }
    this.loginForm.reset({ username: '', password: '' });
  }

  togglePasswordVisibility() {
    this.type = this.type === 'password' ? 'text' : 'password';
    this.icon = this.type === 'password' ? 'eye' : 'eye-off';
  }

  async login() {
    if (this.loginForm.invalid) {
      this.presentToast('Por favor, ingresa usuario y contraseña.', 'warning');
      return;
    }

    const { username, password } = this.loginForm.value;

    try {
      const result = await window.electronAPI.login(username, password);

      if (result.success) {
        localStorage.setItem('user', JSON.stringify({ username: username, isLoggedIn: true }));
        this.presentToast('Inicio de sesión exitoso', 'success');
        this.router.navigate(['/tabs/tab1']);
      } else {
        this.presentToast('Usuario o contraseña incorrectos', 'danger');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      this.presentToast('Error al conectar con el servicio.', 'danger');
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
}