# 🍴 Vizualliz Restaurant

> Sistema de gestão para restaurantes, com foco em controle de pedidos em tempo real.

**Vizualliz** é um sistema web desenvolvido com Angular e Firebase...

Projeto desenvolvido para o Projeto Integrador.

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com e-mail e senha via Firebase Authentication
- Sessão protegida por JWT
- Rotas privadas com redirecionamento automático

### 🍽️ Cardápio
- Cadastro de pratos (nome + preço)
- Listagem com formatação monetária
- Remoção com confirmação

### 🪑 Mesas
- Cadastro de mesas (número + capacidade)
- Visualização em grid com números em destaque
- Validação de número duplicado

### 📋 Pedidos
- Criação de pedidos vinculados a mesa e cardápio
- Quantidades ajustáveis
- Cálculo automático do total
- Fluxo de status: Pedido feito → Entregue → Finalizado
- Filtros por status com contadores
- Indicador de tempo relativo (ex: "Há 5 minutos")
- Cores visuais por status

### 📊 Dashboard
- Total de pedidos do dia
- Faturamento do dia
- Pedidos em andamento
- Total de mesas cadastradas
- Atualização em tempo real

---

## 🛠️ Tecnologias

**Frontend:** Angular 21, TypeScript, SCSS, @angular/fire, Angular Signals

**Backend:** Node.js, Express, Firebase Admin SDK, JWT Middleware

**Infraestrutura:** Firebase Authentication, Cloud Firestore, Firebase Security Rules

**Dev Tools:** Git, GitHub, VS Code, Conventional Commits

## 🏗️ Arquitetura

O Vizualliz utiliza uma arquitetura híbrida entre cliente e nuvem:

- O frontend Angular conversa diretamente com o Firebase Auth (login) e o Cloud Firestore (dados)
- O backend Node.js está preparado para operações privilegiadas via Firebase Admin SDK
- Defense in depth com Firestore Security Rules e autenticação obrigatória em todas as operações


## 🔄 Fluxo do pedido

O sistema implementa o ciclo de vida real de um pedido em restaurante:

1. **Pedido feito** 🟡 — Pedido recém-criado, aguardando preparo
2. **Entregue** 🟢 — Pedido entregue na mesa
3. **Finalizado** 🔵 — Cliente pagou, pedido concluído

Cada status tem cor visual distinta. O avanço ocorre apenas uma etapa por vez, preservando a integridade do fluxo.

## 🔒 Segurança

Camadas de proteção implementadas:

1. **Firebase Authentication** — Acesso ao app exige login válido
2. **Firestore Security Rules** — Operações de leitura e escrita exigem usuário autenticado
3. **JWT Validation** — Backend valida tokens antes de processar requisições
4. **.gitignore** — Credenciais sensíveis bloqueadas no versionamento

Arquivos sensíveis que nunca devem ser versionados: backend/.env e backend/serviceAccountKey.json. Use sempre o .env.example como template.

## 🗺️ Roadmap

Funcionalidades planejadas para próximas versões:

- Reset de senha via Firebase
- Login social (Google, Facebook)
- Sistema de delivery (rotas backend já preparadas)
- Controle de estoque com baixa automática
- Múltiplos cargos (Gerente, Garçom) via Custom Claims
- Histórico de pedidos finalizados com filtros por período
- Relatórios mensais e por categoria

## 👤 Autor

**Gabriel Godoi de Moraes**

GitHub: [@bielitogodo](https://github.com/bielitogodo)
Projeto desenvolvido para fins acadêmicos no contexto de Projeto Integrador.

Feito com 🤍 e Angular