require('dotenv').config();
require('./firebase-admin'); // inicializa o Firebase Admin SDK ao subir o servidor

const express        = require('express');
const verificarToken = require('./middleware/auth');

const app = express();
app.use(express.json());

// Rota de health check — sem autenticação (usada para verificar se o servidor está no ar)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Todas as rotas abaixo exigem um Firebase ID Token válido no header Authorization.
// O middleware verificarToken valida o token e popula req.user com os dados do usuário.
app.use('/api/funcionarios', verificarToken, require('./routes/funcionarios'));
app.use('/api/cardapio',     verificarToken, require('./routes/cardapio'));
app.use('/api/estoque',      verificarToken, require('./routes/estoque'));
app.use('/api/mesas',        verificarToken, require('./routes/mesas'));
app.use('/api/pedidos',      verificarToken, require('./routes/pedidos'));
app.use('/api/delivery',     verificarToken, require('./routes/delivery'));
app.use('/api/caixa',        verificarToken, require('./routes/caixa'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  🍽️  Vizualliz v2 rodando!');
  console.log(`  🌐  Backend: http://localhost:${PORT}`);
  console.log('  🗄️  Banco:  vizualliz.db (SQLite)');
  console.log('');
});
