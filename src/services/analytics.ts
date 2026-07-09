// ─── AnchorBridge Analytics Service ──────────────────────────────────────────
// Integrates Vercel Analytics + Google Analytics (GA4)
// Tracks all Level 4 MVP events

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    va: (...args: any[]) => void;
  }
}

// ── GA4 Measurement ID (replace with real ID in production) ──
const GA_MEASUREMENT_ID = 'G-ANCHORBRIDGE01';

// ── Initialize Google Analytics ──────────────────────────────
export function initGoogleAnalytics() {
  if (typeof window === 'undefined') return;
  if (document.getElementById('ga-script')) return;

  // Load gtag script
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
  });

  console.info('[AnchorBridge Analytics] Google Analytics initialized:', GA_MEASUREMENT_ID);
}

// ── Vercel Analytics Stub (works when deployed to Vercel) ────
export function initVercelAnalytics() {
  if (typeof window === 'undefined') return;
  // Vercel injects va() automatically in production deployments
  // This stub ensures graceful fallback in non-Vercel envs
  if (!window.va) {
    window.va = (...args: any[]) => {
      console.debug('[VercelAnalytics]', ...args);
    };
  }
  console.info('[AnchorBridge Analytics] Vercel Analytics ready.');
}

// ── Core Event Tracker ───────────────────────────────────────
function trackEvent(name: string, params: Record<string, any> = {}) {
  const enriched = {
    ...params,
    timestamp: new Date().toISOString(),
    platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    session_id: getSessionId(),
  };

  // Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, enriched);
  }

  // Vercel Analytics
  if (typeof window.va === 'function') {
    window.va('event', { name, ...enriched });
  }

  // Persist to local metrics store for dashboard
  persistMetricEvent(name, enriched);

  console.debug(`[AnchorBridge Analytics] Event: ${name}`, enriched);
}

// ── Session ID ───────────────────────────────────────────────
function getSessionId(): string {
  let sid = sessionStorage.getItem('ab_session_id');
  if (!sid) {
    sid = `ab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('ab_session_id', sid);
  }
  return sid;
}

// ── Persist Events Locally (for Metrics Dashboard) ───────────
export interface MetricEvent {
  name: string;
  params: Record<string, any>;
  timestamp: string;
}

const METRICS_KEY = 'ab_metrics_events';
const MAX_STORED_EVENTS = 500;

function persistMetricEvent(name: string, params: Record<string, any>) {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    const events: MetricEvent[] = raw ? JSON.parse(raw) : [];
    events.unshift({ name, params, timestamp: params.timestamp });
    if (events.length > MAX_STORED_EVENTS) events.length = MAX_STORED_EVENTS;
    localStorage.setItem(METRICS_KEY, JSON.stringify(events));
  } catch {
    // Silently fail if localStorage is full
  }
}

export function getStoredMetricEvents(): MetricEvent[] {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearStoredMetricEvents() {
  localStorage.removeItem(METRICS_KEY);
}

// ── Page View Tracking ───────────────────────────────────────
export function trackPageView(path: string, title?: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title || document.title,
    });
  }
  trackEvent('page_view', { page_path: path, page_title: title || document.title });
}

// ── Product Events ────────────────────────────────────────────
export const analytics = {
  // Wallet
  walletConnected: (address: string, network: string) =>
    trackEvent('wallet_connected', { wallet_address: address.slice(0, 8) + '...', network }),

  walletDisconnected: () =>
    trackEvent('wallet_disconnected', {}),

  walletError: (error: string) =>
    trackEvent('wallet_error', { error_message: error }),

  // Projects
  projectCreated: (projectId: string, escrowAmount: number, milestoneCount: number) =>
    trackEvent('project_created', { project_id: projectId, escrow_amount: escrowAmount, milestone_count: milestoneCount }),

  projectViewed: (projectId: string, title: string) =>
    trackEvent('project_viewed', { project_id: projectId, project_title: title }),

  // Milestones
  milestoneCreated: (projectId: string, milestoneTitle: string, amount: number) =>
    trackEvent('milestone_created', { project_id: projectId, milestone_title: milestoneTitle, amount }),

  milestoneSubmitted: (projectId: string, milestoneId: string) =>
    trackEvent('milestone_submitted', { project_id: projectId, milestone_id: milestoneId }),

  milestoneApproved: (projectId: string, milestoneId: string, amount: number) =>
    trackEvent('milestone_approved', { project_id: projectId, milestone_id: milestoneId, amount }),

  milestoneRejected: (projectId: string, milestoneId: string) =>
    trackEvent('milestone_rejected', { project_id: projectId, milestone_id: milestoneId }),

  milestoneDisputed: (projectId: string, milestoneId: string) =>
    trackEvent('milestone_disputed', { project_id: projectId, milestone_id: milestoneId }),

  // Escrow
  escrowFunded: (projectId: string, amount: number) =>
    trackEvent('escrow_funded', { project_id: projectId, amount }),

  paymentReleased: (projectId: string, amount: number, recipient: string) =>
    trackEvent('payment_released', { project_id: projectId, amount, recipient: recipient.slice(0, 8) + '...' }),

  refundProcessed: (projectId: string, amount: number) =>
    trackEvent('refund_processed', { project_id: projectId, amount }),

  // Contract
  contractError: (contractId: string, method: string, error: string) =>
    trackEvent('contract_error', { contract_id: contractId, method, error_message: error }),

  transactionFailed: (txHash: string, reason: string) =>
    trackEvent('transaction_failed', { tx_hash: txHash, reason }),

  // Onboarding
  onboardingStarted: () =>
    trackEvent('onboarding_started', {}),

  onboardingStepCompleted: (step: number, stepName: string) =>
    trackEvent('onboarding_step_completed', { step, step_name: stepName }),

  onboardingCompleted: () =>
    trackEvent('onboarding_completed', {}),

  onboardingSkipped: (atStep: number) =>
    trackEvent('onboarding_skipped', { at_step: atStep }),

  // Feedback
  feedbackSubmitted: (rating: number, hasFeatureRequest: boolean, hasBugReport: boolean) =>
    trackEvent('feedback_submitted', { rating, has_feature_request: hasFeatureRequest, has_bug_report: hasBugReport }),
};
