// =============================================================
// middleware/auth.js
// -------------------------------------------------------------
// Middleware de autenticação JWT do Express.
//
// Função: validar o Firebase ID Token enviado pelo Angular em
// toda requisição HTTP, antes que ela chegue nas rotas.
//
// Como funciona:
//   1) Extrai o token do header "Authorization: Bearer <token>"
//   2) Pede pro Firebase Admin SDK verificar a assinatura do token
//   3) Se válido → coloca os dados do usuário em req.user e segue
//   4) Se inválido/ausente → responde HTTP 401 (não autorizado)
//
// Após esse middleware, qualquer rota tem acesso a:
//   req.user.uid    → ID único do usuário no Firebase
//   req.user.email  → email do usuário
//   req.user.cargo  → cargo (custom claim definido na criação)
// =============================================================

const admin = require('../firebase-admin');

async function verificarToken(req, res, next) {
  // 1) Extrai o token do header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Token nao fornecido. Envie no header Authorization: Bearer <token>',
    });
  }

  const token = authHeader.substring('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({ erro: 'Token vazio' });
  }

  // 2) Verifica o token com o Firebase Admin SDK
  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // 3) Coloca os dados do usuario em req.user para uso nas rotas
    req.user = {
      uid:   decoded.uid,
      email: decoded.email,
      cargo: decoded.cargo || null,  // custom claim — pode ser null se nao setado
    };

    next();  // libera a passagem para a rota
  } catch (erro) {
    // Caso especial: Firebase nao esta configurado (modo stub na Etapa 2/3)
    if (erro.message && erro.message.includes('[Firebase nao configurado]')) {
      return res.status(503).json({
        erro: 'Firebase Auth ainda nao foi configurado neste ambiente. ' +
              'Configure as credenciais no .env (Etapa 4) para autenticar requisicoes.',
      });
    }

    // 4) Token invalido, expirado ou problema de rede
    console.warn('Falha ao validar token:', erro.code || erro.message);

    return res.status(401).json({
      erro: 'Token invalido ou expirado',
      codigo: erro.code,
    });
  }
}

module.exports = verificarToken;