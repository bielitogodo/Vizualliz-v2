import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Cardapio } from './features/cardapio/cardapio';

/**
 * Mapa de rotas do aplicativo.
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

  // Dashboard
  {
    path: 'dashboard',
    component: Dashboard
  },

  // Cardápio
  {
    path: 'cardapio',
    component: Cardapio
  },

  // Wildcard: qualquer URL desconhecida volta pra /login
  {
    path: '**',
    redirectTo: '/login'
  }
];