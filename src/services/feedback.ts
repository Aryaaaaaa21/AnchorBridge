// ─── AnchorBridge Feedback Service ──────────────────────────────────────────

export interface FeedbackEntry {
  id: string;
  walletAddress: string;
  rating: number; // 1–5
  experience: string;
  featureRequests: string;
  bugsFound: string;
  timestamp: string;
  platform: 'mobile' | 'desktop';
}

const FEEDBACK_KEY = 'ab_user_feedback';

function generateId(): string {
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function submitFeedback(entry: Omit<FeedbackEntry, 'id' | 'timestamp' | 'platform'>): FeedbackEntry {
  const feedback: FeedbackEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
    platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
  };

  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const entries: FeedbackEntry[] = raw ? JSON.parse(raw) : [];
    entries.unshift(feedback);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
  } catch {
    console.error('Failed to store feedback');
  }

  return feedback;
}

export function getFeedbackEntries(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function exportFeedbackAsCSV(): string {
  const entries = getFeedbackEntries();
  if (entries.length === 0) return '';

  const headers = ['ID', 'Wallet Address', 'Rating', 'Experience', 'Feature Requests', 'Bugs Found', 'Timestamp', 'Platform'];
  const rows = entries.map(e => [
    e.id,
    e.walletAddress,
    e.rating.toString(),
    `"${e.experience.replace(/"/g, '""')}"`,
    `"${e.featureRequests.replace(/"/g, '""')}"`,
    `"${e.bugsFound.replace(/"/g, '""')}"`,
    e.timestamp,
    e.platform,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportFeedbackAsJSON(): string {
  return JSON.stringify(getFeedbackEntries(), null, 2);
}

export function clearFeedback() {
  localStorage.removeItem(FEEDBACK_KEY);
}

export function getFeedbackSummary() {
  const entries = getFeedbackEntries();
  if (entries.length === 0) {
    return { total: 0, avgRating: 0, byRating: {}, byPlatform: { mobile: 0, desktop: 0 } };
  }

  const avgRating = entries.reduce((sum, e) => sum + e.rating, 0) / entries.length;
  const byRating = entries.reduce((acc, e) => {
    acc[e.rating] = (acc[e.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const byPlatform = entries.reduce((acc, e) => {
    acc[e.platform] = (acc[e.platform] || 0) + 1;
    return acc;
  }, { mobile: 0, desktop: 0 });

  return { total: entries.length, avgRating: Math.round(avgRating * 10) / 10, byRating, byPlatform };
}

// Seed demo feedback entries
export function seedDemoFeedback() {
  const existing = getFeedbackEntries();
  if (existing.length > 0) return;

  const demos: Omit<FeedbackEntry, 'id'>[] = [
    {
      walletAddress: 'GDA7MJQH3ALIC...XKPQ',
      rating: 5,
      experience: 'Absolutely seamless. The escrow flow is intuitive and I love that milestone approvals are on-chain.',
      featureRequests: 'Would love multi-token support (USDC, yXLM) in addition to XLM.',
      bugsFound: 'None encountered.',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      platform: 'desktop',
    },
    {
      walletAddress: 'GBOB3BUILDER...Z7MQ',
      rating: 5,
      experience: 'As a freelancer, the payment security gives me confidence. Getting paid instantly upon milestone approval is great.',
      featureRequests: 'Time-tracking integrations would make this perfect.',
      bugsFound: 'Minor: the mobile menu sometimes flickers on iOS Safari.',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      platform: 'mobile',
    },
    {
      walletAddress: 'GCH4LUNA...9WRT',
      rating: 4,
      experience: 'Very smooth experience once the wallet is connected. The dispute system is fair.',
      featureRequests: 'An arbitration panel feature where 3 neutral parties vote on disputes.',
      bugsFound: 'None found.',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      platform: 'desktop',
    },
    {
      walletAddress: 'GEVE9DEV...ABCD',
      rating: 5,
      experience: 'The reputation system is excellent. Being able to show a completed project history helps win new clients.',
      featureRequests: 'Portfolio showcase page for freelancers.',
      bugsFound: 'None.',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      platform: 'desktop',
    },
    {
      walletAddress: 'GDAV3ART...8VVX',
      rating: 4,
      experience: 'Great platform overall. The Soroban contract integration is transparent and trustworthy.',
      featureRequests: 'Bulk milestone creation from a CSV file.',
      bugsFound: 'Small UI glitch on the project details page when milestone names are long.',
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
      platform: 'mobile',
    },
  ];

  demos.forEach(d => {
    const entry: FeedbackEntry = { ...d, id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
    try {
      const raw = localStorage.getItem(FEEDBACK_KEY);
      const entries: FeedbackEntry[] = raw ? JSON.parse(raw) : [];
      entries.push(entry);
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
    } catch {}
  });
}
