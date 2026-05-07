// ══════════════════════════════════════════════════
//  ROTA: Cardápio  /api/cardapio
// ══════════════════════════════════════════════════
const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET / — retorna { comidas:[], bebidas:[], sobremesas:[] }
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM cardapio ORDER BY id').all();
  res.json({
    comidas:    rows.filter(r => r.categoria === 'comidas'),
    bebidas:    rows.filter(r => r.categoria === 'bebidas'),
    sobremesas: rows.filter(r => r.categoria === 'sobremesas'),
  });
});

// POST / — criar item
router.post('/', (req, res) => {
  const { categoria, nome, emoji, preco } = req.body;
  if (!categoria || !nome)
    return res.status(400).json({ erro: 'Campos obrigatórios' });
  const info = db.prepare('INSERT INTO cardapio (categoria,nome,emoji,preco) VALUES (?,?,?,?)')
                  .run(categoria, nome, emoji || '🍽️', preco || 'R$ 0,00');
  res.status(201).json({ id: info.lastInsertRowid, categoria, nome, emoji, preco });
});

// PUT /:id — atualizar
router.put('/:id', (req, res) => {
  const { nome, emoji, preco } = req.body;
  db.prepare('UPDATE cardapio SET nome=?,emoji=?,preco=? WHERE id=?')
    .run(nome, emoji, preco, parseInt(req.params.id));
  res.json({ ok: true });
});

// DELETE /:id — excluir
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM cardapio WHERE id=?').run(parseInt(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
