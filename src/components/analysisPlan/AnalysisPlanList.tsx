"use client";

import React, { useState, useEffect } from 'react';
import { AnalysisPlan, analysisPlanService } from '@/services/api'; 
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import AnalysisPlanTable from '../tables/AnalysisPlanTable';


interface AnalysisPlanListProps {
}

export const AnalysisPlanList: React.FC<AnalysisPlanListProps> = ({  }) => {
  const [ analysisPlans, setAnalysisPlans] = useState<AnalysisPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAnalysisPlans, setDeletingAnalysisPlans] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnalysisPlans();
  }, []);

  const fetchAnalysisPlans = async () => {
    try {
      setLoading(true);
      const analysisPlansData = await analysisPlanService.findAllByProject();
      setAnalysisPlans(analysisPlansData);
      setError(null);
    } catch (err: any) {
      getApiErrorMessage(err, "Failed to load rules.")
      showErrorToast('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnalysisPlans= async (analysisPlanId: string, analysisPlanName: string) => {
    if (window.confirm(`Are you sure you want to delete analysisPlan "${analysisPlanName}"?`)) {
      try {
        setDeletingAnalysisPlans(prev => new Set(prev).add(analysisPlanId));
        await analysisPlanService.remove(analysisPlanId);
        showSuccessToast('Rule deleted successfully');
        fetchAnalysisPlans();
      } catch (err: any) {
        showErrorToast(getApiErrorMessage(err, 'Failed to delete analysisPlanId'));
      } finally {
        setDeletingAnalysisPlans(prev => {
          const newSet = new Set(prev);
          newSet.delete(analysisPlanId);
          return newSet;
        });
      }
    }
  };


  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 mx-auto mb-4 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading rules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-red-50/40 to-red-50/60 dark:from-red-900/60 dark:via-red-900/40 dark:to-red-900/60 backdrop-blur-xl rounded-2xl"></div>
          <div className="relative p-8 bg-red-50/30 dark:bg-red-900/30 backdrop-blur-sm rounded-2xl border border-red-200/30 dark:border-red-700/40 shadow-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnalysisPlanTable
      analysisPlanes={analysisPlans}
      // onEdit={handleEditRule}
      onDelete={handleDeleteAnalysisPlans}
      loading={loading}
      deletingAnalysisPlans={deletingAnalysisPlans}
    />
  );
};