import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardapioService, Prato } from '../../core/services/cardapio.service';

/**
 * Componente da tela de Cardápio.
 */
@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.scss'
})
export class Cardapio implements OnInit {
  private cardapioService = inject(CardapioService);
  private router = inject(Router);

  // Lista de pratos (signal — array simples)
  pratos = signal<Prato[]>([]);
  carregando = signal(true);

  // Campos do formulário
  nome = signal('');
  preco = signal<number | null>(null);
  salvando = signal(false);
  erro = signal<string | null>(null);

  /**
   * Carrega a lista de pratos quando o componente abre.
   */
  async ngOnInit(): Promise<void> {
    await this.carregarPratos();
  }

  /**
   * Recarrega a lista de pratos do Firestore.
   */
  async carregarPratos(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.cardapioService.listarPratos();
      this.pratos.set(lista);
    } catch (e: any) {
      console.error('Erro ao carregar pratos:', e);
      this.erro.set('Erro ao carregar lista de pratos');
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Salva um novo prato no Firestore.
   */
  async onSalvar(): Promise<void> {
    const nomeValor = this.nome().trim();
    const precoValor = this.preco();

    if (!nomeValor || precoValor === null || precoValor <= 0) {
      this.erro.set('Preencha nome e preço válido');
      return;
    }

    this.erro.set(null);
    this.salvando.set(true);

    try {
      await this.cardapioService.adicionarPrato({
        nome: nomeValor,
        preco: precoValor
      });

      // Limpa form e recarrega lista
      this.nome.set('');
      this.preco.set(null);
      await this.carregarPratos();
    } catch (e: any) {
      this.erro.set('Erro ao salvar prato. Tente novamente.');
      console.error(e);
    } finally {
      this.salvando.set(false);
    }
  }

  /**
   * Remove um prato (com confirmação).
   */
  async onRemover(prato: Prato): Promise<void> {
    if (!prato.id) return;

    const confirmar = confirm(`Remover "${prato.nome}" do cardápio?`);
    if (!confirmar) return;

    try {
      await this.cardapioService.removerPrato(prato.id);
      await this.carregarPratos();
    } catch (e: any) {
      alert('Erro ao remover prato.');
      console.error(e);
    }
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}