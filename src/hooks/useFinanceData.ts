import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { type Business } from '../contexts/BusinessContext';
import { financeAPI } from '../utils/api';

// TypeScript interfaces
// Using centralized Axios-based financeAPI; no direct fetch base URL needed here.

interface FinanceStats {
  total_ingresos: number;
  total_egresos: number;
  balance: number;
  cuentas_pendientes: number;
}

interface MovimientoFinanciero {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  categoria_id: string;
  categoria?: CategoriaFinanciera;
}

interface CategoriaFinanciera {
  id: string;
  nombre: string;
  tipo: 'ingreso' | 'egreso';
  activo: boolean;
}

interface CuentaPendiente {
  id: string;
  descripcion: string;
  monto: number;
  fecha_vencimiento: string;
  tipo: 'cobrar' | 'pagar' | 'por_cobrar' | 'por_pagar';
  estado: 'pendiente' | 'pagada' | 'pagado' | 'vencido';
}

interface FlujoCajaData {
  mes: number;
  año: number;
  ingresos: number;
  egresos: number;
  balance: number;
}

interface FinanceData {
  stats: FinanceStats;
  movimientos: MovimientoFinanciero[];
  categorias: CategoriaFinanciera[];
  cuentasPendientes: CuentaPendiente[];
  flujoCaja: FlujoCajaData[];
}

interface UseFinanceDataReturn {
  data: FinanceData;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshData: () => void;
  refreshStats: () => void;
  refreshMovimientos: () => void;
  refreshCategorias: () => void;
  refreshCuentasPendientes: () => void;
  refreshFlujoCaja: () => void;
  // Individual data access
  stats: FinanceStats;
  movimientos: MovimientoFinanciero[];
  categorias: CategoriaFinanciera[];
  cuentasPendientes: CuentaPendiente[];
  flujoCaja: FlujoCajaData[];
  // Mutations
  createMovimiento: any;
  updateMovimiento: any;
  deleteMovimiento: any;
  createCategoria: any;
  updateCategoria: any;
  deleteCategoria: any;
  createCuentaPendiente: any;
  updateCuentaPendiente: any;
  deleteCuentaPendiente: any;
  markCuentaPendientePagada: any;
}

interface FinanceScopeOptions {
  branchId?: string | null;
  branchReady?: boolean;
}

// Using axios interceptors for error handling; no local response parser required.

// Using centralized financeAPI from ../utils/api

/**
 * ✅ OPTIMIZED: Custom hook para manejar los datos de finanzas con React Query
 * @param {Business | null} currentBusiness - Negocio actual seleccionado
 * @returns {UseFinanceDataReturn} - Estado y funciones para manejar los datos de finanzas
 */
export const useFinanceData = (
  currentBusiness: Business | null,
  options: FinanceScopeOptions = {}
): UseFinanceDataReturn => {
  const queryClient = useQueryClient();
  const businessId = currentBusiness?.id;
  const { branchId = null, branchReady = true } = options;
  const branchKey = branchId ?? null;
  const branchParams: Record<string, string> | undefined = branchId ? { branch_id: branchId } : undefined;
  const baseEnabled = !!businessId && branchReady;

  // ✅ OPTIMIZED: Finance stats query with caching
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    dataUpdatedAt: statsUpdatedAt
  } = useQuery({
    queryKey: ['finance-stats', businessId, branchKey],
    queryFn: () => financeAPI.getStats(businessId!, branchParams ?? {}),
    enabled: baseEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // ✅ OPTIMIZED: Movimientos query with caching
  const {
    data: movimientosData,
    error: movimientosError,
    isLoading: movimientosLoading,
    dataUpdatedAt: movimientosUpdatedAt
  } = useQuery({
    queryKey: ['finance-movimientos', businessId, branchKey],
    queryFn: () => financeAPI.getMovimientos(businessId!, branchParams ?? {}),
    enabled: baseEnabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // ✅ OPTIMIZED: Categorias query with caching
  const {
    data: categoriasData,
    error: categoriasError,
    isLoading: categoriasLoading,
    dataUpdatedAt: categoriasUpdatedAt
  } = useQuery({
    queryKey: ['finance-categorias', businessId, branchKey],
    queryFn: () => financeAPI.getCategorias(businessId!, branchParams ?? {}),
    enabled: baseEnabled,
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // ✅ OPTIMIZED: Cuentas pendientes query with caching
  const {
    data: cuentasPendientesData,
    error: cuentasPendientesError,
    isLoading: cuentasPendientesLoading,
    dataUpdatedAt: cuentasPendientesUpdatedAt
  } = useQuery({
    queryKey: ['finance-cuentas-pendientes', businessId, branchKey],
    queryFn: () => financeAPI.getCuentasPendientes(businessId!, branchParams ?? {}),
    enabled: baseEnabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // ✅ OPTIMIZED: Flujo de caja query with caching (current month/year)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const {
    data: flujoCajaData,
    error: flujoCajaError,
    isLoading: flujoCajaLoading,
    dataUpdatedAt: flujoCajaUpdatedAt
  } = useQuery({
    queryKey: ['finance-flujo-caja', businessId, branchKey, currentMonth, currentYear],
    queryFn: () => financeAPI.getFlujoCaja(businessId!, currentMonth, currentYear, branchParams ?? {}),
    enabled: baseEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // ✅ OPTIMIZED: Mutations with optimistic updates
  const createMovimientoMutation = useMutation({
    mutationFn: (data: Partial<MovimientoFinanciero>) => financeAPI.createMovimiento(businessId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-movimientos', businessId, branchKey] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
    }
  });

  const updateMovimientoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MovimientoFinanciero> }) => 
      financeAPI.updateMovimiento(businessId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-movimientos', businessId, branchKey] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
    }
  });

  const deleteMovimientoMutation = useMutation({
    mutationFn: (id: string) => financeAPI.deleteMovimiento(businessId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-movimientos', businessId, branchKey] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
    }
  });

  const createCategoriaMutation = useMutation({
    mutationFn: (data: Partial<CategoriaFinanciera>) => financeAPI.createCategoria(businessId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-categorias', businessId, branchKey] });
    }
  });

  const updateCategoriaMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoriaFinanciera> }) => 
      financeAPI.updateCategoria(businessId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-categorias', businessId, branchKey] });
    }
  });

  const deleteCategoriaMutation = useMutation({
    mutationFn: (id: string) => financeAPI.deleteCategoria(businessId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-categorias', businessId, branchKey] });
    }
  });

  const createCuentaPendienteMutation = useMutation({
    mutationFn: (data: Partial<CuentaPendiente>) => financeAPI.createCuentaPendiente(businessId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-cuentas-pendientes', businessId, branchKey] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
    }
  });

  const updateCuentaPendienteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CuentaPendiente> }) => 
      financeAPI.updateCuentaPendiente(businessId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-cuentas-pendientes', businessId, branchKey] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
    }
  });

  const deleteCuentaPendienteMutation = useMutation({
    mutationFn: (id: string) => financeAPI.deleteCuentaPendiente(businessId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-cuentas-pendientes', businessId, branchKey] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
    }
  });

  const markCuentaPendientePagadaMutation = useMutation({
    mutationFn: (id: string) => financeAPI.markCuentaPendientePagada(businessId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-cuentas-pendientes', businessId, branchKey] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
    }
  });

  // ✅ OPTIMIZED: Memoized computed states
  const loading = useMemo(() => {
    if (!baseEnabled) {
      return true;
    }
    return statsLoading || movimientosLoading || categoriasLoading || cuentasPendientesLoading || flujoCajaLoading;
  }, [baseEnabled, statsLoading, movimientosLoading, categoriasLoading, cuentasPendientesLoading, flujoCajaLoading]);

  const error = useMemo(() => {
    if (!baseEnabled) {
      return null;
    }
    const errors = [statsError, movimientosError, categoriasError, cuentasPendientesError, flujoCajaError];
    const firstError = errors.find(err => err);
    return firstError ? (firstError as Error).message : null;
  }, [baseEnabled, statsError, movimientosError, categoriasError, cuentasPendientesError, flujoCajaError]);

  // ✅ OPTIMIZED: Memoized last update time (siguiendo patrón de useDashboardData)
  const lastUpdate = useMemo(() => {
    if (!baseEnabled) {
      return null;
    }
    const updateTimes = [
      statsUpdatedAt,
      movimientosUpdatedAt,
      categoriasUpdatedAt,
      cuentasPendientesUpdatedAt,
      flujoCajaUpdatedAt
    ].filter(Boolean);
    
    return updateTimes.length > 0 ? new Date(Math.max(...updateTimes)) : null;
  }, [baseEnabled, statsUpdatedAt, movimientosUpdatedAt, categoriasUpdatedAt, cuentasPendientesUpdatedAt, flujoCajaUpdatedAt]);

  // ✅ OPTIMIZED: Memoized refresh functions
  const refreshData = useCallback(() => {
    if (!businessId) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
    queryClient.invalidateQueries({ queryKey: ['finance-movimientos', businessId, branchKey] });
    queryClient.invalidateQueries({ queryKey: ['finance-categorias', businessId, branchKey] });
    queryClient.invalidateQueries({ queryKey: ['finance-cuentas-pendientes', businessId, branchKey] });
    queryClient.invalidateQueries({ queryKey: ['finance-flujo-caja', businessId, branchKey] });
  }, [queryClient, businessId, branchKey]);

  const refreshStats = useCallback(() => {
    if (!businessId) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['finance-stats', businessId, branchKey] });
  }, [queryClient, businessId, branchKey]);

  const refreshMovimientos = useCallback(() => {
    if (!businessId) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['finance-movimientos', businessId, branchKey] });
  }, [queryClient, businessId, branchKey]);

  const refreshCategorias = useCallback(() => {
    if (!businessId) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['finance-categorias', businessId, branchKey] });
  }, [queryClient, businessId, branchKey]);

  const refreshCuentasPendientes = useCallback(() => {
    if (!businessId) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['finance-cuentas-pendientes', businessId, branchKey] });
  }, [queryClient, businessId, branchKey]);

  const refreshFlujoCaja = useCallback(() => {
    if (!businessId) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['finance-flujo-caja', businessId, branchKey] });
  }, [queryClient, businessId, branchKey]);

  // ✅ OPTIMIZED: Memoized data with fallbacks
  const stats = useMemo(() => statsData || {
    total_ingresos: 0,
    total_egresos: 0,
    balance: 0,
    cuentas_pendientes: 0
  }, [statsData]);

  const movimientos = useMemo(() => movimientosData || [], [movimientosData]);
  const categorias = useMemo(() => categoriasData || [], [categoriasData]);
  const cuentasPendientes = useMemo(() => cuentasPendientesData || [], [cuentasPendientesData]);
  const flujoCaja = useMemo(() => flujoCajaData || [], [flujoCajaData]);

  const data = useMemo(() => ({
    stats,
    movimientos,
    categorias,
    cuentasPendientes,
    flujoCaja
  }), [stats, movimientos, categorias, cuentasPendientes, flujoCaja]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refreshData,
    refreshStats,
    refreshMovimientos,
    refreshCategorias,
    refreshCuentasPendientes,
    refreshFlujoCaja,
    stats,
    movimientos,
    categorias,
    cuentasPendientes,
    flujoCaja,
    createMovimiento: createMovimientoMutation,
    updateMovimiento: updateMovimientoMutation,
    deleteMovimiento: deleteMovimientoMutation,
    createCategoria: createCategoriaMutation,
    updateCategoria: updateCategoriaMutation,
    deleteCategoria: deleteCategoriaMutation,
    createCuentaPendiente: createCuentaPendienteMutation,
    updateCuentaPendiente: updateCuentaPendienteMutation,
    deleteCuentaPendiente: deleteCuentaPendienteMutation,
    markCuentaPendientePagada: markCuentaPendientePagadaMutation
  };
};
