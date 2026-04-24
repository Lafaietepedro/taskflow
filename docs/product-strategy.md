# TaskFlow Field: nicho, monetização e roadmap

## Decisão de produto

O projeto mantém o foco inicial em **prestadores de serviço e pequenas equipes de campo**.

A alternativa de transformar o produto em um gerenciador genérico foi descartada por enquanto porque aumentaria a competição direta com ferramentas maduras de tarefas e produtividade. A aposta continua sendo um produto mais específico, fácil de explicar e forte como portfólio: ordens de serviço, cliente, agenda, técnico, checklist e acompanhamento operacional em web + mobile.

## Nicho escolhido

TaskFlow deixa de ser um gerenciador de tarefas genérico e passa a focar em **prestadores de serviço e pequenas equipes de campo**.

Perfis iniciais mais promissores:
- assistência técnica e manutenção residencial
- instaladores de internet, câmeras, ar-condicionado e energia solar
- equipes pequenas de limpeza e vistoria
- autônomos que fazem visitas recorrentes em clientes

## Por que este nicho

A operação acontece no celular, fora do escritório, com necessidade de registrar:
- próxima visita
- cliente
- endereço
- status da ordem
- checklist rápido
- comprovação de execução

Isso aumenta a chance de cobrança recorrente porque o app ajuda a:
- reduzir esquecimento de visitas
- organizar a agenda operacional
- padronizar execução
- evitar retrabalho
- dar visibilidade ao dono do negócio

## Dor principal

Pequenas equipes normalmente alternam entre WhatsApp, bloco de notas, planilhas e papel. O resultado é desorganização, perda de prazo e falta de histórico por cliente.

## Proposta de valor

"O jeito mais simples de uma equipe pequena organizar serviços em campo sem depender de planilha, papel e conversa solta no WhatsApp."

## MVP rentável

Primeira versão paga:
- cadastro de ordens de serviço
- status por ordem: pendente, em andamento, concluído
- cliente, telefone, endereço e data do serviço
- checklist por serviço
- busca e filtros
- painel web para o dono
- app mobile para o técnico
- notificações de lembrete

## Diferencial competitivo

O foco não é competir de frente com plataformas grandes de field service. O diferencial é:
- onboarding rápido
- UX simples para equipes pequenas
- preço acessível
- mobile first
- recursos essenciais sem excesso de complexidade

## Monetização sugerida

### Estratégia inicial

Cobrar assinatura mensal B2B simples.

Faixas sugeridas para validação:
- Plano Solo: R$ 29/mês, 1 usuário
- Plano Equipe: R$ 79/mês, até 5 usuários
- Plano Campo Pro: R$ 149/mês, até 15 usuários

### Extras futuros

- usuários adicionais
- relatórios exportáveis
- fotos por serviço
- assinatura do cliente na conclusão
- integração com cobrança e fatura

## Como vender no início

Canal mais realista:
- prospecção direta no WhatsApp e Instagram
- grupos locais de prestadores
- parcerias com assistências técnicas e instaladores
- landing page com teste grátis de 7 dias

## Roadmap

### Fase 1: base de produto
- preparar backend para web e mobile compartilhados
- trocar task genérica por ordem de serviço enriquecida
- organizar autenticação, CORS e versão da API
- criar variáveis de ambiente corretas no frontend

### Fase 2: validação com nicho
- dashboard web com cliente, endereço e data
- status mais rico por ordem
- filtros por técnico, prioridade e período
- onboarding com conta demo
- entrevistas com 10 a 20 prestadores

Status Gold atual:
- painel web já opera ordens enriquecidas com cliente, telefone, endereço, data, prioridade, técnico responsável e checklist
- filtros web por status, técnico, prioridade, período, busca textual e radar de agenda
- conta demo disponível para demonstração guiada e validação rápida
- pendente fora do código: executar entrevistas com 10 a 20 prestadores e registrar aprendizados

### Fase 3: mobile
- app React Native com Expo
- login compartilhado com a mesma API
- lista de ordens do dia
- atualização de status no campo
- notificações push
- modo offline básico com sincronização

Status Gold atual:
- app Expo validado no Expo Go com login compartilhado e API configurável
- lista mobile com busca, status, prioridade, período, técnico e resumo de agenda
- detalhe da ordem com checklist, status, telefone, endereço, técnico, foto de comprovante, ligação, rota e WhatsApp
- cache offline e fila de sincronização para status/checklist/comprovante
- notificações locais prontas para development build; push remoto fica como etapa de infraestrutura de produção

### Fase 4: receita
- trial gratuito
- planos comerciais visíveis no produto
- landing page focada em nicho
- registro de intenção de assinatura
- métricas de ativação e retenção

Status Gold atual:
- tela pública funciona como landing focada em serviços de campo, com planos Solo, Equipe e Campo Pro
- cadastro já nasce com plano inicial e trial de 7 dias no modelo de usuário
- painel de conta mostra plano, status comercial, dias restantes de trial e intenção de checkout
- backend registra intenção de assinatura para contato comercial antes de integração com gateway real
- métricas de ativação mostram primeira OS, checklist, técnico, agenda e sinais operacionais básicos

Próximo passo fora do código:
- abordar prestadores diretamente e tentar validar 3 interessados fortes ou pagantes manuais antes de implementar checkout real com Mercado Pago, Stripe ou outro provedor

## KPIs para acompanhar

- contas criadas por semana
- percentual que cadastra a primeira ordem em 10 minutos
- empresas que voltam no dia seguinte
- ordens concluídas por usuário ativo
- conversão do trial para pago
- churn mensal

## Benchmark de mercado

O espaço é competitivo, mas validado. Ferramentas maiores do setor enfatizam agenda, despacho, mobilidade, histórico do cliente e ganho de horas operacionais, o que confirma que o problema tem valor econômico.

Referências usadas:
- Forbes Advisor, "Best Field Service Software", acessado em 23 de abril de 2026: https://www.forbes.com/advisor/business/software/best-field-service-software-original/
- Forbes Advisor, "Jobber Review", acessado em 23 de abril de 2026: https://www.forbes.com/advisor/business/software/jobber-review/
- Gartner Digital Markets, "Insights From Our Software Advisors: Stand Out in Field Service Management", 9 de outubro de 2025: https://www.gartner.com/en/digital-markets/insights/stand-out-in-field-service-management
