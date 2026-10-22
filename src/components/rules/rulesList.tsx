"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Rule, ruleService } from '@/services/api';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import RulesTable, { RulesViewMode } from '@/components/tables/RulesTable';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { Squares2X2Icon, TableCellsIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ALL_LANGUAGES = '__all__';

interface RulesListProps {
}

export const RulesList: React.FC<RulesListProps> = ({  }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingRules, setDeletingRules] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string>(ALL_LANGUAGES);
  const [viewMode, setViewMode] = useState<RulesViewMode>('card');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const languages = useMemo(() => {
    const set = new Set<string>();
    rules.forEach((rule) => {
      if (rule.language) {
        set.add(rule.language.toLowerCase());
      }
    });
    return Array.from(set).sort();
  }, [rules]);

  const filteredRules = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rules.filter((rule) => {
      const matchesLanguage =
        selectedLanguage === ALL_LANGUAGES || rule.language?.toLowerCase() === selectedLanguage;
      const matchesSearch = !query || rule.title.toLowerCase().includes(query);
      return matchesLanguage && matchesSearch;
    });
  }, [rules, selectedLanguage, searchTerm]);

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
      const message = getApiErrorMessage(err, "Failed to load rules.");
      setError(message);
      showErrorToast(message);
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
        showErrorToast(getApiErrorMessage(err, 'Failed to delete rule'));
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

  const tabBaseClass = 'flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm border';
  const tabActiveClass = 'bg-gradient-to-r from-brand-500 to-purple-500 text-white border-transparent shadow-lg';
  const tabInactiveClass = 'bg-white/40 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 border-white/30 dark:border-gray-700/40 hover:scale-105 hover:text-brand-600 dark:hover:text-brand-400';

  const renderLanguageTab = (value: string, label: string) => (
    <button
      key={value}
      onClick={() => setSelectedLanguage(value)}
      className={`${tabBaseClass} ${selectedLanguage === value ? tabActiveClass : tabInactiveClass}`}
    >
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Search box */}
      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search rules by title..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-gray-700/40 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all duration-300"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            aria-label="Clear search"
            title="Clear search"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters and view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Language tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {renderLanguageTab(ALL_LANGUAGES, 'All')}
          {languages.map((lang) => renderLanguageTab(lang, lang.toUpperCase()))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-gray-700/40">
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'card'
              ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            aria-label="Card view"
            title="Card view"
          >
            <Squares2X2Icon className="w-4 h-4" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'table'
              ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            aria-label="Table view"
            title="Table view"
          >
            <TableCellsIcon className="w-4 h-4" />
            <span>Table</span>
          </button>
        </div>
      </div>

      <RulesTable
        rules={filteredRules}
        onDelete={handleDeleteRule}
        loading={loading}
        deletingRules={deletingRules}
        viewMode={viewMode}
      />
    </div>
  );
};