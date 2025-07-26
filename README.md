# TaskFlow

## Descrição

**TaskFlow** é uma aplicação web fullstack para gerenciamento de tarefas.
O sistema permite que usuários criem, visualizem, filtrem, atualizem e removam tarefas de forma segura e intuitiva, com autenticação real baseada em JWT e persistência de dados em banco de dados na nuvem (MongoDB Atlas).

Destaques do projeto:
- **Design moderno e responsivo**, com gradientes animados, efeito glassmorphism e experiência de usuário fluida.
- **Autenticação e cadastro de usuários**, protegendo as tarefas de cada usuário.
- **Integração real entre frontend e backend**, utilizando API RESTful desenvolvida em Node.js/Express.
- **Feedback visual aprimorado**, com loaders, mensagens de sucesso/erro e animações suaves.
- **Filtros dinâmicos** (todas, ativas, concluídas) e busca por texto para facilitar a organização.
- **Deploy completo**: tanto o frontend quanto o backend estão publicados e prontos para uso.

![TaskFlow Demo](./public/demo.gif) <!-- Substitua por um GIF ou print do app -->

## 🚀 Deploy

- **Frontend:** [https://taskflowofc.vercel.app](https://seu-frontend.vercel.app)
- **Backend:** [https://taskflow-dlfs.onrender.com](https://seu-backend.onrender.com)

## ✨ Funcionalidades

- Cadastro e login de usuário (JWT)
- CRUD de tarefas por usuário autenticado
- Busca, filtro e limpeza de tarefas concluídas
- Feedback visual, loaders e animações
- Design moderno e responsivo (Tailwind CSS)
- API RESTful com Node.js, Express e MongoDB Atlas

## 🛠️ Tecnologias

- **Frontend:** React, Vite, Tailwind CSS, React Icons
- **Backend:** Node.js, Express, MongoDB Atlas, JWT, bcryptjs
- **Deploy:** Vercel (frontend), Render (backend)

## ⚙️ Como rodar localmente

### Backend

```bash
cd backend
npm install
# Crie o arquivo .env com suas variáveis (veja .env.example)
npm run dev
```

### Frontend

```bash
npm install
npm run dev
```
Acesse [http://localhost:5173](http://localhost:5173)

## 💡 Diferenciais

- Visual moderno com gradiente animado e glassmorphism
- Autenticação real com JWT
- Integração fullstack (React + Node + MongoDB)
- Código limpo, componentizado e fácil de evoluir
- Pronto para portfólio e entrevistas

## 👤 Contato

- [Seu LinkedIn](www.linkedin.com/in/lafaiete-almeida-dev)
- [GitHub](https://github.com/Lafaietepedro)

---
