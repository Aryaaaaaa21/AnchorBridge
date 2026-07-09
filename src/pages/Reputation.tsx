import React from 'react';
import { motion } from 'framer-motion';
import {
  Star, Shield, CheckCircle, TrendingUp, Lock, FolderKanban,
  Award, Zap, Clock, DollarSign
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, Tooltip
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

// ── Compute reputation from projects ──────────────────────────────────────────
function computeReputation(projects: ReturnType<typeof useStore>['projects']) {
  const completed = projects.filter(p => p.status === 'completed');
  const total = projects.length;
  const disputed = projects.filter(p => p.status === 'disputed').length;
  const totalEscrow = projects.reduce((s, p) => s + p.totalEscrow, 0);
  const released = projects.reduce((s, p) => s + p.releasedFunds, 0);
  const allMilestones = projects.flatMap(p => p.milestones);
  const approvedMilestones = allMilestones.filter(m => m.status === 'approved');
  const successRate = total > 0 ? Math.round((completed.length / Math.max(1, total - disputed)) * 100) : 0;

  // Score out of 100
  const score = Math.min(
    100,
    Math.round(
      (completed.length * 25) +
      (approvedMilestones.length * 5) +
      (successRate * 0.3) +
      (totalEscrow > 50000 ? 15 : 5) +
      (disputed === 0 ? 10 : 0)
    )
  );

  return { completed: completed.length, total, disputed, totalEscrow, released, approvedMilestones: approvedMilestones.length, successRate, score };
}

const DEMO_REP = {
  completed: 47,
  total: 52,
  disputed: 2,
  totalEscrow: 2_847_500,
  released: 1_523_000,
  approvedMilestones: 183,
  successRate: 94,
  score: 96,
};

export const Reputation: React.FC = () => {
  const { user, projects } = useStore();
  const realRep = computeReputation(projects);

  // Merge real + demo for richer display
  const rep = {
    completed: Math.max(DEMO_REP.completed, realRep.completed),
    total: Math.max(DEMO_REP.total, realRep.total),
    disputed: realRep.disputed + DEMO_REP.disputed,
    totalEscrow: Math.max(DEMO_REP.totalEscrow, realRep.totalEscrow),
    released: Math.max(DEMO_REP.released, realRep.released),
    approvedMilestones: Math.max(DEMO_REP.approvedMilestones, realRep.approvedMilestones),
    successRate: Math.max(DEMO_REP.successRate, realRep.successRate),
    score: Math.max(DEMO_REP.score, realRep.score),
  };

  const radarData = [
    { subject: 'Completion', A: rep.successRate },
    { subject: 'Speed', A: 88 },
    { subject: 'Escrow Vol', A: Math.min(100, Math.round(rep.totalEscrow / 50000)) },
    { subject: 'Milestones', A: Math.min(100, rep.approvedMilestones * 2) },
    { subject: 'Trust', A: 98 },
    { subject: 'Reviews', A: 95 },
  ];

  const scoreTier = rep.score >= 90 ? 'Platinum' : rep.score >= 75 ? 'Gold' : rep.score >= 50 ? 'Silver' : 'Bronze';
  const tierColor = scoreTier === 'Platinum' ? '#bca464' : scoreTier === 'Gold' ? '#E8A317' : scoreTier === 'Silver' ? '#9894ac' : '#ac5c2c';

  const BADGES = [
    { name: 'Soroban Pioneer', desc: 'First on-chain Soroban milestone contract signed', icon: Shield, earned: true },
    { name: 'Milestone Veteran', desc: '50+ escrow milestones approved', icon: Award, earned: rep.approvedMilestones >= 50 },
    { name: 'Trusted Escrow', desc: '1M+ XLM in total escrow volume', icon: Lock, earned: rep.totalEscrow >= 1_000_000 },
    { name: '90%+ Success', desc: 'Maintained 90%+ milestone success rate', icon: TrendingUp, earned: rep.successRate >= 90 },
    { name: 'Speed Demon', desc: 'Average project completion under 14 days', icon: Zap, earned: true },
    { name: 'Zero Disputes', desc: 'No active disputes in last 90 days', icon: CheckCircle, earned: realRep.disputed === 0 },
  ];

  const TIMELINE = [
    { date: '2026-02-12', event: 'Account verified & wallet bound', icon: Shield },
    { date: '2026-03-01', event: 'First Soroban escrow contract created', icon: FolderKanban },
    { date: '2026-04-08', event: '10 milestones approved — Milestone Veteran badge', icon: Award },
    { date: '2026-05-20', event: '1M XLM escrow volume crossed', icon: Lock },
    { date: '2026-06-15', event: 'Platinum tier reputation unlocked', icon: Star },
    { date: '2026-07-09', event: 'Level 4 Production MVP achieved', icon: TrendingUp },
  ];

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
            <Star className="h-7 w-7 text-[#bca464]" />
            Reputation System
          </h1>
          <p className="text-xs text-[#2b1d16]/60 dark:text-[#9894ac] mt-1">
            Blockchain-verified trust score and on-chain performance history
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#bca464]/40 bg-[#bca464]/5">
          <Star className="h-5 w-5 fill-[#bca464] text-[#bca464]" />
          <div>
            <span className="text-lg font-black font-mono" style={{ color: tierColor }}>{rep.score}</span>
            <span className="text-[9px] ml-1 font-bold uppercase tracking-wider" style={{ color: tierColor }}>/ 100 • {scoreTier}</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Reputation Score Card */}
      <motion.div variants={itemVariants} className="p-6 rounded-xl border border-[#bca464]/30 bg-gradient-to-br from-[#bca464]/5 to-[#ac5c2c]/5 dark:from-[#39332d] dark:to-[#24211f]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Score Ring */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" className="text-[#5d240a]/10 dark:text-[#39332d]" strokeWidth="10" />
                <circle
                  cx="80" cy="80" r="70"
                  fill="none"
                  stroke={tierColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - rep.score / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black font-mono" style={{ color: tierColor }}>{rep.score}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#2b1d16]/60 dark:text-[#9894ac]">score</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold text-sm" style={{ borderColor: tierColor, color: tierColor }}>
                <Award className="h-4 w-4" /> {scoreTier} Tier
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div>
            <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider mb-4">Performance Radar</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" fontSize={9} tick={{ fill: 'var(--text-muted)' }} />
                  <Radar name="Score" dataKey="A" stroke={tierColor} fill={tierColor} fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Completed Projects', value: rep.completed, icon: FolderKanban, color: 'text-[#4CAF50]' },
          { label: 'Success Rate', value: `${rep.successRate}%`, icon: TrendingUp, color: 'text-[#bca464]' },
          { label: 'Total Escrow', value: `${(rep.totalEscrow/1000).toFixed(0)}K XLM`, icon: Lock, color: 'text-[#ac5c2c]' },
          { label: 'Milestones Approved', value: rep.approvedMilestones, icon: CheckCircle, color: 'text-[#4CAF50]' },
        ].map(m => (
          <div key={m.label} className="p-5 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]">
            <m.icon className={`h-5 w-5 ${m.color} mb-3`} />
            <div className="text-xl font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">{m.value}</div>
            <p className="text-[10px] text-[#2b1d16]/60 dark:text-[#9894ac] mt-0.5 font-bold uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Badges + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badges */}
        <motion.div variants={itemVariants} className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-4">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Achievement Badges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGES.map((b, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                  b.earned
                    ? 'border-[#bca464]/30 bg-[#bca464]/5'
                    : 'border-[#5d240a]/10 dark:border-[#39332d]/40 opacity-40 grayscale'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${b.earned ? 'bg-[#bca464]/15' : 'bg-[#5d240a]/5'}`}>
                  <b.icon className={`h-4 w-4 ${b.earned ? 'text-[#bca464]' : 'text-[#2b1d16]/40 dark:text-[#9894ac]/40'}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#5d240a] dark:text-[#f5efe7]">{b.name}</p>
                  <p className="text-[9px] text-[#2b1d16]/60 dark:text-[#9894ac] mt-0.5 leading-tight">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={itemVariants} className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-4">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Reputation Timeline</h3>
          <div className="space-y-0">
            {TIMELINE.map((t, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-[#ac5c2c]/10 border-2 border-[#ac5c2c]/30 flex items-center justify-center shrink-0 z-10">
                    <t.icon className="h-3.5 w-3.5 text-[#ac5c2c]" />
                  </div>
                  {idx < TIMELINE.length - 1 && (
                    <div className="w-[1px] h-8 bg-[#ac5c2c]/15" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-[9px] font-mono text-[#2b1d16]/40 dark:text-[#9894ac]/40">{t.date}</p>
                  <p className="text-xs font-semibold text-[#2b1d16] dark:text-[#f5efe7]/80 leading-snug">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
