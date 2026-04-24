# TaskFlow Field: nicho, monetizacao e roadmap

## Nicho escolhido

TaskFlow deixa de ser um gerenciador de tarefas generico e passa a focar em **prestadores de servico e pequenas equipes de campo**.

Perfis iniciais mais promissores:
- assistencia tecnica e manutencao residencial
- instaladores de internet, cameras, ar-condicionado e energia solar
- equipes pequenas de limpeza e vistoria
- autonomos que fazem visitas recorrentes em clientes

## Por que este nicho

A operacao acontece no celular, fora do escritorio, com necessidade de registrar:
- proxima visita
- cliente
- endereco
- status da ordem
- checklist rapido
- comprovacao de execucao

Isso aumenta a chance de cobranca recorrente porque o app ajuda a:
- reduzir esquecimento de visitas
- organizar a agenda operacional
- padronizar execucao
- evitar retrabalho
- dar visibilidade ao dono do negocio

## Dor principal

Pequenas equipes normalmente alternam entre WhatsApp, bloco de notas, planilhas e papel. O resultado e desorganizacao, perda de prazo e falta de historico por cliente.

## Proposta de valor

"O jeito mais simples de uma equipe pequena organizar servicos em campo sem depender de planilha, papel e conversa solta no WhatsApp."

## MVP rentavel

Primeira versao paga:
- cadastro de ordens de servico
- status por ordem: pendente, em andamento, concluido
- cliente, telefone, endereco e data do servico
- checklist por servico
- busca e filtros
- painel web para o dono
- app mobile para o tecnico
- notificacoes de lembrete

## Diferencial competitivo

O foco nao e competir de frente com plataformas grandes de field service. O diferencial e:
- onboarding rapido
- UX simples para equipes pequenas
- preco acessivel
- mobile first
- recursos essenciais sem excesso de complexidade

## Monetizacao sugerida

### Estrategia inicial

Cobrar assinatura mensal B2B simples.

Faixas sugeridas para validacao:
- Plano Solo: R$ 29/mes, 1 usuario
- Plano Equipe: R$ 79/mes, ate 5 usuarios
- Plano Campo Pro: R$ 149/mes, ate 15 usuarios

### Extras futuros

- usuarios adicionais
- relatorios exportaveis
- fotos por servico
- assinatura do cliente na conclusao
- integracao com cobranca e fatura

## Como vender no inicio

Canal mais realista:
- prospeccao direta no WhatsApp e Instagram
- grupos locais de prestadores
- parcerias com assistencias tecnicas e instaladores
- landing page com teste gratis de 7 dias

## Roadmap

### Fase 1: base de produto
- preparar backend para web e mobile compartilhados
- trocar task generica por ordem de servico enriquecida
- organizar autenticacao, CORS e versao da API
- criar variaveis de ambiente corretas no frontend

### Fase 2: validacao com nicho
- dashboard web com cliente, endereco e data
- status mais rico por ordem
- filtros por tecnico, prioridade e periodo
- onboarding com conta demo
- entrevistas com 10 a 20 prestadores

Status Gold atual:
- painel web ja opera ordens enriquecidas com cliente, telefone, endereco, data, prioridade, tecnico responsavel e checklist
- filtros web por status, tecnico, prioridade, periodo, busca textual e radar de agenda
- conta demo disponivel para demonstracao guiada e validacao rapida
- pendente fora do codigo: executar entrevistas com 10 a 20 prestadores e registrar aprendizados

### Fase 3: mobile
- app React Native com Expo
- login compartilhado com a mesma API
- lista de ordens do dia
- atualizacao de status no campo
- notificacoes push
- modo offline basico com sincronizacao

Status Gold atual:
- app Expo validado no Expo Go com login compartilhado e API configuravel
- lista mobile com busca, status, prioridade, periodo, tecnico e resumo de agenda
- detalhe da ordem com checklist, status, telefone, endereco, tecnico, foto de comprovante, ligacao, rota e WhatsApp
- cache offline e fila de sincronizacao para status/checklist/comprovante
- notificacoes locais prontas para development build; push remoto fica como etapa de infraestrutura de producao

### Fase 4: receita
- trial gratuito
- checkout de assinatura
- landing page focada em nicho
- metricas de ativacao e retencao

## KPIs para acompanhar

- contas criadas por semana
- percentual que cadastra a primeira ordem em 10 minutos
- empresas que voltam no dia seguinte
- ordens concluida por usuario ativo
- conversao do trial para pago
- churn mensal

## Benchmark de mercado

O espaco e competitivo, mas validado. Ferramentas maiores do setor enfatizam agenda, despacho, mobilidade, historico do cliente e ganho de horas operacionais, o que confirma que o problema tem valor economico.

Referencias usadas:
- Forbes Advisor, "Best Field Service Software", acessado em 23 de abril de 2026: https://www.forbes.com/advisor/business/software/best-field-service-software-original/
- Forbes Advisor, "Jobber Review", acessado em 23 de abril de 2026: https://www.forbes.com/advisor/business/software/jobber-review/
- Gartner Digital Markets, "Insights From Our Software Advisors: Stand Out in Field Service Management", 9 de outubro de 2025: https://www.gartner.com/en/digital-markets/insights/stand-out-in-field-service-management
