// ══════════════════════════════════════════════════
//  ROTA: Mesas  /api/mesas
//  Fonte da verdade: Firestore (coleção "mesas")
//  Leitura em tempo real no Angular: onSnapshot()
//  Escrita: Angular → este endpoint → Admin SDK → Firestore
// ══════════════════════════════════════════════════
const express = require('express');
const admin   = require('../firebase-admin');
const router  = express.Router();

// Retorna false e responde 503 se o Firebase Admin SDK não estiver inicializado.
// Isso acontece em desenvolvimento antes de configurar as credenciais (Etapa 4).
function firebaseGuard(res) {
  if (!admin.apps.length) {
    res.status(503).json({ erro: 'Firebase não configurado — adicione as credenciais no .env (Etapa 4)' });
    return false;
  }
  return true;
}

// GET / — lista todas as mesas do Firestore
// O Angular usa onSnapshot para leitura em tempo real; este endpoint
// é útil para testes REST e para leituras únicas (não reativas).
router.get('/', async (req, res) => {
  if (!firebaseGuard(res)) return;
  try {
    const snap = await admin.firestore().collection('mesas').orderBy('num').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT /:num — atualiza o status de uma mesa (livre | ocupada | reservada)
router.put('/:num', async (req, res) => {
  if (!firebaseGuard(res)) return;
  const { status } = req.body;
  try {
    await admin.firestore().collection('mesas').doc(req.params.num).update({ status });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
