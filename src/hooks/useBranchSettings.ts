import { useBusinessContext } from '../contexts/BusinessContext';

const useBranchSettings = () => {
  const context = useBusinessContext();

  return {
    branchSettings: context.branchSettings,
    branchSettingsLoading: context.branchSettingsLoading,
    branchSettingsError: context.branchSettingsError,
    refreshBranchSettings: context.refreshBranchSettings,
  };
};

export default useBranchSettings;
