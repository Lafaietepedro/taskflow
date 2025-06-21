# TaskFlow - Modern To-Do List App

Uma aplicação moderna de lista de tarefas construída com React e Tailwind CSS.

## Características

- ✅ Interface moderna e responsiva
- 🎨 Design com efeito glass e gradientes
- 📱 Compatível com dispositivos móveis
- 🔍 Busca e filtros avançados
- 📊 Prioridades coloridas para tarefas
- 💾 Armazenamento local (localStorage)
- ⚡ Animações suaves

## Estrutura do Projeto

```
taskflow-todo-app/
├── public/
│   ├── index.html
│   └── index.css
├── src/
│   ├── components/
│   │   ├── TaskForm.js
│   │   ├── TaskItem.js
│   │   ├── TaskFilter.js
│   │   └── TaskList.js
│   ├── context/
│   │   └── TodoContext.js
│   └── index.js
├── package.json
└── README.md
```

## Como Executar

1. Navegue até o diretório do projeto
2. Execute o comando: `npm start` ou `python3 -m http.server 3000`
3. Abra o navegador em `http://localhost:3000`

## Funcionalidades

### Gerenciamento de Tarefas
- Adicionar novas tarefas com título, descrição e prioridade
- Editar tarefas existentes
- Marcar tarefas como concluídas
- Excluir tarefas

### Organização
- Filtrar por: Todas, Ativas, Concluídas
- Buscar tarefas por título ou descrição
- Ordenar por: Data, Título, Prioridade

### Interface
- Design moderno com efeito glass
- Cores diferenciadas por prioridade:
  - 🔵 Baixa (Azul)
  - 🟡 Média (Amarelo)
  - 🔴 Alta (Vermelho)
- Animações suaves para interações
- Checkboxes customizados

## Tecnologias Utilizadas

- React 18
- Tailwind CSS
- JavaScript ES6+
- HTML5
- CSS3

## Licença

MIT License

