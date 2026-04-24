export const PLAN_OPTIONS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 'R$ 29/mês',
    limit: '1 usuário',
    description: 'Para autônomos que querem sair do WhatsApp e organizar a própria agenda de serviços.',
    features: ['Ordens de serviço', 'Checklist por visita', 'Agenda e busca'],
  },
  {
    id: 'team',
    name: 'Equipe',
    price: 'R$ 79/mês',
    limit: 'Até 5 usuários',
    description: 'Para pequenas equipes que precisam despachar serviços e acompanhar técnicos em campo.',
    features: ['Painel web + app mobile', 'Filtros por técnico', 'Conta demo para treinamento'],
    featured: true,
  },
  {
    id: 'pro',
    name: 'Campo Pro',
    price: 'R$ 149/mês',
    limit: 'Até 15 usuários',
    description: 'Para operações com volume maior, prioridade alta e rotina de acompanhamento diário.',
    features: ['Métricas operacionais', 'Provas de execução', 'Preparado para cobrança recorrente'],
  },
];

export function getPlanById(planId) {
  return PLAN_OPTIONS.find((plan) => plan.id === planId) || PLAN_OPTIONS[1];
}
