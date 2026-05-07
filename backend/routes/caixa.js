const express = require('express');
const db      = require('../db');
const router  = express.Router();

function parsePreco(str) {
  return parseFloat((str || '0').replace(/[R$\s]/g, '').replace('.', '').replace(',', '.')) || 0;
}

// GET / — receita do dia baseada no histórico
router.get('/', (req, res) => {
  const hoje = new Date().toLocaleDateString('sv-SE');

  const entregues = db.prepare(
    "SELECT * FROM historico WHERE resultado='entregue' AND fechado_em LIKE ?"
  ).all(hoje + '%');

  const cancelados = db.prepare(
    "SELECT COUNT(*) as c FROM historico WHERE resultado='cancelado' AND fechado_em LIKE ?"
  ).get(hoje + '%').c;

  const receita      = entregues.reduce((s, r) => s + parsePreco(r.preco) * r.quant, 0);
  const qtdPedidos   = entregues.reduce((s, r) => s + r.quant, 0);
  const qtdMesa      = entregues.filter(r => !r.delivery).reduce((s, r) => s + r.quant, 0);
  const qtdDelivery  = entregues.filter(r =>  r.delivery).reduce((s, r) => s + r.quant, 0);

  // Despesas estimadas (65% da receita — custo operacional típico de restaurante)
  const despesas = receita * 0.65;

  res.json({ receita, despesas, qtdPedidos, qtdMesa, qtdDelivery, cancelados });
});

module.exports = router;
