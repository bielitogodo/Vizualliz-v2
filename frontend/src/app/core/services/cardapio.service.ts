import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from '@angular/fire/firestore';

/**
 * Modelo de um prato do cardápio.
 */
export interface Prato {
  id?: string;
  nome: string;
  preco: number;
}

/**
 * Serviço que gerencia o cardápio.
 * Faz CRUD no Firestore (coleção 'pratos').
 */
@Injectable({
  providedIn: 'root'
})
export class CardapioService {
  private firestore = inject(Firestore);

  /**
   * Busca lista de pratos do Firestore.
   * Retorna Promise<Prato[]> em vez de Observable.
   */
  async listarPratos(): Promise<Prato[]> {
    const pratosRef = collection(this.firestore, 'pratos');
    const snapshot = await getDocs(pratosRef);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Prato));
  }

  /**
   * Adiciona um novo prato ao cardápio.
   */
  async adicionarPrato(prato: Prato): Promise<void> {
    const pratosRef = collection(this.firestore, 'pratos');
    await addDoc(pratosRef, {
      nome: prato.nome,
      preco: prato.preco
    });
  }

  /**
   * Remove um prato do cardápio pelo ID.
   */
  async removerPrato(id: string): Promise<void> {
    const pratoDoc = doc(this.firestore, `pratos/${id}`);
    await deleteDoc(pratoDoc);
  }
}