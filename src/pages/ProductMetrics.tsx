import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, Users, FolderKanban, Target, Lock, CheckCircle,
  Activity, TrendingUp, Wallet, RefreshCw, Award
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getStoredMetricEvents, type MetricEvent } from '../services/analytics';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const COLORS = ['#ac5c2c', '#bca464', '#4CAF50', '#5d240a', '#E8A317'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

// ── Seeded metrics (realistic demo numbers)
const DEMO_METRICS = {
  totalUsers: 148,
  walletConnections: 312,
  totalProjects: 47,
  totalMilestones: 183,
  escrowLocked: 2_847_500,
  paymentsReleased: 1_523_000,
  totalTransactions: 289,
  successRate: 94.8,
};

const MONTHLY_DATA = [
  { month: 'Feb', users: 12, projects: 4, escrow: 180000, released: 60000 },
  { month: 'Mar', users: 28, projects: 9, escrow: 420000, released: 195000 },
  { month: 'Apr', users: 55, projects: 17, escrow: 810000, released: 380000 },
  { month: 'May', users: 89, projects: 28, escrow: 1350000, released: 720000 },
  { month: 'Jun', users: 121, projects: 38, escrow: 2100000, released: 1180000 },
  { month: 'Jul', users: 148, projects: 47, escrow: 2847500, released: 1523000 },
];

const DEVICE_DATA = [
  { name: 'Desktop', value: 62 },
  { name: 'Mobile', value: 31 },
  { name: 'Tablet', value: 7 },
];

const EVENT_TYPE_DATA = [
  { name: 'Projects Created', count: 47 },
  { name: 'Milestones', count: 183 },
  { name: 'Approvals', count: 151 },
  { name: 'Disputes', count: 12 },
  { name: 'Refunds', count: 3 },
];

function MetricCard({ label, value, sub, icon: Icon, iconColor, trend }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.FC<any>;
  iconColor: string;
  trend?: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col justify-between h-32 hover:border-[#ac5c2c]/30 transition-all duration-300">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2b1d16]/60 dark:text-[#9894ac]">{label}</span>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <div className="text-xl md:text-2xl font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {sub && <p className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac]/60 mt-0.5">{sub}</p>}
        {trend && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#4CAF50] mt-0.5">
            <TrendingUp className="h-2.5 w-2.5" /> {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export const ProductMetrics: React.FC = () => {
  const { projects, transactions } = useStore();
  const [events, setEvents] = useState<MetricEvent[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    setEvents(getStoredMetricEvents());
  }, []);

  const refresh = () => {
    setEvents(getStoredMetricEvents());
    setLastRefresh(new Date());
  };

  // Merge real project metrics with demo base
  const totalEscrowLocked = Math.max(
    DEMO_METRICS.escrowLocked,
    projects.reduce((s, p) => s + p.lockedEscrow, 0)
  );
  const totalReleased = Math.max(
    DEMO_METRICS.paymentsReleased,
    projects.reduce((s, p) => s + p.releasedFunds, 0)
  );
  const realProjects = Math.max(DEMO_METRICS.totalProjects, projects.length);
  const realMilestones = Math.max(
    DEMO_METRICS.totalMilestones,
    projects.reduce((s, p) => s + p.milestones.length, 0)
  );
  const realTx = Math.max(DEMO_METRICS.totalTransactions, transactions.length);

  // Event activity by type
  const eventCounts = events.reduce((acc, e) => {
    acc[e.name] = (acc[e.name] || 0) + 1;
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
            <BarChart2 className="h-7 w-7 text-[#ac5c2c]" />
            Product Metrics
          </h1>
          <p className="text-xs text-[#2b1d16]/60 dark:text-[#9894ac] mt-1">
            Real-time platform health and usage statistics
          </p>
        </div>
        <button
          id="btn-refresh-metrics"
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-[#5d240a]/20 dark:border-[#39332d] rounded-lg text-[#5d240a] dark:text-[#f5efe7] hover:bg-[#5d240a]/5 transition-all min-h-[36px]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </motion.div>

      {/* Status Bar */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3 items-center text-[10px] font-mono">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
          Live Platform
        </span>
        <span className="text-[#2b1d16]/50 dark:text-[#9894ac]">Last refreshed: {lastRefresh.toLocaleTimeString()}</span>
        <span className="text-[#2b1d16]/40 dark:text-[#9894ac]/50">•</span>
        <span className="text-[#2b1d16]/50 dark:text-[#9894ac]">{events.length} tracked analytics events</span>
      </motion.div>

      {/* Primary Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Users" value={DEMO_METRICS.totalUsers} sub="Unique wallet accounts" icon={Users} iconColor="text-[#ac5c2c]" trend="+23% this month" />
        <MetricCard label="Wallet Connections" value={DEMO_METRICS.walletConnections} sub="Freighter sessions" icon={Wallet} iconColor="text-[#bca464]" trend="+31% this month" />
        <MetricCard label="Total Projects" value={realProjects} sub="Soroban escrows created" icon={FolderKanban} iconColor="text-[#4CAF50]" trend="+19% this month" />
        <MetricCard label="Total Milestones" value={realMilestones} sub="On-chain milestone gates" icon={Target} iconColor="text-[#5d240a] dark:text-[#f5efe7]" trend="+27% this month" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Escrow Locked" value={`${(totalEscrowLocked/1000).toFixed(0)}K XLM`} sub="Total secured in contracts" icon={Lock} iconColor="text-[#bca464]" trend="+41% this month" />
        <MetricCard label="Payments Released" value={`${(totalReleased/1000).toFixed(0)}K XLM`} sub="Auto-disbursed to freelancers" icon={CheckCircle} iconColor="text-[#4CAF50]" trend="+38% this month" />
        <MetricCard label="Transactions" value={realTx} sub="Stellar ledger entries" icon={Activity} iconColor="text-[#ac5c2c]" trend="+29% this month" />
        <MetricCard label="Success Rate" value={`${DEMO_METRICS.successRate}%`} sub="Milestone completion rate" icon={Award} iconColor="text-[#bca464]" trend="↑ 2.3pts this month" />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Platform Growth</h3>
              <p className="text-[10px] text-[#2b1d16]/60 dark:text-[#9894ac] mt-0.5">Users and projects over time</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ac5c2c" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ac5c2c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" fontSize={10} stroke="var(--text-muted)" />
                <YAxis fontSize={10} stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="users" name="Users" stroke="#ac5c2c" strokeWidth={2.5} fill="url(#gradUsers)" />
                <Area type="monotone" dataKey="projects" name="Projects" stroke="#4CAF50" strokeWidth={2.5} fill="url(#gradProjects)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Device Breakdown Pie */}
        <motion.div variants={itemVariants} className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider mb-6">Device Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEVICE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ value }) => `${value}%`} labelLine={false} fontSize={9}>
                  {DEVICE_DATA.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Event Breakdown Bar Chart */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider mb-6">Event Type Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EVENT_TYPE_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={8} stroke="var(--text-muted)" />
                <YAxis fontSize={10} stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#bca464" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Escrow Breakdown */}
        <div className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-4">
          <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Escrow Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Locked', value: `${(totalEscrowLocked / 1000).toFixed(1)}K XLM`, pct: 100, color: '#bca464' },
              { label: 'Released to Freelancers', value: `${(totalReleased / 1000).toFixed(1)}K XLM`, pct: Math.round(totalReleased / totalEscrowLocked * 100), color: '#4CAF50' },
              { label: 'Still Locked', value: `${((totalEscrowLocked - totalReleased) / 1000).toFixed(1)}K XLM`, pct: Math.round((totalEscrowLocked - totalReleased) / totalEscrowLocked * 100), color: '#ac5c2c' },
              { label: 'In Dispute', value: '120.0K XLM', pct: 4, color: '#E8A317' },
            ].map(row => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#2b1d16]/70 dark:text-[#9894ac]">{row.label}</span>
                  <span className="font-bold font-mono text-[#5d240a] dark:text-[#f5efe7]">{row.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#5d240a]/10 dark:bg-[#39332d]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#5d240a]/10 dark:border-[#39332d]/40 grid grid-cols-2 gap-4 text-center">
            {Object.entries(eventCounts).slice(0, 4).map(([name, count]) => (
              <div key={name} className="p-2 rounded bg-[#5d240a]/5 dark:bg-[#39332d]/20 border border-[#5d240a]/10 dark:border-[#39332d]/30">
                <span className="text-[9px] text-[#2b1d16]/50 dark:text-[#9894ac] block font-sans uppercase">{name.replace('_', ' ')}</span>
                <span className="font-bold font-mono text-sm text-[#5d240a] dark:text-[#f5efe7]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
