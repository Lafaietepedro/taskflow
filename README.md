# TaskFlow Field

## Descricao

**TaskFlow Field** e uma aplicacao full stack para organizar operacoes de servico em campo.
A base do projeto agora esta preparada para evoluir de um app web de tarefas para um produto com **dashboard web + app mobile**, compartilhando a mesma API.

Destaques atuais:
- autenticacao com JWT
- API REST com Node.js, Express e MongoDB
- rotas versionadas em `/api/v1`
- frontend React com configuracao por variavel de ambiente
- modelo de dados pronto para crescer com cliente, endereco, data e checklist
- conta demo opcional com ordens de exemplo para validacao rapida

## Deploy atual

- Frontend: [https://taskflowofc.vercel.app](https://taskflowofc.vercel.app)
- Backend: [https://taskflow-dlfs.onrender.com](https://taskflow-dlfs.onrender.com)

## Estrategia de produto

A direcao de negocio e detalhada em [docs/product-strategy.md](docs/product-strategy.md).

Resumo do nicho escolhido:
- prestadores de servico autonomos
- pequenas equipes de manutencao e assistencia tecnica
- operacoes que dependem de celular e visitas em campo

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

## Variaveis de ambiente

### Frontend

```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_DEMO_ACCOUNT_ENABLED=true
VITE_DEMO_USERNAME=demo@taskflow.com
VITE_DEMO_PASSWORD=taskflow123
```

### Backend

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=troque-por-um-segredo-forte
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,exp://127.0.0.1:8081
DEMO_ACCOUNT_ENABLED=true
DEMO_USERNAME=demo@taskflow.com
DEMO_PASSWORD=taskflow123
DEMO_FULL_NAME=Equipe Demo TaskFlow
```

## Proximos passos

- enriquecer a ordem de servico com cliente e data no frontend
- criar app mobile com React Native e Expo usando a mesma API
- adicionar onboarding e testes de API
