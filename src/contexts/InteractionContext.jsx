import React, { createContext, useContext, useState } from 'react';

const InteractionContext = createContext();

export const InteractionProvider = ({ children }) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  
  return (
    <InteractionContext.Provider value={{ hasInteracted, setHasInteracted }}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return context;
};
