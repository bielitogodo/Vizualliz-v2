import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MesasService, Mesa } from '../../core/services/mesas.service';
import { ToastService } from '../../core/services/toast.service';

/**
 * Componente da tela de Mesas.
 */
@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesas.html',
  styleUrl: './mesas.scss'
})
export class Mesas implements OnInit {
  private mesasService = inject(MesasService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  mesas = signal<Mesa[]>([]);
  carregando = signal(true);

  // Formulário
  numero = signal<number | null>(null);
  capacidade = signal<number | null>(null);
  salvando = signal(false);
  erro = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.carregarMesas();
  }

  async carregarMesas(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.mesasService.listarMesas();
      // Ordena pelo número
      lista.sort((a, b) => a.numero - b.numero);
      this.mesas.set(lista);
    } catch (e: any) {
      console.error('Erro ao carregar mesas:', e);
      this.erro.set('Erro ao carregar lista de mesas');
    } finally {
      this.carregando.set(false);
    }
  }

  async onSalvar(): Promise<void> {
    const num = this.numero();
    const cap = this.capacidade();

    if (num === null || num <= 0) {
      this.erro.set('Número da mesa inválido');
      return;
    }
    if (cap === null || cap <= 0) {
      this.erro.set('Capacidade inválida');
      return;
    }

    // Verifica se já existe mesa com esse número
    if (this.mesas().some(m => m.numero === num)) {
      this.erro.set(`Já existe uma mesa com número ${num}`);
      return;
    }

    this.erro.set(null);
    this.salvando.set(true);

    try {
      await this.mesasService.adicionarMesa({
        numero: num,
        capacidade: cap
      });

      this.toastService.sucesso(`Mesa ${num} cadastrada!`);

      this.numero.set(null);
      this.capacidade.set(null);
      await this.carregarMesas();
    } catch (e: any) {
      this.erro.set('Erro ao salvar mesa. Tente novamente.');
      console.error(e);
    } finally {
      this.salvando.set(false);
    }
  }

  async onRemover(mesa: Mesa): Promise<void> {
    if (!mesa.id) return;

    const confirmar = confirm(`Remover Mesa ${mesa.numero}?`);
    if (!confirmar) return;

    try {
      await this.mesasService.removerMesa(mesa.id);
      this.toastService.sucesso('Mesa removida');
      await this.carregarMesas();
    } catch (e: any) {
      alert('Erro ao remover mesa.');
      console.error(e);
    }
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}