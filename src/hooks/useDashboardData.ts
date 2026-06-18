import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI } from '../utils/api';
import { type Business } from '../contexts/BusinessContext';

// TypeScript interfaces
export interface AlertItem {
  id: string;
  type: string;
  message: string;
  action_url: string;
}

export interface TodaySummary {
  sales_amount: number;
  sales_count: number;
  cash_position: number;
  pending_tasks: number;
}

export interface TrendPoint {
  date: string;
  amount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  current_stock: number;
  min_stock: number;
}

export interface InventoryHealth {
  top_selling: TopProduct[];
  low_stock: LowStockProduct[];
}

export interface DashboardSummaryData {
  status: 'healthy' | 'attention' | 'critical';
  alerts: AlertItem[];
  today_summary: TodaySummary;
  sales_trend: TrendPoint[];
  inventory_health: InventoryHealth;
}

export interface UseDashboardDataReturn {
  data: DashboardSummaryData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshData: () => void;
}

/**
 * Custom hook para manejar los datos del dashboard usando el nuevo endpoint unificado
 * @param {Business | null} currentBusiness - Negocio actual seleccionado
 * @returns {UseDashboardDataReturn} - Estado y funciones
 */
export const useDashboardData = (
  currentBusiness: Business | null
): UseDashboardDataReturn => {
  const queryClient = useQueryClient();
  const businessId = currentBusiness?.id;

  const {
    data: summaryData,
    error: summaryError,
    isLoading: summaryLoading,
    dataUpdatedAt: summaryUpdatedAt
  } = useQuery({
    queryKey: ['dashboard-summary', businessId],
    queryFn: () => dashboardAPI.getSummary(businessId!),
    enabled: !!businessId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const loading = summaryLoading;

  const error = useMemo(() => {
    return summaryError ? (summaryError as any).message || 'Error al cargar el resumen del dashboard' : null;
  }, [summaryError]);

  const lastUpdate = useMemo(() => {
    return summaryUpdatedAt ? new Date(summaryUpdatedAt) : null;
  }, [summaryUpdatedAt]);

  const refreshData = useCallback(() => {
    if (!businessId) return;
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary', businessId] });
  }, [businessId, queryClient]);

  return {
    data: summaryData as DashboardSummaryData || null,
    loading,
    error,
    lastUpdate,
    refreshData
  };
};
