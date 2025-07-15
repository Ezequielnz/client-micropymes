import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { salesAPI, tasksAPI, productAPI, customerAPI } from '../utils/api';
import { type Business } from '../contexts/BusinessContext';

// TypeScript interfaces
interface DashboardStats {
  total_sales: number;
  estimated_profit: number;
  new_customers: number;
}

interface TopItem {
  nombre: string;
  cantidad_total: number;
  precio_venta?: number;
}

interface RecentSale {
  id: string;
  total: number;
  fecha_venta: string;
}

interface Product {
  id: string;
  nombre: string;
  precio_venta: number;
  [key: string]: any; // Allow additional properties
}

interface Customer {
  id: string;
  nombre: string;
  email?: string;
  [key: string]: any; // Allow additional properties
}

interface TaskStats {
  total: number;
  pendientes: number;
  completadas: number;
  en_progreso: number;
}

interface DashboardData {
  stats: DashboardStats;
  topItems: TopItem[];
  recentSales: RecentSale[];
  products: Product[];
  customers: Customer[];
  taskStats: TaskStats;
}

// API Response interfaces
interface ApiStatsResponse {
  today?: DashboardStats;
  week?: DashboardStats;
  month?: DashboardStats;
  top_items?: TopItem[];
  [key: string]: any;
}

interface UseDashboardDataReturn {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshData: () => void;
  updateData: (key: keyof DashboardData, value: any) => void;
  stats: DashboardStats;
  topItems: TopItem[];
  recentSales: RecentSale[];
  products: Product[];
  customers: Customer[];
  taskStats: TaskStats;
}

/**
 * ✅ OPTIMIZED: Custom hook para manejar los datos del dashboard con React Query
 * @param {Business | null} currentBusiness - Negocio actual seleccionado
 * @param {string} selectedPeriod - Período seleccionado (today, week, month)
 * @returns {UseDashboardDataReturn} - Estado y funciones para manejar los datos del dashboard
 */
export const useDashboardData = (
  currentBusiness: Business | null, 
  selectedPeriod: string
): UseDashboardDataReturn => {
  const queryClient = useQueryClient();
  const businessId = currentBusiness?.id;

  // ✅ OPTIMIZED: Dashboard stats query with period-specific caching
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    dataUpdatedAt: statsUpdatedAt
  } = useQuery({
    queryKey: ['dashboard-stats', businessId, selectedPeriod],
    queryFn: () => salesAPI.getDashboardStatsV2(businessId!),
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // ✅ OPTIMIZED: Recent sales query with shorter cache
  const {
    data: recentSalesData,
    error: recentSalesError,
    isLoading: recentSalesLoading,
    dataUpdatedAt: recentSalesUpdatedAt
  } = useQuery({
    queryKey: ['recent-sales', businessId],
    queryFn: () => salesAPI.getRecentSales(businessId!),
    enabled: !!businessId,
    staleTime: 1 * 60 * 1000, // 1 minute - sales change frequently
    gcTime: 3 * 60 * 1000, // 3 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // ✅ OPTIMIZED: Task stats query
  const {
    data: taskStatsData,
    error: taskStatsError,
    isLoading: taskStatsLoading,
    dataUpdatedAt: taskStatsUpdatedAt
  } = useQuery({
    queryKey: ['task-stats', businessId],
    queryFn: () => tasksAPI.getTaskStats(businessId!),
    enabled: !!businessId,
    staleTime: 3 * 60 * 1000, // 3 minutes - task stats change moderately
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // ✅ OPTIMIZED: Products query with longer cache
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
    dataUpdatedAt: productsUpdatedAt
  } = useQuery({
    queryKey: ['products', businessId],
    queryFn: () => productAPI.getProducts(businessId!),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes - products change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // ✅ OPTIMIZED: Customers query with longer cache
  const {
    data: customersData,
    error: customersError,
    isLoading: customersLoading,
    dataUpdatedAt: customersUpdatedAt
  } = useQuery({
    queryKey: ['customers', businessId],
    queryFn: () => customerAPI.getCustomers(businessId!),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes - customers change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // ✅ OPTIMIZED: Memoized computed values
  const data = useMemo((): DashboardData => {
    const defaultStats = {
      total_sales: 0,
      estimated_profit: 0,
      new_customers: 0
    };

    const defaultTaskStats = {
      total: 0,
      pendientes: 0,
      completadas: 0,
      en_progreso: 0
    };

    // Safely extract stats for the selected period
    const periodStats = statsData && typeof statsData === 'object' 
      ? (statsData as ApiStatsResponse)[selectedPeriod as keyof ApiStatsResponse] as DashboardStats
      : null;

    return {
      stats: periodStats || defaultStats,
      topItems: (statsData as ApiStatsResponse)?.top_items || [],
      recentSales: Array.isArray(recentSalesData) ? recentSalesData.slice(0, 5) : [],
      products: Array.isArray(productsData) ? (productsData as Product[]) : [],
      customers: Array.isArray(customersData) ? (customersData as Customer[]) : [],
      taskStats: taskStatsData as TaskStats || defaultTaskStats
    };
  }, [statsData, selectedPeriod, recentSalesData, productsData, customersData, taskStatsData]);

  // ✅ OPTIMIZED: Memoized loading state
  const loading = useMemo(() => {
    return statsLoading || recentSalesLoading || taskStatsLoading || productsLoading || customersLoading;
  }, [statsLoading, recentSalesLoading, taskStatsLoading, productsLoading, customersLoading]);

  // ✅ OPTIMIZED: Memoized error state
  const error = useMemo(() => {
    const errors = [statsError, recentSalesError, taskStatsError, productsError, customersError];
    const firstError = errors.find(err => err);
    return firstError ? (firstError as any).message || 'Error al cargar los datos del dashboard' : null;
  }, [statsError, recentSalesError, taskStatsError, productsError, customersError]);

  // ✅ OPTIMIZED: Memoized last update time
  const lastUpdate = useMemo(() => {
    const updateTimes = [
      statsUpdatedAt,
      recentSalesUpdatedAt,
      taskStatsUpdatedAt,
      productsUpdatedAt,
      customersUpdatedAt
    ].filter(Boolean);
    
    return updateTimes.length > 0 ? new Date(Math.max(...updateTimes)) : null;
  }, [statsUpdatedAt, recentSalesUpdatedAt, taskStatsUpdatedAt, productsUpdatedAt, customersUpdatedAt]);

  // ✅ OPTIMIZED: Memoized refresh function using React Query invalidation
  const refreshData = useCallback(() => {
    if (!businessId) return;
    
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
    queryClient.invalidateQueries({ queryKey: ['recent-sales', businessId] });
    queryClient.invalidateQueries({ queryKey: ['task-stats', businessId] });
    queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
  }, [businessId, queryClient]);

  // ✅ OPTIMIZED: Memoized update function (for backward compatibility)
  const updateData = useCallback((_key: keyof DashboardData, _value: any) => {
    // With React Query, we typically don't need manual updates
    // But we keep this for backward compatibility
    console.warn('updateData is deprecated with React Query. Use mutations instead.');
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refreshData,
    updateData,
    // Getters convenientes para acceder a datos específicos
    stats: data.stats,
    topItems: data.topItems,
    recentSales: data.recentSales,
    products: data.products,
    customers: data.customers,
    taskStats: data.taskStats
  };
}; 