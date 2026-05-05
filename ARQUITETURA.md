# Arquitetura do Sistema Vizualliz v2

**Projeto:** Vizualliz — Sistema de Gestão para Restaurantes  
**Versão:** 2.0 (migração para Angular + Firebase)  
**Autor:** Gabriel Godoi  
**Data:** Maio de 2026

---

## 1. Visão Geral

O Vizualliz é um sistema de gestão para restaurantes que permite gerenciar pedidos,
mesas, cardápio, estoque, funcionários, delivery e fluxo de caixa.

Esta versão substitui o frontend HTML/vanilla JS por uma Single Page Application (SPA)
em **Angular**, mantendo o backend **Node.js/Express** existente com adaptações.
A autenticação migra para o **Firebase Auth** e dados operacionais em tempo real
passam a usar o **Firestore**.

### Stack tecnológica

| Camada | Tecnologia | Responsabilidade |
|--------|-----------|-----------------|
| Frontend | Angular 21 | Interface do usuário, roteamento, componentes |
| Autenticação | Firebase Auth | Login, logout, tokens JWT, gestão de sessão |
| Banco em tempo real | Firestore (Firebase) | Dados operacionais com atualização ao vivo |
| Backend | Node.js + Express | Regras de negócio, API REST, escrita no Firestore e SQLite |
| Banco relacional | SQLite | Cadastros estáveis, histórico financeiro |
| SDK servidor | Firebase Admin SDK | Operações privilegiadas no Firebase a partir do Node |

---

## 2. Fonte da Verdade por Entidade

A decisão de onde cada entidade "mora" foi tomada com base em dois critérios:
- **Necessidade de tempo real:** a informação precisa chegar a outros usuários
  imediatamente, sem que eles precisem recarregar a página?
- **Complexidade de regra de negócio:** a escrita envolve lógica que deve ser
  executada no servidor (cálculos, transações, validações de negócio)?

| Entidade | Onde mora | Fonte da verdade | Como Angular lê | Como Angular escreve |
|----------|-----------|-----------------|----------------|---------------------|
| **Autenticação** | Firebase Auth | Firebase Auth | SDK do Firebase (cliente) | SDK do Firebase — `signInWithEmailAndPassword()` |
| **funcionarios** (perfil + cargo) | SQLite | Node/SQLite | `GET /api/funcionarios` via HTTP | `POST/PUT/DELETE /api/funcionarios` via HTTP → Node cria usuário no Firebase Auth E salva no SQLite |
| **cardapio** | SQLite | Node/SQLite | `GET /api/cardapio` via HTTP | `POST/PUT/DELETE /api/cardapio` via HTTP |
| **estoque** | SQLite | Node/SQLite | `GET /api/estoque` via HTTP | `POST/PUT/DELETE /api/estoque` via HTTP |
| **mesas** | Firestore | Firestore | `onSnapshot()` — atualização em tempo real | `PUT /api/mesas/:num` → Node atualiza Firestore via Admin SDK |
| **pedidos** | Firestore | Firestore | `onSnapshot()` — atualização em tempo real | `POST /api/pedidos` / `PUT /api/pedidos/:id` → Node grava no Firestore E no SQLite (historico) ao encerrar |
| **delivery_orders** | Firestore | Firestore | `onSnapshot()` — atualização em tempo real | `POST /api/delivery` / `PUT /api/delivery/:id` → Node atualiza Firestore |
| **historico** | SQLite | Node/SQLite | `GET /api/caixa` via HTTP | Somente o Node escreve (nunca o Angular diretamente) ao encerrar pedido/delivery |

---

## 3. Diagrama de Fluxo de Leituras e Escritas

```
┌─────────────────────────────────────────────────────────────────┐
│                        ANGULAR (cliente)                        │
└───────────────┬─────────────────────────┬───────────────────────┘
                │                         │
    ESCRITAS (todas)              LEITURAS em tempo real
    HTTP + JWT no header          SDK Firebase (onSnapshot)
                │                         │
                ▼                         ▼
┌──────────────────────────┐   ┌─────────────────────────┐
│   NODE.JS / EXPRESS      │   │       FIRESTORE          │
│   (backend Node)         │   │   mesas / pedidos /      │
│                          │   │   delivery_orders        │
│  • valida JWT            │   └─────────────────────────┘
│  • aplica regras negócio │             ▲
│  • usa Firebase Admin SDK│─────────────┘
│    para escrever no      │   (Admin SDK escreve aqui,
│    Firestore             │    ignorando Security Rules)
│  • escreve no SQLite     │
│    (historico, cadastros)│
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────┐
│       SQLite         │
│  funcionarios        │
│  cardapio            │
│  estoque             │
│  historico           │
└──────────────────────┘

LEITURAS estáticas (sem tempo real):
  Angular ──HTTP + JWT──► Node ──► SQLite
  (cardápio, estoque, funcionários, caixa)
```

### Por que todas as escritas passam pelo Node?

Se o Angular pudesse escrever diretamente no Firestore, a regra de negócio
"ao marcar pedido como entregue, copiar para historico no SQLite" precisaria
ser executada no cliente — o que é inseguro (pode ser burlado) e cria
duplicidade de lógica. Centralizando escritas no Node:

1. A regra de negócio existe em um único lugar (o backend)
2. O token JWT é validado antes de qualquer operação
3. Operações que afetam dois bancos (Firestore + SQLite) ficam num único
   ponto de controle

---

## 4. Autenticação e Autorização

### 4.1 Firebase Auth

O Firebase Auth é responsável por:
- Criar e armazenar credenciais dos usuários (email + senha com hash)
- Emitir tokens JWT (ID Tokens) após login bem-sucedido
- Gerenciar sessões e renovação de tokens

O Angular usa o SDK do Firebase para fazer login:
```typescript
// Exemplo de login no Angular
await signInWithEmailAndPassword(auth, email, senha);
// O SDK armazena o token automaticamente e o renova antes de expirar
```

### 4.2 Custom Claims — como o cargo do funcionário chega ao token

O Firebase Auth por si só não sabe qual é o cargo (gerencia, garcom, cozinha, caixa)
de cada usuário. Para embutir essa informação no próprio token JWT, usamos
**Custom Claims** — campos extras adicionados ao token pelo servidor.

Quando o gerente cria um novo funcionário no sistema, o Node:
1. Cria o usuário no Firebase Auth via Admin SDK (`admin.auth().createUser()`)
2. Define o custom claim de cargo (`admin.auth().setCustomUserClaims(uid, { cargo })`)
3. Salva o perfil completo (nome, email, cargo) no SQLite

O token JWT resultante contém:
```json
{
  "uid": "abc123",
  "email": "garcom@vizualliz.com",
  "cargo": "garcom",         ← custom claim adicionado pelo Node
  "iat": 1234567890,
  "exp": 1234571490
}
```

O Angular lê o cargo do token decodificado sem precisar fazer chamadas extras
ao backend. Isso elimina uma consulta ao banco a cada requisição.

> **Nota importante:** Custom Claims levam até 1 hora para propagar a tokens
> já emitidos. Em produção, ao alterar o cargo de um funcionário, ele precisa
> fazer logout e login novamente para que o novo cargo entre em efeito.

### 4.3 Middleware de validação JWT no Node

Todas as rotas do backend são protegidas por um middleware que:
1. Extrai o token JWT do header `Authorization: Bearer <token>`
2. Verifica a assinatura do token com o Firebase Admin SDK
3. Decodifica o payload e coloca os dados do usuário em `req.user`
4. Rejeita a requisição com HTTP 401 se o token for inválido ou ausente

```javascript
// Exemplo do middleware (será implementado na Etapa 2)
async function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, cargo, ... }
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}
```

O Angular envia o token em toda requisição HTTP:
```typescript
// O AuthInterceptor no Angular injeta o token automaticamente em toda chamada HTTP
const token = await user.getIdToken();
headers = headers.set('Authorization', `Bearer ${token}`);
```

---

## 5. Firestore Security Rules

As Security Rules do Firestore funcionam como um firewall que decide quais
operações o SDK do cliente (Angular) pode executar. Elas são configuradas
no Console do Firebase e avaliadas pelo servidor do Firestore antes de
permitir qualquer leitura ou escrita.

**Ponto crítico:** O Firebase Admin SDK (usado pelo Node) **ignora completamente**
as Security Rules. Ele opera com credenciais de service account que têm
privilégios de administrador — equivalente a uma conexão direta ao banco,
sem passar pelo sistema de regras. Isso é o que garante que o Node pode
escrever no Firestore enquanto o Angular não pode.

### Regras configuradas no projeto

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Coleção de mesas:
    // - leitura permitida para qualquer usuário autenticado
    //   (garçons, cozinha, gerência precisam ver o status das mesas)
    // - escrita bloqueada para o cliente (apenas Node via Admin SDK pode alterar)
    match /mesas/{mesaId} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Coleção de pedidos:
    // - leitura permitida para usuários autenticados
    //   (cozinha precisa ver pedidos em tempo real)
    // - escrita bloqueada para o cliente (regra de negócio fica no Node)
    match /pedidos/{pedidoId} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Coleção de delivery:
    // - mesma lógica dos pedidos
    match /delivery_orders/{deliveryId} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Regra de segurança: bloqueia acesso a qualquer coleção
    // não mapeada explicitamente acima (princípio do menor privilégio)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Onde configurar essas regras

As Security Rules são configuradas no Console do Firebase:
`Firestore Database → Rules`

Serão configuradas na **Etapa 4**, antes de qualquer implementação de
funcionalidade que envolva escrita de dados.

---

## 6. Por que essa arquitetura? (resumo para defesa acadêmica)

Esta arquitetura foi escolhida por combinar três propriedades desejáveis
em sistemas distribuídos modernos:

**1. Separação de responsabilidades clara**
Cada tecnologia faz o que faz melhor: Firebase Auth gerencia identidade,
Firestore fornece sincronização em tempo real, Node.js aplica regras de negócio,
e SQLite armazena dados relacionais e histórico financeiro.

**2. Segurança em profundidade (defense in depth)**
A regra "todas as escritas passam pelo Node" é enforced por duas camadas:
- Firestore Security Rules bloqueiam escrita do cliente (`allow write: if false`)
- O middleware JWT no Node rejeita requisições sem token válido

Se uma camada falhar, a outra ainda protege o sistema.

**3. Experiência do usuário sem polling**
A substituição do `setInterval` de 5 segundos por `onSnapshot` do Firestore
elimina requisições desnecessárias, reduz latência percebida e remove a
"janela cega" entre atualizações. A cozinha vê um novo pedido no instante
em que ele é criado, sem esperar o próximo ciclo de polling.

---

## 7. Roadmap de Etapas

| # | Etapa | Objetivo principal |
|---|-------|-------------------|
| 2 | Estrutura e backend | Criar pastas, copiar e adaptar backend, adicionar middleware JWT |
| 3 | Projeto Angular | Inicializar app, estrutura de módulos e rotas |
| 4 | Configurar Firebase | Criar projeto no Console, configurar SDK, definir Security Rules |
| 5 | Autenticação | Login/logout com Firebase Auth, guards de rota por cargo |
| 6 | CRUD Cardápio | Primeira entidade completa: listagem + modal de edição |
| 7 | CRUD Mesas | Grid de mesas com atualização em tempo real via onSnapshot |
| 8 | Pedidos — criação | Wizard 3 passos: mesa → carrinho → confirmação |
| 9 | Cozinha | Tela de cozinha com onSnapshot, ações de status |
| 10 | Delivery | Gestão de pedidos delivery |
| 11 | Estoque | CRUD com filtro e busca |
| 12 | Funcionários | CRUD com gestão de cargo e Firebase Auth integrado |
| 13 | Caixa | Dashboard financeiro com KPIs e gráfico |
| 14 | Navegação final | Menu e controle de acesso por cargo |
| 15 | Polimento | Responsividade, toasts, loading states, testes finais |
