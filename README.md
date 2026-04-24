# TaskFlow Field

## Descrição

**TaskFlow Field** é uma aplicação full stack para organizar operações de serviço em campo.
A base do projeto agora está preparada para evoluir de um app web de tarefas para um produto com **dashboard web + app mobile**, compartilhando a mesma API.

Destaques atuais:
- autenticação com JWT
- API REST com Node.js, Express e MongoDB
- rotas versionadas em `/api/v1`
- frontend React com configuração por variável de ambiente
- modelo de dados pronto para crescer com cliente, endereço, data e checklist
- trial, planos comerciais e intenção de assinatura para validação de receita
- conta demo opcional com ordens de exemplo para validação rápida

## Deploy atual

- Frontend: [https://taskflowofc.vercel.app](https://taskflowofc.vercel.app)
- Backend: [https://taskflow-dlfs.onrender.com](https://taskflow-dlfs.onrender.com)

## Estratégia de produto

A direção de negócio é detalhada em [docs/product-strategy.md](docs/product-strategy.md).

Resumo do nicho escolhido:
- prestadores de serviço autônomos
- pequenas equipes de manutenção e assistência técnica
- operações que dependem de celular e visitas em campo

## Tecnologias

- Frontend web: React, Vite, Tailwind CSS, React Icons
- Backend: Node.js, Express, MongoDB Atlas, JWT, bcryptjs, Mongoose
- Deploy: Vercel e Render

## Como rodar localmente

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cp .env.example .env
npm install
npm run dev
```

## Variáveis de ambiente

### Frontend

```bash
VITE_API_URL=http://localhost:5001/api/v1
VITE_DEMO_ACCOUNT_ENABLED=true
VITE_DEMO_USERNAME=demo@taskflow.com
VITE_DEMO_PASSWORD=taskflow123
```

### Backend

```bash
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=troque-por-um-segredo-forte
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,exp://127.0.0.1:8081
DEMO_ACCOUNT_ENABLED=true
DEMO_USERNAME=demo@taskflow.com
DEMO_PASSWORD=taskflow123
DEMO_FULL_NAME=Equipe Demo TaskFlow
```

## Próximos passos

- validar 3 interessados fortes ou pagantes manuais
- plugar checkout real quando houver sinal comercial
- preparar build de produção do app mobile quando a venda justificar
