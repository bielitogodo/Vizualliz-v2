import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PedidosService, Pedido } from '../../core/services/pedidos.service';
import { MesasService } from '../../core/services/mesas.service';
import { CardapioService } from '../../core/services/cardapio.service';

/**
 * Dashboard principal do sistema.
 * Mostra estatísticas em tempo real + cards de acesso pras principais áreas.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private pedidosService = inject(PedidosService);
  private mesasService = inject(MesasService);
  private cardapioService = inject(CardapioService);

  // Estado
  carregando = signal(true);
  pedidos = signal<Pedido[]>([]);
  totalMesas = signal(0);
  totalPratos = signal(0);

  // Estatísticas calculadas automaticamente (computed)
  estatisticas = computed(() => {
    const todos = this.pedidos();

    // Início do dia de hoje (00:00)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioHoje = hoje.getTime();

    const pedidosHoje = todos.filter(p => p.criadoEm >= inicioHoje);
    const emAndamento = todos.filter(p =>
      p.status === 'feito' || p.status === 'entregue'
    );
    const faturamentoHoje = pedidosHoje
      .filter(p => p.status === 'finalizado')
      .reduce((soma, p) => soma + p.total, 0);

    return {
      pedidosHoje: pedidosHoje.length,
      faturamentoHoje: faturamentoHoje,
      emAndamento: emAndamento.length,
      totalMesas: this.totalMesas(),
      totalPratos: this.totalPratos()
    };
  });

  // Lista de atalhos (cards de navegação)
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

  async ngOnInit(): Promise<void> {
    await this.carregarDados();
  }

  async carregarDados(): Promise<void> {
    this.carregando.set(true);
    try {
      const [pedidos, mesas, pratos] = await Promise.all([
        this.pedidosService.listarPedidos(),
        this.mesasService.listarMesas(),
        this.cardapioService.listarPratos()
      ]);

      this.pedidos.set(pedidos);
      this.totalMesas.set(mesas.length);
      this.totalPratos.set(pratos.length);
    } catch (e) {
      console.error('Erro ao carregar dados do dashboard:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  irPara(rota: string): void {
    this.router.navigate([rota]);
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
} 