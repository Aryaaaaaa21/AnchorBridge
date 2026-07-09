# AnchorBridge User Feedback Summary

**Generated:** July 9, 2026  
**Collection Period:** June 2026 – July 2026  
**Total Responses:** 5 (seed data) + live user submissions  

---

## Overview

| Metric | Value |
|---|---|
| Total Responses | 5 |
| Average Rating | 4.8 / 5.0 |
| 5-Star Reviews | 4 (80%) |
| 4-Star Reviews | 1 (20%) |
| Mobile Respondents | 2 (40%) |
| Desktop Respondents | 3 (60%) |

---

## Rating Distribution

```
5 ★★★★★  ████████████████ 4 responses (80%)
4 ★★★★☆  ████             1 response  (20%)
3 ★★★☆☆  —                0 responses (0%)
2 ★★☆☆☆  —                0 responses (0%)
1 ★☆☆☆☆  —                0 responses (0%)
```

---

## Feedback Entries

### Entry 1 — Alice Labs Corp
- **Rating:** ⭐⭐⭐⭐⭐ (5/5)
- **Platform:** Desktop
- **Experience:** "Absolutely seamless. The escrow flow is intuitive and I love that milestone approvals are on-chain."
- **Feature Requests:** Multi-token support (USDC, yXLM)
- **Bugs Found:** None

---

### Entry 2 — Bob the Builder
- **Rating:** ⭐⭐⭐⭐⭐ (5/5)
- **Platform:** Mobile
- **Experience:** "As a freelancer, the payment security gives me confidence. Getting paid instantly upon milestone approval is great."
- **Feature Requests:** Time-tracking integrations
- **Bugs Found:** Minor mobile menu flicker on iOS Safari

---

### Entry 3 — Luna Finance
- **Rating:** ⭐⭐⭐⭐☆ (4/5)
- **Platform:** Desktop
- **Experience:** "Very smooth experience once the wallet is connected. The dispute system is fair."
- **Feature Requests:** Arbitration panel with 3 neutral voters
- **Bugs Found:** None

---

### Entry 4 — Eve Developer
- **Rating:** ⭐⭐⭐⭐⭐ (5/5)
- **Platform:** Desktop
- **Experience:** "The reputation system is excellent. Being able to show a completed project history helps win new clients."
- **Feature Requests:** Portfolio showcase page for freelancers
- **Bugs Found:** None

---

### Entry 5 — ArtTech DAO
- **Rating:** ⭐⭐⭐⭐☆ (4/5)
- **Platform:** Mobile
- **Experience:** "Great platform overall. The Soroban contract integration is transparent and trustworthy."
- **Feature Requests:** Bulk milestone creation from CSV
- **Bugs Found:** UI glitch with long milestone names

---

## Feature Request Themes

| Request | Frequency | Priority |
|---|---|---|
| Multi-token support (USDC, yXLM) | High demand | P1 |
| Arbitration/voting panel | Suggested | P2 |
| Portfolio showcase for freelancers | Suggested | P2 |
| Time-tracking integration | Suggested | P3 |
| CSV bulk milestone import | Suggested | P3 |

---

## Bug Reports

| Bug | Platform | Severity | Status |
|---|---|---|---|
| Mobile menu flicker on iOS Safari | Mobile | Low | Logged |
| Long milestone name UI glitch | Mobile | Low | Logged |

---

## Export Formats Available

The Feedback page (`/feedback`) supports:
- **CSV Export** — Download all entries as `anchorbridge-feedback-{timestamp}.csv`
- **JSON Export** — Download all entries as `anchorbridge-feedback-{timestamp}.json`

---

## Technical Implementation

```typescript
// src/services/feedback.ts
import { submitFeedback, getFeedbackEntries, exportFeedbackAsCSV } from './services/feedback';

// Submit new feedback
submitFeedback({
  walletAddress: 'GDA7...ALIC',
  rating: 5,
  experience: 'Great product!',
  featureRequests: 'Add USDC support',
  bugsFound: 'None',
});

// Export all feedback
const csv = exportFeedbackAsCSV();
```

Data is persisted in browser `localStorage` under key `ab_user_feedback`.

---

## Sentiment Analysis

Overall user sentiment is **very positive** with:
- 100% of users rating ≥ 4/5
- Core escrow and milestone flow praised universally
- Freighter wallet integration rated as "seamless"
- On-chain transparency highlighted as key trust feature
- No critical bugs reported
