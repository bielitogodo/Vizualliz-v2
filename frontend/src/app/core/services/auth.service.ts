import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user,
  User,
  UserCredential
} from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';

/**
 * Serviço de autenticação centralizado.
 * Encapsula todas as operações de login/logout com o Firebase Auth.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Injeta o Auth do Firebase (configurado no app.config.ts)
  private auth = inject(Auth);

  /**
   * Observable que emite o usuário atual sempre que o estado de auth muda.
   * Componentes podem se inscrever pra reagir a login/logout em tempo real.
   */
  user$: Observable<User | null> = user(this.auth);

  /**
   * Observable derivado: emite true/false dependendo se há usuário logado.
   */
  isLoggedIn$: Observable<boolean> = this.user$.pipe(
    map(u => !!u)
  );

  /**
   * Faz login com email e senha.
   * Retorna uma Promise com as credenciais do usuário em caso de sucesso,
   * ou lança erro em caso de falha (senha errada, usuário inexistente, etc.).
   */
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Faz logout do usuário atual.
   */
  logout(): Promise<void> {
    return signOut(this.auth);
  }

  /**
   * Retorna o JWT (token de autenticação) do usuário logado.
   * Será usado pelo HttpInterceptor pra autenticar requisições ao backend.
   * Retorna null se ninguém estiver logado.
   */
  async getToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  }

  /**
   * Retorna o usuário atualmente logado, ou null.
   * Útil pra verificações síncronas (ex: dentro de guards).
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}