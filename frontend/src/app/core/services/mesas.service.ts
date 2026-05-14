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
 * Modelo de uma mesa do restaurante.
 */
export interface Mesa {
  id?: string;
  numero: number;
  capacidade: number;
}

/**
 * Serviço que gerencia as mesas.
 */
@Injectable({
  providedIn: 'root'
})
export class MesasService {
  private firestore = inject(Firestore);

  async listarMesas(): Promise<Mesa[]> {
    const mesasRef = collection(this.firestore, 'mesas');
    const snapshot = await getDocs(mesasRef);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Mesa));
  }

  async adicionarMesa(mesa: Mesa): Promise<void> {
    const mesasRef = collection(this.firestore, 'mesas');
    await addDoc(mesasRef, {
      numero: mesa.numero,
      capacidade: mesa.capacidade
    });
  }

  async removerMesa(id: string): Promise<void> {
    const mesaDoc = doc(this.firestore, `mesas/${id}`);
    await deleteDoc(mesaDoc);
  }
}