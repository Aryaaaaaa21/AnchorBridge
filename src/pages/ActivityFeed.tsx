import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, FolderPlus, Target, CheckCircle, DollarSign,
  RefreshCw, Zap, Filter
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Project } from '../store/useStore';

// ── Activity Feed Event Types ──────────────────────────────────────────────────

interface FeedEvent {
  id: string;
  type: 'project_created' | 'milestone_submitted' | 'milestone_approved' | 'funds_released' | 'refund_processed' | 'dispute_raised';
  project: string;
  user: string;
  amount?: number;
  timestamp: string;
  txHash?: string;
}

const EVENT_META: Record<FeedEvent['type'], { label: string; icon: React.FC<any>; color: string; bg: string }> = {
  project_created: { label: 'Project Created', icon: FolderPlus, color: 'text-[#ac5c2c]', bg: 'bg-[#ac5c2c]/10' },
  milestone_submitted: { label: 'Milestone Submitted', icon: Target, color: 'text-[#bca464]', bg: 'bg-[#bca464]/10' },
  milestone_approved: { label: 'Milestone Approved', icon: CheckCircle, color: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/10' },
  funds_released: { label: 'Funds Released', icon: DollarSign, color: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/10' },
  refund_processed: { label: 'Refund Processed', icon: RefreshCw, color: 'text-[#E8A317]', bg: 'bg-[#E8A317]/10' },
  dispute_raised: { label: 'Dispute Raised', icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10' },
};

function mapActivityToFeed(projects: Project[]): FeedEvent[] {
  const events: FeedEvent[] = [];

  for (const p of projects) {
    for (const act of p.activityFeed) {
      let type: FeedEvent['type'] = 'project_created';
      if (act.action.toLowerCase().includes('created')) type = 'project_created';
      else if (act.action.toLowerCase().includes('submitted')) type = 'milestone_submitted';
      else if (act.action.toLowerCase().includes('approved') || act.action.toLowerCase().includes('released')) {
        // Released funds event
        if (act.details?.includes('released') || act.details?.includes('XLM')) {
          type = 'funds_released';
        } else {
          type = 'milestone_approved';
        }
      }
      else if (act.action.toLowerCase().includes('dispute')) type = 'dispute_raised';
      else if (act.action.toLowerCase().includes('refund')) type = 'refund_processed';

      // Extract amount from details
      const amtMatch = act.details?.match(/[\d,]+(?:\.\d+)?\s*XLM/);
      const amount = amtMatch ? parseInt(amtMatch[0].replace(/[^\d]/g, '')) : undefined;

      events.push({
        id: act.id,
        type,
        project: p.title,
        user: act.user,
        amount,
        timestamp: act.date,
        txHash: act.details?.match(/Tx:\s*([a-f0-9]+)/i)?.[1],
      });
    }
  }

  // Sort newest first
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export const ActivityFeed: React.FC = () => {
  const { projects } = useStore();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [filterType, setFilterType] = useState<'all' | FeedEvent['type']>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [newEventCount, setNewEventCount] = useState(0);
  const lastCountRef = useRef(0);

  useEffect(() => {
    const mapped = mapActivityToFeed(projects);
    setEvents(mapped);
    lastCountRef.current = mapped.length;
  }, [projects]);

  // Simulate live event additions every 8 seconds
  useEffect(() => {
    if (isPaused) return;

    const LIVE_EVENTS: Omit<FeedEvent, 'id'>[] = [
      { type: 'milestone_submitted', project: 'Oracle Bridge Integration', user: 'Charlie Dev', amount: 12000, timestamp: new Date().toLocaleString('sv').replace('T', ' '), txHash: 'a1b2c3d4' },
      { type: 'project_created', project: 'Soroban Payment Gateway', user: 'Vera Capital', amount: 75000, timestamp: new Date().toLocaleString('sv').replace('T', ' ') },
      { type: 'funds_released', project: 'NFT Marketplace Backend', user: 'ArtTech DAO', amount: 28000, timestamp: new Date().toLocaleString('sv').replace('T', ' '), txHash: 'e5f6a7b8' },
      { type: 'milestone_approved', project: 'DeFi Bridge Protocol', user: 'Luna Finance', amount: 45000, timestamp: new Date().toLocaleString('sv').replace('T', ' '), txHash: 'c9d0e1f2' },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (isPaused) return;
      const newEvent: FeedEvent = {
        ...LIVE_EVENTS[idx % LIVE_EVENTS.length],
        id: `live_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleString('sv').replace('T', ' '),
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
      setNewEventCount(n => n + 1);
      idx++;
    }, 8000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const filtered = filterType === 'all' ? events : events.filter(e => e.type === filterType);

  // Summary counts
  const typeCounts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#5d240a]/15 dark:border-[#39332d] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#5d240a] dark:text-[#f5efe7] tracking-tight flex items-center gap-3">
            <Activity className="h-7 w-7 text-[#ac5c2c]" />
            Public Activity Feed
          </h1>
          <p className="text-xs text-[#2b1d16]/60 dark:text-[#9894ac] mt-1">
            Live Soroban smart contract events across all projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          {newEventCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4CAF50] bg-[#4CAF50]/10 px-2.5 py-1 rounded-full border border-[#4CAF50]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
              {newEventCount} new events
            </span>
          )}
          <button
            id="btn-toggle-feed"
            onClick={() => setIsPaused(p => !p)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all min-h-[36px] ${
              isPaused
                ? 'bg-[#ac5c2c] text-[#f5efe7]'
                : 'border border-[#5d240a]/20 dark:border-[#39332d] text-[#5d240a] dark:text-[#f5efe7] hover:bg-[#5d240a]/5'
            }`}
          >
            {isPaused ? '▶ Resume Feed' : '⏸ Pause Feed'}
          </button>
        </div>
      </motion.div>

      {/* Live Indicator */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
          <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-[#bca464]' : 'bg-[#4CAF50] animate-pulse'}`} />
          <span className={isPaused ? 'text-[#bca464]' : 'text-[#4CAF50]'}>
            {isPaused ? 'PAUSED' : 'LIVE STREAM'}
          </span>
        </div>
        <span className="text-[10px] text-[#2b1d16]/40 dark:text-[#9894ac]/40 font-mono">
          soroban_event_stream_v2 • {filtered.length} events
        </span>
      </motion.div>

      {/* Summary Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(EVENT_META).map(([type, meta]) => {
          const Icon = meta.icon;
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type as FeedEvent['type'] ? 'all' : type as FeedEvent['type'])}
              className={`p-3 rounded-xl border transition-all text-left ${
                filterType === type
                  ? 'border-[#ac5c2c] bg-[#ac5c2c]/5'
                  : 'border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] hover:border-[#ac5c2c]/30'
              }`}
            >
              <div className={`h-7 w-7 rounded-lg ${meta.bg} flex items-center justify-center mb-2`}>
                <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#2b1d16]/50 dark:text-[#9894ac] block">{meta.label}</span>
              <span className="text-sm font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">{typeCounts[type] || 0}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Feed */}
      <motion.div variants={itemVariants} className="rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#5d240a]/10 dark:border-[#39332d]/40 flex items-center justify-between">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">
            Live Event Stream
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-[#2b1d16]/40 dark:text-[#9894ac]/40" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="text-[9px] bg-transparent border border-[#5d240a]/15 dark:border-[#39332d] rounded px-2 py-1 text-[#2b1d16]/70 dark:text-[#9894ac] outline-none"
            >
              <option value="all">All Events</option>
              {Object.entries(EVENT_META).map(([t, m]) => (
                <option key={t} value={t}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-[#5d240a]/8 dark:divide-[#39332d]/30 max-h-[600px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#2b1d16]/50 dark:text-[#9894ac]">
                <Activity className="h-10 w-10 mx-auto opacity-30 mb-3" />
                No events to display.
              </div>
            ) : (
              filtered.map((event, idx) => {
                const meta = EVENT_META[event.type];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 py-4 flex items-start gap-4 hover:bg-[#5d240a]/3 dark:hover:bg-[#39332d]/20 transition-colors"
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                      <div className={`h-8 w-8 rounded-lg ${meta.bg} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                      </div>
                      {idx < filtered.length - 1 && (
                        <div className="h-4 w-[1px] bg-[#5d240a]/10 dark:bg-[#39332d]/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
                          {event.amount && (
                            <span className="ml-2 text-[10px] font-mono text-[#2b1d16]/60 dark:text-[#9894ac]">
                              {event.amount.toLocaleString()} XLM
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#2b1d16]/40 dark:text-[#9894ac]/40 font-mono whitespace-nowrap">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#2b1d16] dark:text-[#f5efe7]/80 mt-0.5 truncate font-medium">
                        {event.project}
                      </p>
                      <p className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac] mt-0.5">
                        by {event.user}
                        {event.txHash && (
                          <span className="ml-2 font-mono text-[#bca464]">
                            tx: {event.txHash.slice(0, 12)}...
                          </span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
