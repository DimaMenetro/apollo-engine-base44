import React, { useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, UserPlus, Activity, FileText } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassTabBar, glassTabActive } from './LiquidGlass';
import BottomAccessory from './BottomAccessory';

const tabs = [
  { name: 'Dashboard', page: 'Dashboard',     icon: LayoutDashboard },
  { name: 'Subject',   page: 'SubjectIntake',  icon: UserPlus        },
  { name: 'Processing',page: 'Processing',     icon: Activity        },
  { name: 'Reports',   page: 'Reports',        icon: FileText        },
];

// Map every page to its corresponding tab
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

  const navRef  = useRef(null);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activePage  = PAGE_TO_TAB[currentPageName] || 'Dashboard';
  const activeIndex = tabs.findIndex((tab) => tab.page === activePage);

  // Measure the active tab rect relative to the nav pill and animate the indicator
  useLayoutEffect(() => {
    const activeRef = tabRefs.current[activeIndex];
    const nav       = navRef.current;
    if (!activeRef || !nav) return;

    const tabRect = activeRef.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setIndicator({
      left:  tabRect.left  - navRect.left,
      width: tabRect.width,
    });
  }, [activeIndex, currentPageName]);

  return (
    <div
      style={{
        position:        'fixed',
        bottom:          0,
        left:            0,
        right:           0,
        zIndex:          100,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        paddingBottom:   16,
        paddingLeft:     16,
        paddingRight:    16,
        pointerEvents:   'none',
      }}
    >
      {/* Bottom Accessory slot */}
      <div style={{ pointerEvents: 'auto', marginBottom: 8, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <BottomAccessory t={t} />
      </div>

      {/* Tab bar pill */}
      <motion.nav
        ref={navRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
        style={{
          ...glassTabBar(t),
          position:      'relative',
          display:       'flex',
          alignItems:    'stretch',
          padding:       6,
          pointerEvents: 'auto',
          width:         '100%',
          maxWidth:      440,
        }}
      >
        {/* Sliding indicator */}
        <motion.div
          animate={{    left: indicator.left, width: indicator.width }}
          transition={{ type: 'spring', stiffness: 500, damping: 35  }}
          style={{
            ...glassTabActive(t),
            position:      'absolute',
            top:           6,
            height:        'calc(100% - 12px)',
            pointerEvents: 'none',
          }}
        />

        {tabs.map((tab, i) => {
          const isActive = activeIndex === i;
          const Icon     = tab.icon;

          return (
            <div
              key={tab.page}
              ref={(el) => { tabRefs.current[i] = el; }}
              style={{ flex: 1 }}
            >
              <Link
                to={createPageUrl(tab.page)}
                style={{
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            3,
                  padding:        '8px 4px',
                  textDecoration: 'none',
                  position:       'relative',
                  zIndex:         1,
                  color:          isActive ? t.tabTextActive : t.tabText,
                  transition:     'color 0.25s ease',
                  width:          '100%',
                }}
              >
                <motion.div
                  animate={{    scale:  isActive ? 1.1 : 1.0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Icon
                    style={{
                      width:       20,
                      height:      20,
                      strokeWidth: isActive ? 2.2 : 1.8,
                    }}
                  />
                </motion.div>
                <span
                  style={{
                    fontSize:      10,
                    fontWeight:    isActive ? 600 : 500,
                    letterSpacing: '0.03em',
                    whiteSpace:    'nowrap',
                  }}
                >
                  {tab.name}
                </span>
              </Link>
            </div>
          );
        })}
      </motion.nav>
    </div>
  );
}