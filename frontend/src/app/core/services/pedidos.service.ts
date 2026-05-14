import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from '@angular/fire/firestore';

/**
 * Item dentro de um pedido (prato + quantidade).
 */
export interface ItemPedido {
  pratoId: string;
  nome: string;
  preco: number;
  quantidade: number;
}

/**
 * Status possíveis do pedido.
 * Fluxo: feito → entregue → finalizado
 */
export type StatusPedido = 'feito' | 'entregue' | 'finalizado';

/**
 * Modelo de um pedido.
 */
export interface Pedido {
  id?: string;
  mesaNumero: number;
  itens: ItemPedido[];
  total: number;
  status: StatusPedido;
  criadoEm: number; // timestamp
}

/**
 * Serviço que gerencia os pedidos.
 */
@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private firestore = inject(Firestore);

  /**
   * Lista todos os pedidos, ordenados do mais novo pro mais antigo.
   */
  async listarPedidos(): Promise<Pedido[]> {
    const pedidosRef = collection(this.firestore, 'pedidos');
    const q = query(pedidosRef, orderBy('criadoEm', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Pedido));
  }

  /**
   * Cria um novo pedido com status 'feito'.
   */
  async criarPedido(pedido: Omit<Pedido, 'id' | 'status' | 'criadoEm'>): Promise<void> {
    const pedidosRef = collection(this.firestore, 'pedidos');
    await addDoc(pedidosRef, {
      mesaNumero: pedido.mesaNumero,
      itens: pedido.itens,
      total: pedido.total,
      status: 'feito' as StatusPedido,
      criadoEm: Date.now()
    });
  }

  /**
   * Muda o status de um pedido.
   */
  async atualizarStatus(pedidoId: string, novoStatus: StatusPedido): Promise<void> {
    const pedidoDoc = doc(this.firestore, `pedidos/${pedidoId}`);
    await updateDoc(pedidoDoc, { status: novoStatus });
  }

  /**
   * Remove um pedido (use só pra correção de erros).
   */
  async removerPedido(id: string): Promise<void> {
    const pedidoDoc = doc(this.firestore, `pedidos/${id}`);
    await deleteDoc(pedidoDoc);
  }
}