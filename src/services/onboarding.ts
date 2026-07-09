// --- AnchorBridge Onboarding Service ---

export interface OnboardingState {
  active: boolean;
  currentStep: number;
  completedSteps: number[];
  skipped: boolean;
  completedAt?: string;
  startedAt: string;
}

export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  action: string;
  route?: string;
  icon: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: 'Connect Your Wallet',
    description: 'Connect your Freighter wallet to authenticate on the Stellar network and enable smart contract interactions.',
    action: 'Connect Freighter',
    icon: '🔗',
  },
  {
    step: 2,
    title: 'Create Your First Project',
    description: 'Define a project with a title, description, and freelancer. This deploys a Soroban escrow contract on-chain.',
    action: 'Create Project',
    route: '/projects/create',
    icon: '📁',
  },
  {
    step: 3,
    title: 'Add a Milestone',
    description: 'Break work into milestones with specific amounts. Each milestone is a payment gate in the smart contract.',
    action: 'Add Milestone',
    icon: '🎯',
  },
  {
    step: 4,
    title: 'Fund the Escrow',
    description: 'Lock XLM into the Soroban escrow vault. Funds are secured by the smart contract, not held by AnchorBridge.',
    action: 'Fund Escrow',
    icon: '🔒',
  },
  {
    step: 5,
    title: 'Approve a Milestone',
    description: 'Review deliverables and approve milestones to auto-release funds to the freelancer wallet.',
    action: 'Approve Milestone',
    icon: '✅',
  },
];

const ONBOARDING_KEY = 'ab_onboarding_state';

export function getOnboardingState(): OnboardingState | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function startOnboarding(): OnboardingState {
  const state: OnboardingState = {
    active: true,
    currentStep: 1,
    completedSteps: [],
    skipped: false,
    startedAt: new Date().toISOString(),
  };
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  return state;
}

export function completeOnboardingStep(step: number): OnboardingState {
  const current = getOnboardingState() || startOnboarding();
  const completedSteps = Array.from(new Set([...current.completedSteps, step]));
  const nextStep = step + 1;
  const isComplete = nextStep > ONBOARDING_STEPS.length;

  const updated: OnboardingState = {
    ...current,
    completedSteps,
    currentStep: isComplete ? step : nextStep,
    active: !isComplete,
    completedAt: isComplete ? new Date().toISOString() : undefined,
  };

  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
  return updated;
}

export function skipOnboarding(atStep: number): OnboardingState {
  const current = getOnboardingState() || startOnboarding();
  const updated: OnboardingState = {
    ...current,
    active: false,
    skipped: true,
    currentStep: atStep,
  };
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
  return updated;
}

export function resetOnboarding(): OnboardingState {
  return startOnboarding();
}

export function isOnboardingComplete(): boolean {
  const state = getOnboardingState();
  if (!state) return false;
  return state.completedSteps.length >= ONBOARDING_STEPS.length;
}

export function shouldShowOnboarding(): boolean {
  const state = getOnboardingState();
  if (!state) return true;
  if (state.skipped) return false;
  if (!state.active) return false;
  return true;
}
