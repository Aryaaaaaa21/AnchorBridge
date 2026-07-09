import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, MessageSquare, Download, Trash2, Plus, 
  ChevronRight, User, Bug, Lightbulb, Heart
} from 'lucide-react';
import { 
  submitFeedback, getFeedbackEntries, exportFeedbackAsCSV, 
  exportFeedbackAsJSON, clearFeedback, getFeedbackSummary,
  seedDemoFeedback, type FeedbackEntry 
} from '../services/feedback';
import { analytics } from '../services/analytics';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

export const Feedback: React.FC = () => {
  const { walletAddress } = useStore();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [summary, setSummary] = useState(getFeedbackSummary());
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    walletAddress: walletAddress || '',
    rating: 5,
    experience: '',
    featureRequests: '',
    bugsFound: '',
  });

  useEffect(() => {
    seedDemoFeedback();
    const all = getFeedbackEntries();
    setEntries(all);
    setSummary(getFeedbackSummary());
  }, []);

  useEffect(() => {
    setForm(f => ({ ...f, walletAddress: walletAddress || '' }));
  }, [walletAddress]);

  const refresh = () => {
    setEntries(getFeedbackEntries());
    setSummary(getFeedbackSummary());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.experience.trim()) {
      toast.error('Please share your experience before submitting.');
      return;
    }

    submitFeedback({
      walletAddress: form.walletAddress || 'Anonymous',
      rating: form.rating,
      experience: form.experience,
      featureRequests: form.featureRequests,
      bugsFound: form.bugsFound,
    });

    analytics.feedbackSubmitted(
      form.rating,
      form.featureRequests.trim().length > 0,
      form.bugsFound.trim().length > 0
    );

    toast.success('Thank you! Your feedback has been recorded.');
    setForm({ walletAddress: walletAddress || '', rating: 5, experience: '', featureRequests: '', bugsFound: '' });
    setShowForm(false);
    refresh();
  };

  const handleExportCSV = () => {
    const csv = exportFeedbackAsCSV();
    if (!csv) return toast.error('No feedback to export.');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anchorbridge-feedback-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Feedback exported as CSV.');
  };

  const handleExportJSON = () => {
    const json = exportFeedbackAsJSON();
    if (!json || json === '[]') return toast.error('No feedback to export.');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anchorbridge-feedback-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Feedback exported as JSON.');
  };

  const handleClear = () => {
    if (!confirm('Clear all feedback entries? This cannot be undone.')) return;
    clearFeedback();
    refresh();
    toast.info('All feedback cleared.');
  };

  // Chart data: ratings distribution
  const ratingChartData = [1,2,3,4,5].map(r => ({
    rating: `${r}★`,
    count: summary.byRating[r] || 0,
  }));

  const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = 
    ({ value, onChange, readonly }) => (
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(r => (
          <button
            key={r}
            type="button"
            onClick={() => !readonly && onChange?.(r)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            aria-label={`Rate ${r} star${r > 1 ? 's' : ''}`}
          >
            <Star className={`h-5 w-5 ${r <= value ? 'text-[#bca464] fill-[#bca464]' : 'text-[#2b1d16]/20 dark:text-[#f5efe7]/20'}`} />
          </button>
        ))}
      </div>
    );

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
            <Heart className="h-7 w-7 text-[#ac5c2c]" />
            User Feedback
          </h1>
          <p className="text-xs text-[#2b1d16]/60 dark:text-[#9894ac] mt-1">
            Real user reviews and product improvement suggestions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-[#5d240a]/20 dark:border-[#39332d] rounded-lg text-[#5d240a] dark:text-[#f5efe7] hover:bg-[#5d240a]/5 transition-all min-h-[36px]"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-[#5d240a]/20 dark:border-[#39332d] rounded-lg text-[#5d240a] dark:text-[#f5efe7] hover:bg-[#5d240a]/5 transition-all min-h-[36px]"
          >
            <Download className="h-3.5 w-3.5" /> JSON
          </button>
          <button
            id="btn-clear-feedback"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-red-300 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all min-h-[36px]"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
          <button
            id="btn-submit-feedback"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#5d240a] text-[#f5efe7] rounded-lg hover:bg-[#ac5c2c] transition-all min-h-[36px]"
          >
            <Plus className="h-3.5 w-3.5" />
            {showForm ? 'Cancel' : 'Submit Feedback'}
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Responses', value: summary.total, icon: MessageSquare, color: 'text-[#ac5c2c]' },
          { label: 'Avg Rating', value: `${summary.avgRating}/5`, icon: Star, color: 'text-[#bca464]' },
          { label: 'Mobile Users', value: summary.byPlatform.mobile, icon: User, color: 'text-[#4CAF50]' },
          { label: 'Desktop Users', value: summary.byPlatform.desktop, icon: User, color: 'text-[#5d240a] dark:text-[#f5efe7]' },
        ].map((card) => (
          <div
            key={card.label}
            className="p-5 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2b1d16]/60 dark:text-[#9894ac]">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <span className="text-2xl font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">{card.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Feedback Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-6 rounded-xl border border-[#ac5c2c]/30 bg-white/60 dark:bg-[#24211f] space-y-5"
        >
          <h2 className="text-sm font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Submit Your Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#2b1d16]/60 dark:text-[#9894ac]">
                  Wallet Address
                </label>
                <input
                  id="feedback-wallet"
                  type="text"
                  value={form.walletAddress}
                  onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))}
                  placeholder="G... (auto-filled if connected)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#5d240a]/20 dark:border-[#39332d] bg-white/50 dark:bg-[#171514] text-[#2b1d16] dark:text-[#f5efe7] font-mono outline-none focus:border-[#ac5c2c] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#2b1d16]/60 dark:text-[#9894ac]">
                  Overall Rating
                </label>
                <div className="flex items-center h-[34px]">
                  <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#2b1d16]/60 dark:text-[#9894ac] flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-[#ac5c2c]" /> Your Experience *
              </label>
              <textarea
                id="feedback-experience"
                required
                value={form.experience}
                onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                rows={3}
                placeholder="How was your experience using AnchorBridge? What worked well?"
                className="w-full px-3 py-2.5 text-xs rounded-lg border border-[#5d240a]/20 dark:border-[#39332d] bg-white/50 dark:bg-[#171514] text-[#2b1d16] dark:text-[#f5efe7] outline-none focus:border-[#ac5c2c] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#2b1d16]/60 dark:text-[#9894ac] flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-[#bca464]" /> Feature Requests
                </label>
                <textarea
                  id="feedback-features"
                  value={form.featureRequests}
                  onChange={e => setForm(f => ({ ...f, featureRequests: e.target.value }))}
                  rows={2}
                  placeholder="What features would you like to see added?"
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-[#5d240a]/20 dark:border-[#39332d] bg-white/50 dark:bg-[#171514] text-[#2b1d16] dark:text-[#f5efe7] outline-none focus:border-[#ac5c2c] transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#2b1d16]/60 dark:text-[#9894ac] flex items-center gap-1.5">
                  <Bug className="h-3.5 w-3.5 text-red-500" /> Bugs Found
                </label>
                <textarea
                  id="feedback-bugs"
                  value={form.bugsFound}
                  onChange={e => setForm(f => ({ ...f, bugsFound: e.target.value }))}
                  rows={2}
                  placeholder="Any bugs or issues you noticed?"
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-[#5d240a]/20 dark:border-[#39332d] bg-white/50 dark:bg-[#171514] text-[#2b1d16] dark:text-[#f5efe7] outline-none focus:border-[#ac5c2c] transition-colors resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-feedback-form"
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-[#ac5c2c] text-[#f5efe7] rounded-lg hover:bg-[#5d240a] transition-all min-h-[40px]"
            >
              Submit Feedback <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </motion.div>
      )}

      {/* Chart + Entries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Chart */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-4"
        >
          <h2 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Rating Distribution</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="rating" fontSize={10} stroke="var(--text-muted)" />
                <YAxis fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#ac5c2c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#5d240a]/10 dark:border-[#39332d]/40">
            <div className="flex justify-between text-xs">
              <span className="text-[#2b1d16]/60 dark:text-[#9894ac]">5-star responses</span>
              <span className="font-bold text-[#4CAF50]">{summary.byRating[5] || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#2b1d16]/60 dark:text-[#9894ac]">4-star responses</span>
              <span className="font-bold text-[#bca464]">{summary.byRating[4] || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#2b1d16]/60 dark:text-[#9894ac]">≤3-star responses</span>
              <span className="font-bold text-[#ac5c2c]">
                {(summary.byRating[3] || 0) + (summary.byRating[2] || 0) + (summary.byRating[1] || 0)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Feedback Entries */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">
            All Feedback ({entries.length})
          </h2>
          {entries.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-[#5d240a]/20">
              <MessageSquare className="h-10 w-10 mx-auto text-[#2b1d16]/30 mb-3" />
              <p className="text-xs text-[#2b1d16]/60 dark:text-[#9894ac]">No feedback yet. Be the first to submit!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border border-[#5d240a]/10 dark:border-[#39332d]/50 bg-white/40 dark:bg-[#24211f] space-y-2"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="font-mono text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac]/60 truncate max-w-[200px]">
                      {entry.walletAddress}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(r => (
                          <Star key={r} className={`h-3 w-3 ${r <= entry.rating ? 'text-[#bca464] fill-[#bca464]' : 'text-[#2b1d16]/15'}`} />
                        ))}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${entry.platform === 'mobile' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 'bg-[#ac5c2c]/10 text-[#ac5c2c]'}`}>
                        {entry.platform}
                      </span>
                      <span className="text-[9px] text-[#2b1d16]/40 dark:text-[#9894ac]/40 font-mono">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#2b1d16] dark:text-[#f5efe7]/80 leading-relaxed">
                    "{entry.experience}"
                  </p>

                  {(entry.featureRequests || entry.bugsFound) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {entry.featureRequests && (
                        <div className="p-2 rounded bg-[#bca464]/5 border border-[#bca464]/20 text-[10px] text-[#2b1d16]/70 dark:text-[#9894ac]">
                          <span className="font-bold text-[#bca464] block mb-0.5">Feature Request</span>
                          {entry.featureRequests}
                        </div>
                      )}
                      {entry.bugsFound && entry.bugsFound !== 'None.' && entry.bugsFound !== 'None encountered.' && (
                        <div className="p-2 rounded bg-red-500/5 border border-red-500/20 text-[10px] text-[#2b1d16]/70 dark:text-[#9894ac]">
                          <span className="font-bold text-red-500 block mb-0.5">Bug Report</span>
                          {entry.bugsFound}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
