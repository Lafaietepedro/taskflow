/* eslint-env node */
const PLAN_LABELS = {
  solo: 'Solo',
  team: 'Equipe',
  pro: 'Campo Pro',
};
const COMMERCIAL_STAGE_LABELS = {
  trialing: 'Trial ativo',
  trial_expired: 'Trial expirado',
  checkout_requested: 'Assinatura solicitada',
  active: 'Assinatura ativa',
  past_due: 'Pagamento pendente',
  canceled: 'Assinatura cancelada',
};
const TRIAL_DAYS = 7;

function getTrialEndFallback(user) {
  if (user.trialEndsAt) {
    return user.trialEndsAt;
  }

  const startedAt = user.trialStartedAt || user.createdAt || new Date();
  return new Date(new Date(startedAt).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

function calculateTrialDaysRemaining(trialEndsAt) {
  if (!trialEndsAt) {
    return 0;
  }

  const remainingMs = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

function serializeUser(user) {
  const trialEndsAt = getTrialEndFallback(user);
  const trialDaysRemaining = calculateTrialDaysRemaining(trialEndsAt);
  const trialExpired = trialDaysRemaining === 0 && user.subscriptionStatus === 'trialing';
  const commercialStage = trialExpired ? 'trial_expired' : user.subscriptionStatus || 'trialing';

  return {
    id: String(user._id),
    username: user.username,
    fullName: user.fullName || '',
    createdAt: user.createdAt,
    plan: user.plan || 'team',
    planLabel: PLAN_LABELS[user.plan] || PLAN_LABELS.team,
    subscriptionStatus: user.subscriptionStatus || 'trialing',
    commercialStage,
    commercialStageLabel: COMMERCIAL_STAGE_LABELS[commercialStage] || COMMERCIAL_STAGE_LABELS.trialing,
    trialStartedAt: user.trialStartedAt || user.createdAt,
    trialEndsAt,
    trialDaysRemaining,
    trialExpired,
    checkoutIntent: user.checkoutIntent || null,
  };
}

module.exports = serializeUser;
