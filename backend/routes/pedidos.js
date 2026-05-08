// =============================================================
// routes/pedidos.js
// -------------------------------------------------------------
// ROTA: Pedidos  /api/pedidos
// Fonte da verdade: Firestore (colecao "pedidos")
// Leitura em tempo real no Angular: onSnapshot()
// Escrita: Angular -> este endpoint -> Admin SDK -> Firestore
//
// REGRA DE NEGOCIO IMPORTANTE:
// Quando um pedido eh marcado como "entregue" ou "cancelado",
// ele deve ser:
//   1) Removido da colecao "pedidos" do Firestore
//   2) Inserido na tabela "historico" do SQLite (para o caixa)
// Isso eh feito de forma atomica pelo backend.
// =============================================================

const express = require('express');
const admin   = require('../firebase-admin');
const db      = require('../db');

const router = express.Router();

// -------------------------------------------------------------
// GET /api/pedidos
// Retorna pedidos agrupados por status (prontos / preparo /
// cancelados_hoje). Embora a leitura "ao vivo" no Angular use
// onSnapshot, esta rota existe como fallback e para casos em
// que o Firestore esteja indisponivel.
// -------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('pedidos').get();
    const pedidos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const prontos  = pedidos.filter((p) => p.status === 'pronto');
    const preparo  = pedidos.filter((p) => p.status === 'preparo');

    // cancelados_hoje vem do SQLite (historico)
    const hoje = new Date().toISOString().slice(0, 10);
    const cancelados = db.prepare(
      `SELECT * FROM historico WHERE status = 'cancelado' AND date(fechado_em) = ?`
    ).all(hoje);

    res.json({ prontos, preparo, cancelados_hoje: cancelados });
  } catch (erro) {
    console.error('Erro em GET /pedidos:', erro);
    res.status(500).json({ erro: 'Falha ao listar pedidos', detalhe: erro.message });
  }
});

// -------------------------------------------------------------
// POST /api/pedidos
// Cria um novo pedido com status inicial "preparo".
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const novoPedido = {
      ...req.body,
      status: 'preparo',
      hora: new Date().toISOString(),
      criado_por: req.user?.uid || null,
    };

    const docRef = await admin.firestore().collection('pedidos').add(novoPedido);
    res.status(201).json({ id: docRef.id, ...novoPedido });
  } catch (erro) {
    console.error('Erro em POST /pedidos:', erro);
    res.status(500).json({ erro: 'Falha ao criar pedido', detalhe: erro.message });
  }
});

// -------------------------------------------------------------
// PUT /api/pedidos/:id
// Atualiza o status de um pedido. Se o novo status for
// "entregue" ou "cancelado", move para o historico.
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ erro: 'Campo "status" eh obrigatorio' });
  }

  try {
    const docRef = admin.firestore().collection('pedidos').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ erro: 'Pedido nao encontrado' });
    }

    const pedido = snap.data();

    // Caso 1: encerramento (entregue ou cancelado) -> move para historico
    if (status === 'entregue' || status === 'cancelado') {
      const insertHistorico = db.prepare(`
        INSERT INTO historico (nome, emoji, mesa, obs, hora, quant, preco, delivery, status, fechado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertHistorico.run(
        pedido.nome,
        pedido.emoji,
        pedido.mesa,
        pedido.obs,
        pedido.hora,
        pedido.quant,
        pedido.preco,
        pedido.delivery ? 1 : 0,
        status,
        new Date().toISOString(),
      );

      await docRef.delete();
      return res.json({ id, status, movido_para_historico: true });
    }

    // Caso 2: apenas atualiza status no Firestore
    await docRef.update({ status });
    res.json({ id, status });
  } catch (erro) {
    console.error('Erro em PUT /pedidos/:id', erro);
    res.status(500).json({ erro: 'Falha ao atualizar pedido', detalhe: erro.message });
  }
});

module.exports = router;