import React, { createContext, useReducer, useContext } from 'react';
import { wizardReducer, initialState, ACTIONS } from './wizardReducer';

const WizardContext = createContext();

export function WizardProvider({ children }) {
    const [state, dispatch] = useReducer(wizardReducer, initialState);

    return (
        <WizardContext.Provider value={{ state, dispatch, ACTIONS }}>
            {children}
        </WizardContext.Provider>
    );
}

export function useWizard() {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
}
