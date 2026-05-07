// ══════════════════════════════════════════════════
//  ROTA: Funcionários  /api/funcionarios
//  Nota: na Etapa 12 esta rota será expandida para criar
//  o usuário correspondente no Firebase Auth e setar o
//  custom claim de cargo. Por ora, gerencia apenas o SQLite.
// ══════════════════════════════════════════════════
const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db');
const router  = express.Router();

// GET  / — listar todos (exceto o admin padrão)
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT id,nome,email,cargo FROM funcionarios WHERE email != ?').all('admin');
  res.json(rows);
});

// POST / — criar
router.post('/', (req, res) => {
  const { nome, email, cargo, senha } = req.body;
  if (!nome || !email || !cargo || !senha)
    return res.status(400).json({ erro: 'Campos obrigatórios' });

  const hash = bcrypt.hashSync(senha, 10);
  try {
    const info = db.prepare('INSERT INTO funcionarios (nome,email,cargo,senha) VALUES (?,?,?,?)')
                   .run(nome, email, cargo, hash);
    res.status(201).json({ id: info.lastInsertRowid, nome, email, cargo });
  } catch (e) {
    res.status(409).json({ erro: 'E-mail já cadastrado' });
  }
});

// PUT /:id — atualizar
router.put('/:id', (req, res) => {
  const { nome, email, cargo, senha } = req.body;
  const id = parseInt(req.params.id);

  if (senha) {
    db.prepare('UPDATE funcionarios SET nome=?,email=?,cargo=?,senha=? WHERE id=?')
      .run(nome, email, cargo, bcrypt.hashSync(senha, 10), id);
  } else {
    db.prepare('UPDATE funcionarios SET nome=?,email=?,cargo=? WHERE id=?')
      .run(nome, email, cargo, id);
  }
  res.json({ ok: true });
});

// DELETE /:id — excluir
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM funcionarios WHERE id=?').run(parseInt(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
