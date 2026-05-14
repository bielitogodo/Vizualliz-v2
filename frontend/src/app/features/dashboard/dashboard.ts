import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Dashboard principal do sistema.
 * Mostra cards de acesso pras principais áreas.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Lista de "atalhos" (cards de navegação)
  atalhos = [
    {
      titulo: 'Pedidos',
      descricao: 'Ver e gerenciar pedidos',
      icone: '🧾',
      rota: '/pedidos'
    },
    {
      titulo: 'Novo Pedido',
      descricao: 'Criar pedido agora',
      icone: '➕',
      rota: '/pedidos/novo'
    },
    {
      titulo: 'Cardápio',
      descricao: 'Gerenciar pratos',
      icone: '🍴',
      rota: '/cardapio'
    },
    {
      titulo: 'Mesas',
      descricao: 'Gerenciar mesas',
      icone: '🪑',
      rota: '/mesas'
    }
  ];

  irPara(rota: string): void {
    this.router.navigate([rota]);
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}