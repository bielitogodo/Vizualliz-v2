// =============================================================
// routes/delivery.js
// -------------------------------------------------------------
// ROTA: Delivery  /api/delivery
// Fonte da verdade: Firestore (colecao "delivery_orders")
// Leitura em tempo real no Angular: onSnapshot()
// Escrita: Angular -> este endpoint -> Admin SDK -> Firestore
//
// Pedidos delivery tem fluxo similar aos pedidos de mesa, mas
// com campos adicionais (endereco, codigo, entregador) e nao
// possuem mesa associada.
//
// REGRA DE NEGOCIO:
// Quando um delivery eh marcado como "entregue" ou "cancelado",
// move para a tabela "historico" do SQLite (mesmo padrao dos
// pedidos de mesa).
// =============================================================

const express = require('express');
const admin   = require('../firebase-admin');
const db      = require('../db');

const router = express.Router();

// -------------------------------------------------------------
// GET /api/delivery
// Retorna pedidos delivery agrupados por status.
// -------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('delivery_orders').get();
    const deliveries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const preparo   = deliveries.filter((d) => d.status === 'preparo');
    const entregues = deliveries.filter((d) => d.status === 'saiu');

    res.json({ preparo, entregues });
  } catch (erro) {
    console.error('Erro em GET /delivery:', erro);
    res.status(500).json({ erro: 'Falha ao listar deliveries', detalhe: erro.message });
  }
});

// -------------------------------------------------------------
// POST /api/delivery
// Cria um novo pedido delivery com status inicial "preparo".
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const novoDelivery = {
      ...req.body,
      status: 'preparo',
      hora: new Date().toISOString(),
      criado_por: req.user?.uid || null,
    };

    const docRef = await admin.firestore().collection('delivery_orders').add(novoDelivery);
    res.status(201).json({ id: docRef.id, ...novoDelivery });
  } catch (erro) {
    console.error('Erro em POST /delivery:', erro);
    res.status(500).json({ erro: 'Falha ao criar delivery', detalhe: erro.message });
  }
});

// -------------------------------------------------------------
// PUT /api/delivery/:id
// Atualiza o status de um delivery. Se for "entregue" ou
// "cancelado", move para o historico do SQLite.
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, entregador } = req.body;

  if (!status) {
    return res.status(400).json({ erro: 'Campo "status" eh obrigatorio' });
  }

  try {
    const docRef = admin.firestore().collection('delivery_orders').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ erro: 'Delivery nao encontrado' });
    }

    const delivery = snap.data();

    // Caso 1: encerramento -> move para historico
    if (status === 'entregue' || status === 'cancelado') {
      const insertHistorico = db.prepare(`
        INSERT INTO historico (nome, emoji, mesa, obs, hora, quant, preco, delivery, status, fechado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertHistorico.run(
        delivery.nome,
        delivery.emoji,
        null,                    // delivery nao tem mesa
        delivery.endereco || '', // endereco vai no campo "obs" para historico
        delivery.hora,
        1,                       // delivery sempre eh 1 unidade do "pedido completo"
        delivery.preco,
        1,                       // flag delivery = true
        status,
        new Date().toISOString(),
      );

      await docRef.delete();
      return res.json({ id, status, movido_para_historico: true });
    }

    // Caso 2: marcar como "saiu para entrega" -> apenas atualiza status + entregador
    const atualizacao = { status };
    if (entregador) atualizacao.entregador = entregador;

    await docRef.update(atualizacao);
    res.json({ id, ...atualizacao });
  } catch (erro) {
    console.error('Erro em PUT /delivery/:id', erro);
    res.status(500).json({ erro: 'Falha ao atualizar delivery', detalhe: erro.message });
  }
});

module.exports = router;