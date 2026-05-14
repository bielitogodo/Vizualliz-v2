import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Cardapio } from './features/cardapio/cardapio';
import { Mesas } from './features/mesas/mesas';
import { Pedidos } from './features/pedidos/pedidos';
import { PedidoNovo } from './features/pedido-novo/pedido-novo';

/**
 * Mapa de rotas do aplicativo.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'cardapio',
    component: Cardapio
  },
  {
    path: 'mesas',
    component: Mesas
  },
  {
    path: 'pedidos',
    component: Pedidos
  },
  {
    path: 'pedidos/novo',
    component: PedidoNovo
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];