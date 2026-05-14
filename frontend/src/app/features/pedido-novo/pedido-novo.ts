import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MesasService, Mesa } from '../../core/services/mesas.service';
import { CardapioService, Prato } from '../../core/services/cardapio.service';
import { PedidosService, ItemPedido } from '../../core/services/pedidos.service';

/**
 * Tela de criar novo pedido.
 * Fluxo: escolher mesa → adicionar pratos → ver total → salvar.
 */
@Component({
  selector: 'app-pedido-novo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-novo.html',
  styleUrl: './pedido-novo.scss'
})
export class PedidoNovo implements OnInit {
  private mesasService = inject(MesasService);
  private cardapioService = inject(CardapioService);
  private pedidosService = inject(PedidosService);
  private router = inject(Router);

  // Listas vindas do Firestore
  mesas = signal<Mesa[]>([]);
  pratos = signal<Prato[]>([]);

  // Estado do formulário
  mesaSelecionada = signal<number | null>(null);
  itensPedido = signal<ItemPedido[]>([]);
  carregando = signal(true);
  salvando = signal(false);
  erro = signal<string | null>(null);

  // Total calculado automaticamente
  total = computed(() =>
    this.itensPedido().reduce((soma, item) => soma + (item.preco * item.quantidade), 0)
  );

  async ngOnInit(): Promise<void> {
    try {
      const [mesasLista, pratosLista] = await Promise.all([
        this.mesasService.listarMesas(),
        this.cardapioService.listarPratos()
      ]);

      mesasLista.sort((a, b) => a.numero - b.numero);
      pratosLista.sort((a, b) => a.nome.localeCompare(b.nome));

      this.mesas.set(mesasLista);
      this.pratos.set(pratosLista);
    } catch (e) {
      console.error(e);
      this.erro.set('Erro ao carregar mesas/cardápio');
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Adiciona um prato ao pedido (ou incrementa quantidade se já existir).
   */
  adicionarPrato(prato: Prato): void {
    if (!prato.id) return;

    const itens = this.itensPedido();
    const existente = itens.find(i => i.pratoId === prato.id);

    if (existente) {
      // Já tem o prato, incrementa quantidade
      this.itensPedido.set(itens.map(i =>
        i.pratoId === prato.id ? { ...i, quantidade: i.quantidade + 1 } : i
      ));
    } else {
      // Adiciona novo
      this.itensPedido.set([
        ...itens,
        {
          pratoId: prato.id,
          nome: prato.nome,
          preco: prato.preco,
          quantidade: 1
        }
      ]);
    }
  }

  /**
   * Diminui a quantidade de um item (remove se chegar a zero).
   */
  diminuirItem(pratoId: string): void {
    const itens = this.itensPedido();
    const atualizado = itens
      .map(i => i.pratoId === pratoId ? { ...i, quantidade: i.quantidade - 1 } : i)
      .filter(i => i.quantidade > 0);
    this.itensPedido.set(atualizado);
  }

  /**
   * Remove um item completamente.
   */
  removerItem(pratoId: string): void {
    this.itensPedido.set(this.itensPedido().filter(i => i.pratoId !== pratoId));
  }

  /**
   * Salva o pedido no Firestore.
   */
  async onSalvar(): Promise<void> {
    const mesa = this.mesaSelecionada();
    const itens = this.itensPedido();

    if (mesa === null) {
      this.erro.set('Selecione uma mesa');
      return;
    }
    if (itens.length === 0) {
      this.erro.set('Adicione pelo menos um prato');
      return;
    }

    this.erro.set(null);
    this.salvando.set(true);

    try {
      await this.pedidosService.criarPedido({
        mesaNumero: mesa,
        itens: itens,
        total: this.total()
      });

      // Sucesso: vai pra lista de pedidos
      await this.router.navigate(['/pedidos']);
    } catch (e: any) {
      this.erro.set('Erro ao salvar pedido. Tente novamente.');
      console.error(e);
    } finally {
      this.salvando.set(false);
    }
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}