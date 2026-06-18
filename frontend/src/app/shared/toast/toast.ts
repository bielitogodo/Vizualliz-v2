import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

/**
 * Componente global de toasts.
 * Renderiza as mensagens de sucesso/erro do ToastService.
 * Deve ser usado uma única vez no app.html.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {
  private toastService = inject(ToastService);

  // Expõe os toasts do serviço pro template
  toasts = this.toastService.toasts;

  fechar(id: number): void {
    this.toastService.remover(id);
  }
}