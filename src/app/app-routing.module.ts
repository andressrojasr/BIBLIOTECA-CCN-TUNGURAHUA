import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'     // asegura que coincida exactamente con ''
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module')
      .then(m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module')
      .then(m => m.TabsPageModule)
  },
  // // Comodín: cualquier otra ruta vuelve a login
  // {
  //   path: '**',
  //   redirectTo: 'login'
  // },
  {
    path: 'prueba',
    loadChildren: () => import('./prueba/prueba.module').then( m => m.PruebaPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
