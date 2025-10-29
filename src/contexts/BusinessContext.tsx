/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

// TypeScript interfaces
interface Business {
  id: string;
  nombre: string;
  tipo?: string;
}

interface Branch {
  id: string;
  nombre: string;
  codigo?: string;
  direccion?: string | null;
  activo?: boolean;
  is_main?: boolean;
}

interface BusinessContextType {
  currentBusiness: Business | null;
  currentBranch: Branch | null;
  businesses: Business[];
  branches: Branch[];
  branchesLoading: boolean;
  branchError: string | null;
  handleBusinessChange: (business: Business) => void;
  handleBranchChange: (branch: Branch | null) => void;
  refreshBranches: (businessId?: string) => Promise<void>;
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
export type { Business, Branch, BusinessContextType }; 

