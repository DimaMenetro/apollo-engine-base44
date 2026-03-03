import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * AccessoryContext — shared state for the BottomAccessory bar.
 * The Processing page publishes to this context; the BottomAccessory reads it.
 * Lives at the Layout level so it persists across page navigation.
 */

const AccessoryContext = createContext();

const IDLE = {
  status: 'idle',      // idle | running | completed | failed
  moduleTitle: '',
  progress: 0,
  subjectId: null,
  subjectName: '',
};

export function AccessoryProvider({ children }) {
  const [state, setState] = useState(IDLE);

  const startProcessing = useCallback((subjectId, subjectName) => {
    setState({ status: 'running', moduleTitle: '', progress: 0, subjectId, subjectName });
  }, []);

  const updateProgress = useCallback((moduleTitle, progress) => {
    setState((prev) => ({ ...prev, status: 'running', moduleTitle, progress }));
  }, []);

  const finishProcessing = useCallback((subjectId) => {
    setState((prev) => ({ ...prev, status: 'completed', progress: 100, subjectId }));
    // Auto-dismiss after 3s
    setTimeout(() => setState(IDLE), 3000);
  }, []);

  const failProcessing = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'failed' }));
    // Auto-dismiss after 5s
    setTimeout(() => setState(IDLE), 5000);
  }, []);

  const clearAccessory = useCallback(() => setState(IDLE), []);

  return (
    <AccessoryContext.Provider
      value={{
        ...state,
        startProcessing,
        updateProgress,
        finishProcessing,
        failProcessing,
        clearAccessory,
      }}
    >
      {children}
    </AccessoryContext.Provider>
  );
}

export function useAccessory() {
  const context = useContext(AccessoryContext);
  if (!context) throw new Error('useAccessory must be used within AccessoryProvider');
  return context;
}