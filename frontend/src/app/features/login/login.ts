import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Componente da tela de login.
 * Captura email/senha do usuário, chama o AuthService e redireciona
 * pro dashboard em caso de sucesso.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // Injeção de dependências (forma moderna do Angular)
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals — forma moderna de estado reativo no Angular
  email = signal('');
  password = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  /**
   * Chamado quando o usuário clica em "Entrar".
   * Tenta fazer login via AuthService e redireciona em caso de sucesso.
   */
  async onSubmit(): Promise<void> {
    // Limpa mensagem de erro anterior
    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      // Tenta autenticar via Firebase
      await this.authService.login(this.email(), this.password());

      // Sucesso: redireciona pro dashboard
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // Falha: mostra mensagem amigável pro usuário
      this.errorMessage.set(this.traduzirErro(error.code));
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Traduz códigos de erro do Firebase pra mensagens em português.
   */
  private traduzirErro(codigo: string): string {
    const mensagens: Record<string, string> = {
      'auth/invalid-email': 'E-mail inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/invalid-credential': 'E-mail ou senha incorretos',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.'
    };
    return mensagens[codigo] || 'Erro ao fazer login. Tente novamente.';
  }
}