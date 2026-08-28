import React, { createContext, useContext, useState } from 'react';
import { clsx } from 'clsx';
import styles from './Tabs.module.css';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className 
}: { 
  defaultValue?: string; 
  value?: string; 
  onValueChange?: (value: string) => void; 
  children: React.ReactNode; 
  className?: string; 
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue);
    if (value === undefined) setInternalValue(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={clsx(styles.tabs, className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx(styles.list, className)} role="tablist">
    {children}
  </div>
);

export const TabsTrigger = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  
  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      className={clsx(styles.trigger, className)}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  
  const isActive = context.value === value;
  
  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      data-state={isActive ? 'active' : 'inactive'}
      className={clsx(styles.content, className)}
    >
      {children}
    </div>
  );
};
