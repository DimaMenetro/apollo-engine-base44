import React, { useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, UserPlus, Activity, FileText, Radar } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassTabBar, glassTabActive } from './LiquidGlass';
import BottomAccessory from './BottomAccessory';
import SearchBar from './SearchBar';

const tabs = [
  { name: 'Dashboard', page: 'Dashboard',    icon: LayoutDashboard },
  { name: 'Subject',   page: 'SubjectIntake', icon: UserPlus        },
  { name: 'Processing',page: 'Processing',    icon: Activity        },
  { name: 'Reports',   page: 'Reports',       icon: FileText        },
];

const PAGE_TO_TAB = {
  Dashboard:     'Dashboard',
  SubjectIntake: 'SubjectIntake',
  Processing:    'Processing',
  Reports:       'Reports',
  SubjectReview: 'Reports',
  DSPReport:     'Reports',
};

export default function GlassTabBar({ currentPageName }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const navRef   = useRef(null);
  const tabRefs  = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [searchOpen, setSearchOpen] = useState(false);

  const activePage  = PAGE_TO_TAB[currentPageName] || 'Dashboard';
  const activeIndex = tabs.findIndex((tab) => tab.page === activePage);

  useLayoutEffect(() => {
    if (searchOpen) return; // don't re-measure while search is open
    const activeRef = tabRefs.current[activeIndex];
    const nav       = navRef.current;
    if (!activeRef || !nav) return;
    const tabRect = activeRef.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setIndicator({ left: tabRect.left - navRect.left, width: tabRect.width });
  }, [activeIndex, currentPageName, searchOpen]);

  return (
    <div
      style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        zIndex:        100,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        paddingBottom: 16,
        paddingLeft:   16,
        paddingRight:  16,
        pointerEvents: 'none',
      }}
    >
      {/* Bottom Accessory slot */}
      <div style={{ pointerEvents: 'auto', marginBottom: 8, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <BottomAccessory t={t} />
      </div>

      {/* Tab bar + search row */}
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           8,
          width:         '100%',
          maxWidth:      520,
          pointerEvents: 'auto',
        }}
      >
        {/* ── Main tab bar pill — shrinks when search is open ── */}
        <motion.nav
          ref={navRef}
          animate={searchOpen ? { width: 50, flexShrink: 0 } : { width: 'auto', flexShrink: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          style={{
            ...glassTabBar(t),
            position:   'relative',
            display:    'flex',
            alignItems: 'stretch',
            padding:    6,
            overflow:   'hidden',
            flex:       searchOpen ? '0 0 50px' : '1 1 auto',
          }}
        >
          {/* Sliding indicator — hide when search open */}
          {!searchOpen && (
            <motion.div
              animate={{ left: indicator.left, width: indicator.width }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              style={{
                ...glassTabActive(t),
                position:      'absolute',
                top:           6,
                height:        'calc(100% - 12px)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* When search is open → show only the Apollo icon as collapse trigger */}
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.button
                key="apollo-btn"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{    opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => setSearchOpen(false)}
                style={{
                  width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', color: t.accent, flexShrink: 0,
                }}
              >
                <Radar style={{ width: 20, height: 20 }} />
              </motion.button>
            ) : (
              <motion.div
                key="tabs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{    opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', flex: 1 }}
              >
                {tabs.map((tab, i) => {
                  const isActive = activeIndex === i;
                  const Icon     = tab.icon;
                  return (
                    <div key={tab.page} ref={(el) => { tabRefs.current[i] = el; }} style={{ flex: 1 }}>
                      <Link
                        to={createPageUrl(tab.page)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', gap: 3, padding: '8px 4px',
                          textDecoration: 'none', position: 'relative', zIndex: 1,
                          color: isActive ? t.tabTextActive : t.tabText,
                          transition: 'color 0.25s ease', width: '100%',
                        }}
                      >
                        <motion.div
                          animate={{ scale: isActive ? 1.1 : 1.0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <Icon style={{ width: 20, height: 20, strokeWidth: isActive ? 2.2 : 1.8 }} />
                        </motion.div>
                        <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                          {tab.name}
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* ── Search disc / expanded bar ── */}
        <motion.div
          animate={searchOpen ? { flex: 1 } : { flex: 0, flexBasis: 50 }}
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          style={{ minWidth: 50, overflow: 'visible' }}
        >
          <SearchBar
            t={t}
            isDark={isDark}
            isExpanded={searchOpen}
            onExpand={() => setSearchOpen(true)}
            onCollapse={() => setSearchOpen(false)}
          />
        </motion.div>
      </div>
    </div>
  );
}