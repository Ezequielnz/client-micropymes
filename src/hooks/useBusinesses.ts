import { useQuery } from '@tanstack/react-query';
import { businessAPI } from '../utils/api';
import type { Business, Branch, BranchSettings } from '../contexts/BusinessContext';

const toArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
};

export const businessKeys = {
  root: ['businesses'] as const,
  list: () => [...businessKeys.root, 'list'] as const,
  detail: (businessId: string | number) => [...businessKeys.root, String(businessId)] as const,
  branches: (businessId: string | number) => [...businessKeys.detail(businessId), 'branches'] as const,
  settings: (businessId: string | number) => [...businessKeys.detail(businessId), 'settings'] as const,
};

export const useBusinessesQuery = (enabled = true) =>
  useQuery<Business[], Error>({
    queryKey: businessKeys.list(),
    queryFn: async () => toArray<Business>(await businessAPI.getBusinesses()),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useBusinessBranchesQuery = (
  businessId: string | null | undefined,
  enabled = true
) =>
  useQuery<Branch[], Error>({
    queryKey: businessKeys.branches(businessId ?? 'unknown'),
    queryFn: async () => toArray<Branch>(await businessAPI.getBranches(businessId!)),
    enabled: Boolean(businessId) && enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useBusinessSettingsQuery = (
  businessId: string | null | undefined,
  enabled = true
) =>
  useQuery<BranchSettings | null, Error>({
    queryKey: businessKeys.settings(businessId ?? 'unknown'),
    queryFn: async () => (await businessAPI.getBranchSettings(businessId!)) ?? null,
    enabled: Boolean(businessId) && enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
