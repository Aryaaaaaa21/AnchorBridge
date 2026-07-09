import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, AlertOctagon, Info, CheckCircle2,
  Wifi, ShieldAlert, XCircle, RefreshCw, Trash2, Filter
} from 'lucide-react';
import {
  getSentryEvents, resolveEvent, clearSentryEvents, seedDemoSentryEvents,
  sentryService, type SentryEvent
} from '../services/monitoring';
import { toast } from 'sonner';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const LEVEL_COLORS: Record<SentryEvent['level'], string> = {
  fatal: '#D9534F',
  error: '#E8A317',
  warning: '#bca464',
  info: '#ac5c2c',
};

const CATEGORY_ICONS: Record<SentryEvent['category'], React.FC<any>> = {
  wallet: Wifi,
  contract: ShieldAlert,
  transaction: XCircle,
  frontend: AlertTriangle,
  system: Info,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export const Monitoring: React.FC = () => {
  const [events, setEvents] = useState<SentryEvent[]>([]);
  const [filter, setFilter] = useState<'all' | SentryEvent['category']>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | SentryEvent['level']>('all');
  const [metrics, setMetrics] = useState(sentryService.getMetrics());

  const refresh = () => {
    seedDemoSentryEvents();
    setEvents(getSentryEvents());
    setMetrics(sentryService.getMetrics());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleResolve = (id: string) => {
    resolveEvent(id);
    refresh();
    toast.success('Event marked as resolved.');
  };

  const handleClear = () => {
    if (!confirm('Clear all monitoring events?')) return;
    clearSentryEvents();
    refresh();
    toast.info('All events cleared.');
  };

  const filtered = events.filter(e => {
    if (filter !== 'all' && e.category !== filter) return false;
    if (levelFilter !== 'all' && e.level !== levelFilter) return false;
    return true;
  });

  // Chart data
  const categoryData = Object.entries(metrics.byCategory).map(([name, value]) => ({ name, value }));
  const levelData = Object.entries(metrics.byLevel).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#ac5c2c', '#bca464', '#4CAF50', '#D9534F', '#E8A317'];

  function LevelBadge({ level }: { level: SentryEvent['level'] }) {
    const colors: Record<string, string> = {
      fatal: 'bg-red-500/10 text-red-500',
      error: 'bg-[#E8A317]/10 text-[#E8A317]',
      warning: 'bg-[#bca464]/10 text-[#bca464]',
      info: 'bg-[#ac5c2c]/10 text-[#ac5c2c]',
    };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${colors[level]}`}>
        {level}
      </span>
    );
  }

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
            <AlertOctagon className="h-7 w-7 text-[#ac5c2c]" />
            Monitoring
          </h1>
          <p className="text-xs text-[#2b1d16]/60 dark:text-[#9894ac] mt-1">
            Sentry error tracking — wallet, contract, transaction and frontend exceptions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            id="btn-refresh-monitoring"
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-[#5d240a]/20 dark:border-[#39332d] rounded-lg text-[#5d240a] dark:text-[#f5efe7] hover:bg-[#5d240a]/5 transition-all min-h-[36px]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            id="btn-clear-monitoring"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-red-300 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all min-h-[36px]"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: metrics.total, icon: AlertOctagon, color: 'text-[#2b1d16] dark:text-[#f5efe7]' },
          { label: 'Unresolved', value: metrics.unresolved, icon: XCircle, color: 'text-red-500' },
          { label: 'Resolved', value: metrics.resolved, icon: CheckCircle2, color: 'text-[#4CAF50]' },
          { label: 'Error Rate', value: `${metrics.total > 0 ? Math.round((metrics.byLevel?.error || 0 + metrics.byLevel?.fatal || 0) / metrics.total * 100) : 0}%`, icon: AlertTriangle, color: 'text-[#E8A317]' },
        ].map(card => (
          <div key={card.label} className="p-5 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col gap-2 h-28">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2b1d16]/60 dark:text-[#9894ac]">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <span className="text-2xl font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">{card.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider mb-4">Events by Category</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, value }) => `${name}: ${value}`} labelLine={true} fontSize={9}>
                  {categoryData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider mb-4">Events by Severity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} stroke="var(--text-muted)" />
                <YAxis fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="value" fill="#ac5c2c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 items-center">
        <Filter className="h-3.5 w-3.5 text-[#2b1d16]/50 dark:text-[#9894ac]" />
        <span className="text-[10px] font-bold text-[#2b1d16]/50 dark:text-[#9894ac] uppercase mr-1">Category:</span>
        {(['all', 'wallet', 'contract', 'transaction', 'frontend', 'system'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${filter === cat ? 'bg-[#ac5c2c] text-[#f5efe7]' : 'bg-[#5d240a]/8 dark:bg-[#39332d]/50 text-[#2b1d16]/60 dark:text-[#9894ac] hover:bg-[#5d240a]/15'}`}
          >
            {cat}
          </button>
        ))}
        <span className="text-[10px] font-bold text-[#2b1d16]/50 dark:text-[#9894ac] uppercase ml-3 mr-1">Level:</span>
        {(['all', 'fatal', 'error', 'warning', 'info'] as const).map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${levelFilter === lvl ? 'bg-[#ac5c2c] text-[#f5efe7]' : 'bg-[#5d240a]/8 dark:bg-[#39332d]/50 text-[#2b1d16]/60 dark:text-[#9894ac] hover:bg-[#5d240a]/15'}`}
          >
            {lvl}
          </button>
        ))}
      </motion.div>

      {/* Events Table */}
      <motion.div variants={itemVariants} className="rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#5d240a]/10 dark:border-[#39332d]/40 flex justify-between items-center">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">
            Event Log ({filtered.length})
          </h3>
          <span className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac] font-mono">
            {metrics.unresolved} unresolved
          </span>
        </div>

        <div className="divide-y divide-[#5d240a]/8 dark:divide-[#39332d]/30 max-h-[500px] overflow-y-auto">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#2b1d16]/50 dark:text-[#9894ac]">
                <CheckCircle2 className="h-10 w-10 mx-auto text-[#4CAF50] opacity-50 mb-3" />
                No events match current filters.
              </div>
            ) : (
              filtered.map(event => {
                const Icon = CATEGORY_ICONS[event.category];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#5d240a]/3 dark:hover:bg-[#39332d]/20 transition-colors ${event.resolved ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 h-6 w-6 rounded flex items-center justify-center shrink-0"
                        style={{ backgroundColor: LEVEL_COLORS[event.level] + '15' }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: LEVEL_COLORS[event.level] }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#5d240a] dark:text-[#f5efe7] truncate">{event.title}</span>
                          <LevelBadge level={event.level} />
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase bg-[#5d240a]/8 dark:bg-[#39332d]/40 text-[#2b1d16]/60 dark:text-[#9894ac]`}>
                            {event.category}
                          </span>
                          {event.resolved && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase bg-[#4CAF50]/10 text-[#4CAF50]">resolved</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#2b1d16]/70 dark:text-[#9894ac] truncate">{event.message}</p>
                        <p className="text-[9px] text-[#2b1d16]/40 dark:text-[#9894ac]/50 font-mono mt-0.5">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!event.resolved && (
                      <button
                        onClick={() => handleResolve(event.id)}
                        className="shrink-0 px-3 py-1.5 text-[9px] font-bold border border-[#4CAF50]/40 text-[#4CAF50] rounded-lg hover:bg-[#4CAF50]/10 transition-all min-h-[28px]"
                      >
                        Resolve
                      </button>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Sentry Attribution */}
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 text-[10px] text-[#2b1d16]/40 dark:text-[#9894ac]/50 font-mono">
        <ShieldAlert className="h-3.5 w-3.5" />
        Powered by Sentry Error Monitoring SDK — AnchorBridge Production Environment
      </motion.div>
    </motion.div>
  );
};
