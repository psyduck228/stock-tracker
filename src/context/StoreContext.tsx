import React, { createContext, useContext } from 'react';
import { useStore } from '../store';
import type { StoreType } from '../store';

const StoreContext = createContext<StoreType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useStore();
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStoreContext = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStoreContext must be used within a StoreProvider');
    }
    return context;
};
