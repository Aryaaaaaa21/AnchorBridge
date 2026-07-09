// ─── AnchorBridge Sentry Monitoring Service ──────────────────────────────────
// Tracks wallet errors, contract errors, transaction failures, and frontend exceptions

export interface SentryEvent {
  id: string;
  level: 'fatal' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  category: 'wallet' | 'contract' | 'transaction' | 'frontend' | 'system';
  timestamp: string;
  tags: Record<string, string>;
  extra?: Record<string, any>;
  resolved: boolean;
}

const SENTRY_DSN_PLACEHOLDER = 'https://anchorbridge@o0000000.ingest.sentry.io/0000000';
const MONITORING_KEY = 'ab_sentry_events';
const MAX_EVENTS = 200;

// ── Initialize Sentry ────────────────────────────────────────
export function initSentry() {
  if (typeof window === 'undefined') return;

  // In production, replace with real Sentry SDK:
  // import * as Sentry from '@sentry/react';
  // Sentry.init({ dsn: SENTRY_DSN_PLACEHOLDER, ... });

  // Install global error handler
  window.addEventListener('error', (event) => {
    sentryService.captureException(event.error || new Error(event.message), {
      category: 'frontend',
      tags: { source: 'global_error_handler', filename: event.filename || 'unknown' },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    sentryService.captureException(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        category: 'frontend',
        tags: { source: 'unhandled_promise_rejection' },
      }
    );
  });

  console.info('[AnchorBridge Monitoring] Sentry initialized. DSN:', SENTRY_DSN_PLACEHOLDER);
}

// ── Sentry Event Store ───────────────────────────────────────
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function storeEvent(event: SentryEvent) {
  try {
    const raw = localStorage.getItem(MONITORING_KEY);
    const events: SentryEvent[] = raw ? JSON.parse(raw) : [];
    events.unshift(event);
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
    localStorage.setItem(MONITORING_KEY, JSON.stringify(events));
  } catch {
    // Silent fail
  }
}

export function getSentryEvents(): SentryEvent[] {
  try {
    const raw = localStorage.getItem(MONITORING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function resolveEvent(eventId: string) {
  try {
    const events = getSentryEvents();
    const updated = events.map(e => e.id === eventId ? { ...e, resolved: true } : e);
    localStorage.setItem(MONITORING_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearSentryEvents() {
  localStorage.removeItem(MONITORING_KEY);
}

// ── Sentry Service ───────────────────────────────────────────
interface CaptureOptions {
  category: SentryEvent['category'];
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: SentryEvent['level'];
}

export const sentryService = {
  captureException(error: Error, options: CaptureOptions) {
    const event: SentryEvent = {
      id: generateEventId(),
      level: options.level || 'error',
      title: error.name || 'Error',
      message: error.message || 'Unknown error',
      category: options.category,
      timestamp: new Date().toISOString(),
      tags: {
        platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        ...options.tags,
      },
      extra: {
        stack: error.stack,
        ...options.extra,
      },
      resolved: false,
    };

    storeEvent(event);
    console.error(`[Sentry ${event.category.toUpperCase()}] ${event.title}: ${event.message}`, event);
    return event.id;
  },

  captureMessage(message: string, options: CaptureOptions) {
    const event: SentryEvent = {
      id: generateEventId(),
      level: options.level || 'info',
      title: `${options.category.charAt(0).toUpperCase() + options.category.slice(1)} Event`,
      message,
      category: options.category,
      timestamp: new Date().toISOString(),
      tags: {
        platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        ...options.tags,
      },
      extra: options.extra,
      resolved: false,
    };

    storeEvent(event);
    console.warn(`[Sentry ${event.category.toUpperCase()}] ${message}`);
    return event.id;
  },

  // ── Specialized Trackers ──────────────────────────────────

  trackWalletError(error: string, context?: Record<string, any>) {
    return this.captureMessage(error, {
      category: 'wallet',
      level: 'error',
      tags: { error_type: 'wallet_error' },
      extra: context,
    });
  },

  trackContractError(method: string, error: string, contractId?: string) {
    return this.captureMessage(`Contract call failed: ${method} - ${error}`, {
      category: 'contract',
      level: 'error',
      tags: { method, contract_id: contractId || 'unknown' },
      extra: { method, error, contractId },
    });
  },

  trackTransactionFailure(txHash: string, reason: string, amount?: number) {
    return this.captureMessage(`Transaction failed: ${reason}`, {
      category: 'transaction',
      level: 'fatal',
      tags: { tx_hash: txHash.slice(0, 16) },
      extra: { txHash, reason, amount },
    });
  },

  trackFrontendException(error: Error, componentName?: string) {
    return this.captureException(error, {
      category: 'frontend',
      tags: { component: componentName || 'unknown' },
    });
  },

  // ── Metrics ───────────────────────────────────────────────

  getMetrics() {
    const events = getSentryEvents();
    const total = events.length;
    const resolved = events.filter(e => e.resolved).length;
    const unresolved = total - resolved;
    const byCategory = events.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byLevel = events.reduce((acc, e) => {
      acc[e.level] = (acc[e.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, resolved, unresolved, byCategory, byLevel };
  }
};

// ── Add some demo events on first load ───────────────────────
export function seedDemoSentryEvents() {
  const existing = getSentryEvents();
  if (existing.length > 0) return;

  const demos: Omit<SentryEvent, 'id'>[] = [
    {
      level: 'error',
      title: 'WalletConnectionError',
      message: 'Freighter extension not detected in browser',
      category: 'wallet',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      tags: { platform: 'desktop', source: 'freighter_api' },
      extra: { browser: 'Chrome', freighter_version: 'not_installed' },
      resolved: true,
    },
    {
      level: 'error',
      title: 'ContractInvocationError',
      message: 'create_milestone failed: insufficient XLM balance for fee',
      category: 'contract',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      tags: { method: 'create_milestone', platform: 'mobile' },
      extra: { method: 'create_milestone', balance: 0.09 },
      resolved: true,
    },
    {
      level: 'fatal',
      title: 'TransactionSubmissionFailed',
      message: 'fund_project tx rejected: sequence number mismatch',
      category: 'transaction',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      tags: { tx_hash: 'cc2d3e1a6b0c...', platform: 'desktop' },
      extra: { sequence_expected: 123456, sequence_received: 123457 },
      resolved: true,
    },
    {
      level: 'warning',
      title: 'NetworkLatency',
      message: 'Soroban RPC response time exceeded 5000ms threshold',
      category: 'system',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      tags: { rpc_url: 'soroban-testnet.stellar.org', platform: 'desktop' },
      extra: { latency_ms: 5243 },
      resolved: false,
    },
    {
      level: 'error',
      title: 'TypeError',
      message: "Cannot read properties of undefined reading 'milestones'",
      category: 'frontend',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      tags: { component: 'ProjectDetails', platform: 'mobile' },
      extra: { stack: 'TypeError: Cannot read properties of undefined' },
      resolved: true,
    },
  ];

  demos.forEach(d => storeEvent({ ...d, id: generateEventId() }));
}
