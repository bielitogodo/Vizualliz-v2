import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PedidosService, Pedido, StatusPedido } from '../../core/services/pedidos.service';
import { ToastService } from '../../core/services/toast.service';

/**
 * Tela que lista todos os pedidos e permite mudar status.
 * Fluxo: feito → entregue → finalizado
 */
@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class Pedidos implements OnInit {
  private pedidosService = inject(PedidosService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  pedidos = signal<Pedido[]>([]);
  carregando = signal(true);
  filtroStatus = signal<StatusPedido | 'todos'>('todos');

  // Contadores por status (atualiza sozinho via computed)
  contadores = computed(() => {
    const todos = this.pedidos();
    return {
      todos: todos.length,
      feito: todos.filter(p => p.status === 'feito').length,
      entregue: todos.filter(p => p.status === 'entregue').length,
      finalizado: todos.filter(p => p.status === 'finalizado').length
    };
  });

  // Pedidos filtrados pelo status selecionado
  pedidosFiltrados = computed(() => {
    const filtro = this.filtroStatus();
    if (filtro === 'todos') return this.pedidos();
    return this.pedidos().filter(p => p.status === filtro);
  });

  async ngOnInit(): Promise<void> {
    await this.carregarPedidos();
  }

  async carregarPedidos(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.pedidosService.listarPedidos();
      this.pedidos.set(lista);
    } catch (e) {
      console.error('Erro ao carregar pedidos:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Avança o status do pedido pra próxima etapa.
   * feito → entregue → finalizado
   */
  async avancarStatus(pedido: Pedido): Promise<void> {
    if (!pedido.id) return;

    let novoStatus: StatusPedido;
    if (pedido.status === 'feito') {
      novoStatus = 'entregue';
    } else if (pedido.status === 'entregue') {
      novoStatus = 'finalizado';
    } else {
      return; // Já está finalizado
    }

    try {
      await this.pedidosService.atualizarStatus(pedido.id, novoStatus);
      this.toastService.sucesso(`Pedido atualizado para "${this.textoStatus(novoStatus)}"`);
      await this.carregarPedidos();
    } catch (e) {
      alert('Erro ao atualizar status.');
      console.error(e);
    }
  }

  async removerPedido(pedido: Pedido): Promise<void> {
    if (!pedido.id) return;
    if (!confirm(`Remover pedido da mesa ${pedido.mesaNumero}?`)) return;

    try {
      await this.pedidosService.removerPedido(pedido.id);
      this.toastService.sucesso('Pedido removido');
      await this.carregarPedidos();
    } catch (e) {
      alert('Erro ao remover pedido.');
    }
  }

  /**
   * Texto do botão de avançar status baseado no status atual.
   */
  textoBotaoAvancar(status: StatusPedido): string {
    if (status === 'feito') return 'Marcar como Entregue';
    if (status === 'entregue') return 'Finalizar pedido';
    return '';
  }

  /**
   * Calcula quanto tempo passou desde a criação do pedido.
   * Retorna texto amigável tipo "5 minutos", "2 horas" ou "1 dia".
   */
  calcularTempo(criadoEm: number): string {
    const agora = Date.now();
    const diff = agora - criadoEm;

    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (dias > 0) {
      return dias === 1 ? '1 dia' : `${dias} dias`;
    }
    if (horas > 0) {
      return horas === 1 ? '1 hora' : `${horas} horas`;
    }
    if (minutos > 0) {
      return minutos === 1 ? '1 minuto' : `${minutos} minutos`;
    }
    return 'agora';
  }
  textoStatus(status: StatusPedido): string {
    const textos = {
      'feito': 'Pedido feito',
      'entregue': 'Entregue',
      'finalizado': 'Finalizado'
    };
    return textos[status] || status;
  }

  irParaNovoPedido(): void {
    this.router.navigate(['/pedidos/novo']);
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}