"use client";

import React, { useState, useEffect } from 'react';
import { ruleService } from '@/services/api'; 
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import RulesTable from '@/components/tables/RulesTable';

interface Rule {
  id: string;
  title: string;
  content: string;
  language?:string;
  version?:string;
  createdAt: string;
  updatedAt: string;
}

interface RulesListProps {
}

export const RulesList: React.FC<RulesListProps> = ({  }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingRules, setDeletingRules] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const rulesData = await ruleService.findAllByProject();
      setRules(rulesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load rules');
      showErrorToast('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string, ruleName: string) => {
    if (window.confirm(`Are you sure you want to delete rule "${ruleName}"?`)) {
      try {
        setDeletingRules(prev => new Set(prev).add(ruleId));
        await ruleService.remove(ruleId);
        showSuccessToast('Rule deleted successfully');
        fetchRules();
      } catch (err: any) {
        showErrorToast(err.message || 'Failed to delete rule');
      } finally {
        setDeletingRules(prev => {
          const newSet = new Set(prev);
          newSet.delete(ruleId);
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
    <RulesTable
      rules={rules}
      // onEdit={handleEditRule}
      onDelete={handleDeleteRule}
      loading={loading}
      deletingRules={deletingRules}
    />
  );
};