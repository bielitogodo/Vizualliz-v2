import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';

/**
 * Mapa de rotas do aplicativo.
 * Cada objeto associa uma URL a um componente.
 */
export const routes: Routes = [
  // Rota raiz: redireciona pra /login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Tela de login (pública)
  {
    path: 'login',
    component: Login
  },

  // Dashboard (futuramente protegido por authGuard)
  {
    path: 'dashboard',
    component: Dashboard
  },

  // Wildcard: qualquer URL desconhecida volta pra /login
  {
    path: '**',
    redirectTo: '/login'
  }
];