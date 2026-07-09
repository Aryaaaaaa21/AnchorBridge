import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
import {
  ONBOARDING_STEPS,
  getOnboardingState,
  startOnboarding,
  completeOnboardingStep,
  skipOnboarding,
  shouldShowOnboarding,
  isOnboardingComplete,
} from '../services/onboarding';
import { analytics } from '../services/analytics';
import { useStore } from '../store/useStore';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { walletConnected, connectWallet, projects } = useStore();
  const [state, setState] = useState(() => getOnboardingState() || startOnboarding());

  useEffect(() => {
    analytics.onboardingStarted();
  }, []);

  // Auto-detect step completions
  useEffect(() => {
    const current = getOnboardingState();
    if (!current) return;

    // Step 1: wallet connected
    if (walletConnected && !current.completedSteps.includes(1)) {
      const next = completeOnboardingStep(1);
      setState(next);
      analytics.onboardingStepCompleted(1, 'Connect Wallet');
    }

    // Step 2: project created
    if (projects.length > 0 && !current.completedSteps.includes(2)) {
      const next = completeOnboardingStep(2);
      setState(next);
      analytics.onboardingStepCompleted(2, 'Create First Project');
    }

    // Step 3: milestone exists
    const hasMilestone = projects.some(p => p.milestones.length > 0);
    if (hasMilestone && !current.completedSteps.includes(3)) {
      const next = completeOnboardingStep(3);
      setState(next);
      analytics.onboardingStepCompleted(3, 'Create Milestone');
    }

    // Step 4: escrow funded
    const hasFunding = projects.some(p => p.lockedEscrow > 0);
    if (hasFunding && !current.completedSteps.includes(4)) {
      const next = completeOnboardingStep(4);
      setState(next);
      analytics.onboardingStepCompleted(4, 'Fund Escrow');
    }

    // Step 5: milestone approved
    const hasApproved = projects.some(p => p.milestones.some(m => m.status === 'approved'));
    if (hasApproved && !current.completedSteps.includes(5)) {
      const next = completeOnboardingStep(5);
      setState(next);
      analytics.onboardingStepCompleted(5, 'Approve Milestone');
      analytics.onboardingCompleted();
    }
  }, [walletConnected, projects]);

  const handleSkip = () => {
    skipOnboarding(state.currentStep);
    analytics.onboardingSkipped(state.currentStep);
    onClose();
  };

  const handleStepAction = async (step: number) => {
    const stepObj = ONBOARDING_STEPS[step - 1];

    if (step === 1) {
      if (!walletConnected) {
        await connectWallet();
      }
      const next = completeOnboardingStep(1);
      setState(next);
      analytics.onboardingStepCompleted(1, 'Connect Wallet');
      return;
    }

    if (stepObj.route) {
      navigate(stepObj.route);
      onClose();
      return;
    }

    // For steps that require in-app actions
    const next = completeOnboardingStep(step);
    setState(next);
    analytics.onboardingStepCompleted(step, stepObj.title);
  };

  const progress = (state.completedSteps.length / ONBOARDING_STEPS.length) * 100;
  const allDone = isOnboardingComplete();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleSkip()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-lg bg-[#f5efe7] dark:bg-[#1e1b19] rounded-2xl border border-[#5d240a]/20 dark:border-[#39332d] shadow-2xl overflow-hidden"
        role="dialog"
        aria-label="AnchorBridge Onboarding"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-[#5d240a] dark:text-[#f5efe7] tracking-tight">
                {allDone ? '🎉 You\'re All Set!' : '🚀 Welcome to AnchorBridge'}
              </h2>
              <p className="text-xs text-[#2b1d16]/60 dark:text-[#9894ac] mt-0.5">
                {allDone
                  ? 'You\'ve completed the onboarding. Start building with Soroban!'
                  : 'Complete these steps to get started with trustless escrow'}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 rounded-md text-[#2b1d16]/40 hover:bg-[#5d240a]/8 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close onboarding"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-[#2b1d16]/50 dark:text-[#9894ac]">
              <span>Progress</span>
              <span>{state.completedSteps.length} / {ONBOARDING_STEPS.length} steps</span>
            </div>
            <div className="h-2 rounded-full bg-[#5d240a]/10 dark:bg-[#39332d] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#ac5c2c] to-[#bca464]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 pb-6 space-y-3">
          {ONBOARDING_STEPS.map((step) => {
            const isCompleted = state.completedSteps.includes(step.step);
            const isCurrent = state.currentStep === step.step && !allDone;

            return (
              <motion.div
                key={step.step}
                layout
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'border-[#4CAF50]/30 bg-[#4CAF50]/5'
                    : isCurrent
                    ? 'border-[#ac5c2c]/40 bg-[#ac5c2c]/5 shadow-sm'
                    : 'border-[#5d240a]/10 dark:border-[#39332d]/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Step indicator */}
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                      isCompleted
                        ? 'bg-[#4CAF50] text-white'
                        : isCurrent
                        ? 'bg-[#ac5c2c] text-[#f5efe7]'
                        : 'bg-[#5d240a]/10 dark:bg-[#39332d]/40 text-[#2b1d16]/40 dark:text-[#9894ac]/40'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-4.5 w-4.5" /> : step.icon}
                    </div>

                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${isCompleted ? 'text-[#4CAF50]' : 'text-[#5d240a] dark:text-[#f5efe7]'}`}>
                        Step {step.step}: {step.title}
                      </p>
                      {isCurrent && (
                        <p className="text-[10px] text-[#2b1d16]/60 dark:text-[#9894ac] leading-relaxed mt-0.5 line-clamp-2">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isCurrent && (
                    <button
                      id={`btn-onboarding-step-${step.step}`}
                      onClick={() => handleStepAction(step.step)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-[#ac5c2c] text-[#f5efe7] rounded-lg hover:bg-[#5d240a] transition-all min-h-[32px]"
                    >
                      {step.action} <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-[10px] text-[#2b1d16]/40 dark:text-[#9894ac]/50 hover:text-[#2b1d16]/70 dark:hover:text-[#9894ac] transition-colors"
          >
            {allDone ? 'Close' : 'Skip for now'}
          </button>
          {allDone && (
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold bg-[#5d240a] text-[#f5efe7] rounded-lg hover:bg-[#ac5c2c] transition-all"
            >
              Start Building →
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Floating Onboarding Trigger ───────────────────────────────────────────────
export const OnboardingTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Show modal on first visit after 1.5s delay
    const timer = setTimeout(() => {
      if (shouldShowOnboarding()) {
        setShouldShow(true);
        setIsOpen(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <OnboardingModal onClose={() => setIsOpen(false)} />
      )}
    </AnimatePresence>
  );
};
