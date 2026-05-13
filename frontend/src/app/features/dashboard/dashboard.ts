import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Dashboard placeholder.
 * Apenas confirma que o login funcionou e oferece botão de logout.
 * Será substituído por dashboard completo na Etapa 13.
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

  /**
   * Faz logout no Firebase e redireciona pra tela de login.
   */
  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}