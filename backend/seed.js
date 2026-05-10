// =============================================================
// seed.js
// -------------------------------------------------------------
// Script para popular o banco SQLite com dados de desenvolvimento.
//
// Como rodar:
//   cd backend
//   node seed.js
//
// O que faz:
//   1) Limpa as tabelas funcionarios, cardapio e estoque
//   2) Insere dados de exemplo equivalentes ao banco antigo
//   3) Senhas dos funcionarios sao hasheadas com bcrypt
//
// IMPORTANTE: este script NAO insere nada no Firestore.
// Mesas, pedidos e delivery_orders ficam no Firestore e devem
// ser criados pelo proprio sistema rodando.
// =============================================================

const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('🌱 Iniciando seed do banco SQLite...\n');

// -------------------------------------------------------------
// 1) Limpa tabelas (preserva schema)
// -------------------------------------------------------------
console.log('🧹 Limpando tabelas...');
db.exec('DELETE FROM funcionarios');
db.exec('DELETE FROM cardapio');
db.exec('DELETE FROM estoque');
db.exec('DELETE FROM historico');

// -------------------------------------------------------------
// 2) Funcionarios (senha = "123456" para todos, hash bcrypt)
// -------------------------------------------------------------
console.log('👥 Inserindo funcionarios...');

const senhaHash = bcrypt.hashSync('123456', 10);
const insertFunc = db.prepare(`
  INSERT INTO funcionarios (nome, email, cargo, senha)
  VALUES (?, ?, ?, ?)
`);

const funcionarios = [
  { nome: 'Admin',          email: 'admin@vizualliz.com',     cargo: 'gerencia' },
  { nome: 'Gabriel Godoi',  email: 'gabriel@vizualliz.com',   cargo: 'gerencia' },
  { nome: 'Maria Silva',    email: 'maria@vizualliz.com',     cargo: 'garcom'   },
  { nome: 'Joao Souza',     email: 'joao@vizualliz.com',      cargo: 'garcom'   },
  { nome: 'Ana Costa',      email: 'ana@vizualliz.com',       cargo: 'cozinha'  },
  { nome: 'Pedro Lima',     email: 'pedro@vizualliz.com',     cargo: 'cozinha'  },
  { nome: 'Carla Souza',    email: 'carla@vizualliz.com',     cargo: 'caixa'    },
];

funcionarios.forEach((f) => {
  insertFunc.run(f.nome, f.email, f.cargo, senhaHash);
});

console.log(`   ✅ ${funcionarios.length} funcionarios inseridos`);

// -------------------------------------------------------------
// 3) Cardapio
// -------------------------------------------------------------
console.log('🍔 Inserindo cardapio...');

const insertCard = db.prepare(`
  INSERT INTO cardapio (categoria, nome, emoji, preco)
  VALUES (?, ?, ?, ?)
`);

const cardapio = [
  { categoria: 'Lanches',   nome: 'X-Burger',        emoji: '🍔', preco: 'R$ 22,00' },
  { categoria: 'Lanches',   nome: 'X-Salada',        emoji: '🥗', preco: 'R$ 24,00' },
  { categoria: 'Lanches',   nome: 'X-Bacon',         emoji: '🥓', preco: 'R$ 28,00' },
  { categoria: 'Pizzas',    nome: 'Pizza Margherita', emoji: '🍕', preco: 'R$ 45,00' },
  { categoria: 'Pizzas',    nome: 'Pizza Calabresa',  emoji: '🍕', preco: 'R$ 49,00' },
  { categoria: 'Bebidas',   nome: 'Coca-Cola 350ml', emoji: '🥤', preco: 'R$ 7,00'  },
  { categoria: 'Bebidas',   nome: 'Suco de Laranja', emoji: '🍊', preco: 'R$ 9,00'  },
  { categoria: 'Sobremesas', nome: 'Pudim',          emoji: '🍮', preco: 'R$ 12,00' },
  { categoria: 'Sobremesas', nome: 'Sorvete',        emoji: '🍦', preco: 'R$ 10,00' },
];

cardapio.forEach((item) => {
  insertCard.run(item.categoria, item.nome, item.emoji, item.preco);
});

console.log(`   ✅ ${cardapio.length} itens de cardapio inseridos`);

// -------------------------------------------------------------
// 4) Estoque
// -------------------------------------------------------------
console.log('📦 Inserindo estoque...');

const insertEst = db.prepare(`
  INSERT INTO estoque (nome, emoji, cat, und, unidade, validade, entrada, custo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const estoque = [
  { nome: 'Pao de hamburguer', emoji: '🍞', cat: 'Paes',     und: 50,  unidade: 'un', validade: '2026-12-31', entrada: '2026-05-01', custo: 1.50 },
  { nome: 'Carne bovina 150g', emoji: '🥩', cat: 'Carnes',   und: 30,  unidade: 'un', validade: '2026-06-15', entrada: '2026-05-01', custo: 8.00 },
  { nome: 'Queijo mussarela',  emoji: '🧀', cat: 'Laticinios', und: 5, unidade: 'kg', validade: '2026-08-20', entrada: '2026-05-01', custo: 32.00 },
  { nome: 'Alface',            emoji: '🥬', cat: 'Verduras', und: 10,  unidade: 'pc', validade: '2026-05-15', entrada: '2026-05-01', custo: 3.00 },
  { nome: 'Tomate',            emoji: '🍅', cat: 'Verduras', und: 8,   unidade: 'kg', validade: '2026-05-20', entrada: '2026-05-01', custo: 6.00 },
  { nome: 'Bacon fatiado',     emoji: '🥓', cat: 'Carnes',   und: 3,   unidade: 'kg', validade: '2026-07-10', entrada: '2026-05-01', custo: 45.00 },
  { nome: 'Coca-Cola 350ml',   emoji: '🥤', cat: 'Bebidas',  und: 60,  unidade: 'un', validade: '2027-01-15', entrada: '2026-05-01', custo: 3.50 },
  { nome: 'Suco de laranja',   emoji: '🍊', cat: 'Bebidas',  und: 20,  unidade: 'un', validade: '2026-08-01', entrada: '2026-05-01', custo: 4.00 },
];

estoque.forEach((item) => {
  insertEst.run(item.nome, item.emoji, item.cat, item.und, item.unidade, item.validade, item.entrada, item.custo);
});

console.log(`   ✅ ${estoque.length} itens de estoque inseridos`);

// -------------------------------------------------------------
// Conclusao
// -------------------------------------------------------------
console.log('\n✨ Seed concluido com sucesso!');
console.log('\n🔑 Credenciais de teste (todas com senha "123456"):');
funcionarios.forEach((f) => {
  console.log(`   ${f.cargo.padEnd(10)} → ${f.email}`);
});
console.log('\n⚠️  Lembre-se: estes dados sao apenas para desenvolvimento.'); 