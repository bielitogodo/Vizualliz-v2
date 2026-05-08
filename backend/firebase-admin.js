// =============================================================
// firebase-admin.js
// -------------------------------------------------------------
// Inicialização do Firebase Admin SDK no backend.
//
// Modos de operação:
//   1) MODO REAL   → quando há credenciais no .env, conecta no
//                    projeto Firebase real.
//   2) MODO STUB   → quando NÃO há credenciais, retorna um objeto
//                    fake que permite o servidor subir sem quebrar.
//                    Chamadas a admin.firestore() ou admin.auth()
//                    lançam erro claro indicando que o Firebase
//                    ainda não foi configurado (vem na Etapa 4).
//
// Por que o modo stub existe?
//   Para que durante o desenvolvimento (Etapas 2 e 3) o backend
//   suba e testemos as rotas que NÃO dependem do Firebase
//   (cardapio, estoque, funcionarios, caixa) antes de configurar
//   o projeto Firebase de verdade.
// =============================================================

const admin = require('firebase-admin');

// Verifica se as três variáveis essenciais do Firebase estão presentes
const projectId   = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey  = process.env.FIREBASE_PRIVATE_KEY;

const credenciaisCompletas = projectId && clientEmail && privateKey;

if (credenciaisCompletas) {
  // ----- MODO REAL -----
  // A privateKey vem do .env com \n literais (texto), precisa
  // converter de volta para quebras de linha reais.
  const credencial = {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(credencial),
  });

  console.log('🔥 Firebase Admin SDK inicializado (modo real)');
} else {
  // ----- MODO STUB -----
  // Não inicializa nada. Substitui firestore() e auth() por
  // funções que falham com mensagem clara se forem chamadas.
  console.warn('⚠️  Firebase Admin SDK NÃO inicializado — credenciais ausentes no .env');
  console.warn('   Rotas que usam Firestore/Auth não funcionarão até a Etapa 4.');

  const erroStub = (servico) => () => {
    throw new Error(
      `[Firebase não configurado] Tentativa de usar admin.${servico}() sem credenciais. ` +
      `Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no .env (Etapa 4).`
    );
  };

  admin.firestore = erroStub('firestore');
  admin.auth      = erroStub('auth');
}

module.exports = admin;