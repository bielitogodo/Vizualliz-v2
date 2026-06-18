import { Injectable, signal } from '@angular/core';

/**
 * Modelo de uma mensagem toast.
 */
export interface Toast {
  id: number;
  mensagem: string;
  tipo: 'sucesso' | 'erro';
}

/**
 * Serviço que gerencia as mensagens toast do app.
 * Permite mostrar feedback visual de sucesso/erro de forma global.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Lista de toasts ativos (signal reativo)
  toasts = signal<Toast[]>([]);

  private proximoId = 1;

  /**
   * Mostra um toast de sucesso (verde).
   * Some sozinho em 3 segundos.
   */
  sucesso(mensagem: string): void {
    this.mostrar(mensagem, 'sucesso');
  }

  /**
   * Mostra um toast de erro (vermelho).
   * Some sozinho em 4 segundos.
   */
  erro(mensagem: string): void {
    this.mostrar(mensagem, 'erro');
  }

  /**
   * Adiciona um toast à lista e remove automaticamente após X segundos.
   */
  private mostrar(mensagem: string, tipo: 'sucesso' | 'erro'): void {
    const id = this.proximoId++;
    const toast: Toast = { id, mensagem, tipo };

    // Adiciona à lista
    this.toasts.set([...this.toasts(), toast]);

    // Remove após 3s (sucesso) ou 4s (erro)
    const tempo = tipo === 'erro' ? 4000 : 3000;
    setTimeout(() => this.remover(id), tempo);
  }

  /**
   * Remove um toast da lista pelo ID.
   */
  remover(id: number): void {
    this.toasts.set(this.toasts().filter(t => t.id !== id));
  }
}