import React, { useRef, useState, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, FileCheck, Star, ClipboardEdit, Layers } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassTabBar, glassTabActive } from './LiquidGlass';
import { createPageUrl } from '../../utils';

// Pages that belong to the "subject detail" context
const SUBJECT_PAGES = ['SubjectReview', 'Processing', 'EsotericProfile', 'DSPReport', 'UnifiedDossier'];

const tabs = [
  { name: 'Review',     page: 'SubjectReview',   icon: ClipboardEdit },
  { name: 'Processing', page: 'Processing',       icon: Activity      },
  { name: 'Esoteric',   page: 'EsotericProfile',  icon: Star          },
  { name: 'Report',     page: 'DSPReport',        icon: FileCheck     },
  { name: 'Dossier',    page: 'UnifiedDossier',   icon: Layers        },
];

export default function SubjectTopNav({ currentPageName }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const navigate = useNavigate();
  const location = useLocation();

  const navRef  = useRef(null);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // Only render on subject-scoped pages with an id param
  const urlParams = new URLSearchParams(location.search);
  const subjectId = urlParams.get('id');
  const isVisible = SUBJECT_PAGES.includes(currentPageName) && !!subjectId;

  const activeIndex = tabs.findIndex(tab => tab.page === currentPageName);

  useLayoutEffect(() => {
    const activeRef = tabRefs.current[activeIndex];
    const nav = navRef.current;
    if (!activeRef || !nav) return;
    const tabRect = activeRef.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setIndicator({ left: tabRect.left - navRect.left, width: tabRect.width });
  }, [activeIndex, currentPageName, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="subject-top-nav"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'sticky',
            top: 57,
            zIndex: 40,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <nav
            ref={navRef}
            style={{
              ...glassTabBar(t),
              position:   'relative',
              display:    'flex',
              alignItems: 'stretch',
              padding:    4,
              borderRadius: 999,
            }}
          >
            {/* Sliding indicator */}
            <motion.div
              animate={{ left: indicator.left, width: indicator.width }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              style={{
                ...glassTabActive(t),
                position:      'absolute',
                top:           4,
                height:        'calc(100% - 8px)',
                pointerEvents: 'none',
              }}
            />

            {tabs.map((tab, i) => {
              const isActive = activeIndex === i;
              const Icon = tab.icon;
              return (
                <div
                  key={tab.page}
                  ref={el => { tabRefs.current[i] = el; }}
                >
                  <button
                    onClick={() => navigate(createPageUrl(`${tab.page}?id=${subjectId}`))}
                    style={{
                      display:       'flex',
                      flexDirection: 'column',
                      alignItems:    'center',
                      justifyContent:'center',
                      gap:           3,
                      padding:       '6px 18px',
                      background:    'none',
                      border:        'none',
                      cursor:        'pointer',
                      position:      'relative',
                      zIndex:        1,
                      color:         isActive ? t.tabTextActive : t.tabText,
                      transition:    'color 0.25s ease',
                    }}
                  >
                    <motion.div
                      animate={{ scale: isActive ? 1.1 : 1.0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Icon
                        style={{
                          width: 15,
                          height: 15,
                          strokeWidth: isActive ? 2.2 : 1.8,
                          color: tab.page === 'EsotericProfile' && isActive ? '#8b5cf6' : undefined,
                        }}
                      />
                    </motion.div>
                    <span style={{
                      fontSize: 9,
                      fontWeight: isActive ? 600 : 500,
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>
                      {tab.name}
                    </span>
                  </button>
                </div>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}