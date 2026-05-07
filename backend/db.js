const Database = require('better-sqlite3');
const path     = require('path');

const db = new Database(path.join(__dirname, 'vizualliz.db'));
db.pragma('journal_mode = WAL');

// Tabelas SQLite do Vizualliz v2.
// mesas, pedidos e delivery_orders foram movidas para o Firestore —
// apenas dados estáveis e o histórico financeiro ficam aqui.
db.exec(`
  CREATE TABLE IF NOT EXISTS funcionarios (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nome         TEXT NOT NULL,
    email        TEXT UNIQUE NOT NULL,
    cargo        TEXT NOT NULL,
    senha        TEXT NOT NULL,
    firebase_uid TEXT
  );

  CREATE TABLE IF NOT EXISTS cardapio (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL,
    nome      TEXT NOT NULL,
    emoji     TEXT DEFAULT '🍽️',
    preco     TEXT DEFAULT 'R$ 0,00'
  );

  CREATE TABLE IF NOT EXISTS estoque (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nome     TEXT NOT NULL,
    emoji    TEXT DEFAULT '📦',
    cat      TEXT DEFAULT 'alimentos',
    und      INTEGER DEFAULT 0,
    unidade  TEXT DEFAULT 'Und',
    validade TEXT DEFAULT '',
    entrada  TEXT DEFAULT '',
    custo    TEXT DEFAULT 'R$ 0,00'
  );

  CREATE TABLE IF NOT EXISTS historico (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT NOT NULL,
    emoji      TEXT DEFAULT '🍽️',
    mesa       TEXT DEFAULT '',
    obs        TEXT DEFAULT '',
    hora       TEXT DEFAULT '',
    quant      INTEGER DEFAULT 1,
    preco      TEXT DEFAULT 'R$ 0,00',
    delivery   INTEGER DEFAULT 0,
    resultado  TEXT DEFAULT 'entregue',
    fechado_em TEXT DEFAULT ''
  );
`);

module.exports = db;
