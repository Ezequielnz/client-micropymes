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

interface BranchSettings {
  negocio_id: string;
  inventario_modo: 'centralizado' | 'por_sucursal';
  servicios_modo: 'centralizado' | 'por_sucursal';
  catalogo_producto_modo: 'compartido' | 'por_sucursal';
  permite_transferencias: boolean;
  transferencia_auto_confirma: boolean;
  default_branch_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

interface BusinessContextType {
  currentBusiness: Business | null;
  currentBranch: Branch | null;
  businesses: Business[];
  branches: Branch[];
  branchesLoading: boolean;
  branchError: string | null;
  branchSettings: BranchSettings | null;
  branchSettingsLoading: boolean;
  branchSettingsError: string | null;
  handleBusinessChange: (business: Business) => void;
  handleBranchChange: (branch: Branch | null) => void;
  refreshBranches: (businessId?: string) => Promise<void>;
  refreshBranchSettings: (businessId?: string) => Promise<void>;
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
export type { Business, Branch, BranchSettings, BusinessContextType }; 

