import { createContext, useContext } from 'react';

// TypeScript interfaces
interface Business {
  id: string;
  nombre: string;
  tipo?: string;
}

interface BusinessContextType {
  currentBusiness: Business | null;
  businesses: Business[];
  handleBusinessChange: (business: Business) => void;
}

// Business Context
const BusinessContext = createContext<BusinessContextType | null>(null);

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
};

export { BusinessContext };
export type { Business, BusinessContextType }; 