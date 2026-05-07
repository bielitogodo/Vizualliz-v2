// ══════════════════════════════════════════════════
//  ROTA: Estoque  /api/estoque
// ══════════════════════════════════════════════════
const express = require('express');
const db      = require('../db');
const router  = express.Router();

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM estoque ORDER BY id').all());
});

router.post('/', (req, res) => {
  const { nome, emoji, cat, und, unidade, validade, entrada, custo } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
  const info = db.prepare(
    'INSERT INTO estoque (nome,emoji,cat,und,unidade,validade,entrada,custo) VALUES (?,?,?,?,?,?,?,?)'
  ).run(nome, emoji||'📦', cat||'alimentos', und||0, unidade||'Und', validade||'', entrada||'', custo||'R$ 0,00');
  res.status(201).json({ id: info.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { nome, emoji, cat, und, unidade, validade, entrada, custo } = req.body;
  db.prepare(
    'UPDATE estoque SET nome=?,emoji=?,cat=?,und=?,unidade=?,validade=?,entrada=?,custo=? WHERE id=?'
  ).run(nome, emoji, cat, und, unidade, validade, entrada, custo, parseInt(req.params.id));
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM estoque WHERE id=?').run(parseInt(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
