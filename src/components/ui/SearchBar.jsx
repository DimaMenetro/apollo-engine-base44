import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../../utils';
import { glassTabBar, glassTabActive } from './LiquidGlass';

/**
 * SearchBar — Liquid Glass expanding search disc for the tab bar.
 * Collapsed: a standalone disc with magnifying glass icon.
 * Expanded: full pill input that absorbs the tab bar space, tab bar shrinks to Apollo logo only.
 */
export default function SearchBar({ t, isDark, isExpanded, onExpand, onCollapse }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isExpanded]);

  // Search subjects
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const all = await base44.entities.Subject.list('-updated_date', 50);
        const q = query.toLowerCase();
        const filtered = all.filter(s =>
          s.name?.toLowerCase().includes(q) ||
          s.status?.toLowerCase().includes(q) ||
          s.dsp?.executive_summary?.toLowerCase().includes(q) ||
          s.dsp?.classification?.toLowerCase().includes(q)
        );
        setResults(filtered.slice(0, 6));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const getSubjectPage = (s) => {
    if (s.status === 'finalized') return createPageUrl(`DSPReport?id=${s.id}`);
    if (s.status === 'review')    return createPageUrl(`SubjectReview?id=${s.id}`);
    if (s.status === 'processing') return createPageUrl(`Processing?id=${s.id}`);
    return createPageUrl(`SubjectIntake?id=${s.id}`);
  };

  const statusColors = { intake: '#64748b', processing: '#f59e0b', review: '#8b5cf6', finalized: '#10b981' };

  const glassPill = {
    background:           isDark ? 'rgba(28,28,36,0.72)' : 'rgba(255,255,255,0.55)',
    backdropFilter:       'blur(50px) saturate(200%)',
    WebkitBackdropFilter: 'blur(50px) saturate(200%)',
    border:               `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.70)'}`,
    boxShadow:            isDark
      ? 'inset 0 1px 0 0 rgba(255,255,255,0.12), inset 0 -1px 0 0 rgba(0,0,0,0.45), 0 8px 32px rgba(0,0,0,0.40)'
      : 'inset 0 1.5px 0 0 rgba(255,255,255,0.95), inset 0 -1px 0 0 rgba(0,0,0,0.04), 0 8px 32px rgba(60,60,80,0.08)',
    borderRadius: 999,
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Collapsed: search disc */}
      {!isExpanded && (
        <motion.button
          layoutId="search-pill"
          onClick={onExpand}
          whileTap={{ scale: 0.92 }}
          style={{
            ...glassPill,
            width: 50, height: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none', flexShrink: 0,
          }}
        >
          <Search style={{ width: 19, height: 19, color: t.tabText }} />
        </motion.button>
      )}

      {/* Expanded: full search pill — magnifier on RIGHT like reference */}
      {isExpanded && (
        <motion.div
          layoutId="search-pill"
          style={{
            ...glassPill,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 16px', height: 50, width: '100%',
            position: 'relative',
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, reports…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: t.title, fontFamily: 'inherit',
            }}
          />
          {loading ? (
            <div style={{ width: 15, height: 15, borderRadius: '50%', border: `2px solid ${t.accent}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          ) : (
            <Search style={{ width: 17, height: 17, color: t.muted, flexShrink: 0 }} />
          )}
        </motion.div>
      )}

      {/* Results dropdown */}
      <AnimatePresence>
        {isExpanded && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'absolute', bottom: 58, left: 0, right: 0,
              ...glassPill,
              borderRadius: 20,
              padding: '8px 0',
              display: 'flex', flexDirection: 'column',
              maxHeight: 280, overflowY: 'auto',
            }}
          >
            {results.map((subject) => (
              <button
                key={subject.id}
                onClick={() => { navigate(getSubjectPage(subject)); onCollapse(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[subject.status] || '#64748b', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.title, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {subject.name}
                  </div>
                  <div style={{ fontSize: 11, color: t.muted, textTransform: 'capitalize' }}>{subject.status}</div>
                </div>
                {subject.dsp?.confidence_score != null && (
                  <span style={{ fontSize: 11, color: t.accent, flexShrink: 0 }}>{subject.dsp.confidence_score}%</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
        {isExpanded && query.trim() && !loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', bottom: 58, left: 0, right: 0,
              ...glassPill, borderRadius: 20,
              padding: '16px', textAlign: 'center',
              fontSize: 13, color: t.muted,
            }}
          >
            No subjects found
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}