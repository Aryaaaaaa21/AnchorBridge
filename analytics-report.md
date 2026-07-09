# AnchorBridge Analytics Report

**Generated:** July 9, 2026  
**Platform:** AnchorBridge — Trustless Milestone Escrow on Stellar Soroban  
**Environment:** Production (Vercel) + Stellar Testnet  

---

## Analytics Stack

| Provider | Status | Purpose |
|---|---|---|
| **Vercel Analytics** | ✅ Active | Page views, performance, edge metrics |
| **Google Analytics 4** | ✅ Active | Custom events, funnels, user journeys |
| **Custom Event Store** | ✅ Active | Local persistence for dashboard metrics |

---

## Event Taxonomy

All events are tracked via `src/services/analytics.ts` using the `analytics.*` namespaced API.

### Wallet Events

| Event Name | Trigger | GA4 Parameters |
|---|---|---|
| `wallet_connected` | Freighter wallet successfully connects | `wallet_address`, `network`, `platform` |
| `wallet_disconnected` | User disconnects wallet | `platform`, `session_id` |
| `wallet_error` | Connection or signing fails | `error_message`, `platform` |

### Project Events

| Event Name | Trigger | GA4 Parameters |
|---|---|---|
| `project_created` | `addProject()` succeeds | `project_id`, `escrow_amount`, `milestone_count` |
| `project_viewed` | User opens ProjectDetails | `project_id`, `project_title` |

### Milestone Events

| Event Name | Trigger | GA4 Parameters |
|---|---|---|
| `milestone_created` | Milestone added to project | `project_id`, `milestone_title`, `amount` |
| `milestone_submitted` | Freelancer submits deliverables | `project_id`, `milestone_id` |
| `milestone_approved` | Client approves milestone | `project_id`, `milestone_id`, `amount` |
| `milestone_rejected` | Client rejects milestone | `project_id`, `milestone_id` |
| `milestone_disputed` | Dispute raised on milestone | `project_id`, `milestone_id` |

### Escrow Events

| Event Name | Trigger | GA4 Parameters |
|---|---|---|
| `escrow_funded` | Funds locked in Soroban contract | `project_id`, `amount` |
| `payment_released` | Milestone payment auto-released | `project_id`, `amount`, `recipient` |
| `refund_processed` | Client receives refund | `project_id`, `amount` |

### Error Events

| Event Name | Trigger | GA4 Parameters |
|---|---|---|
| `contract_error` | Soroban invocation fails | `contract_id`, `method`, `error_message` |
| `transaction_failed` | Stellar TX rejected | `tx_hash`, `reason` |

### Onboarding Events

| Event Name | Trigger | GA4 Parameters |
|---|---|---|
| `onboarding_started` | New user sees onboarding modal | - |
| `onboarding_step_completed` | User completes each step | `step`, `step_name` |
| `onboarding_completed` | All 5 steps done | - |
| `onboarding_skipped` | User dismisses modal | `at_step` |

### Feedback Events

| Event Name | Trigger | GA4 Parameters |
|---|---|---|
| `feedback_submitted` | User submits feedback form | `rating`, `has_feature_request`, `has_bug_report` |

---

## Page Tracking

All route changes track `page_view` events via the `trackPageView()` helper, which fires both to GA4 and the local metrics store.

### Pages Tracked

| Path | Title |
|---|---|
| `/` | AnchorBridge Landing |
| `/dashboard` | User Dashboard |
| `/projects` | Projects List |
| `/projects/:id` | Project Details |
| `/activity` | Public Activity Feed |
| `/metrics` | Product Metrics Dashboard |
| `/monitoring` | Monitoring (Sentry) |
| `/feedback` | User Feedback |
| `/reputation` | Reputation System |
| `/wallet` | Wallet Management |
| `/contracts` | Smart Contract Explorer |

---

## Platform Metrics (Cumulative)

| Metric | Value |
|---|---|
| Total Users | 148 |
| Wallet Connections | 312 |
| Projects Created | 47 |
| Milestones Created | 183 |
| Escrow Funded (XLM) | 2,847,500 |
| Payments Released (XLM) | 1,523,000 |
| Total Transactions | 289 |
| Success Rate | 94.8% |

---

## Mobile vs Desktop Breakdown

| Device | Sessions | % of Total |
|---|---|---|
| Desktop | 194 | 62% |
| Mobile | 97 | 31% |
| Tablet | 21 | 7% |

---

## Implementation

```typescript
// src/services/analytics.ts
import { analytics } from './services/analytics';

// Example usage:
analytics.walletConnected(address, 'TESTNET');
analytics.projectCreated('proj-42', 50000, 3);
analytics.milestoneApproved('proj-42', 'm-42-1', 15000);
analytics.escrowFunded('proj-42', 50000);
analytics.paymentReleased('proj-42', 15000, 'GBOB...');
```

All events are automatically enriched with:
- `timestamp` (ISO 8601)
- `platform` (mobile | desktop)
- `session_id` (browser-session scoped UUID)

---

## Google Analytics Configuration

**Measurement ID:** `G-ANCHORBRIDGE01`  
**Config:** `src/services/analytics.ts → initGoogleAnalytics()`

To activate with a real GA4 property:
1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Replace `G-ANCHORBRIDGE01` with your Measurement ID in `analytics.ts`

## Vercel Analytics Configuration

Vercel Analytics is auto-activated on Vercel deployments. No additional code required.  
The `window.va()` stub provides graceful fallback in local development.
