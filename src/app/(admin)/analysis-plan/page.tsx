"use client";

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import { RulesList } from '@/components/rules/rulesList';
import { PlusIcon } from '@heroicons/react/24/outline';

const analysisPlanPage: React.FC = () => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Analysis Plan" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/20 dark:bg-brand-800/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <Breadcrumb crumbs={breadcrumbs} />

        {/* Header section */}
         <div className="mb-8">
          <div className="flex justify-between items-center">
            <Link
              href={`/analysis-plan/new`}
              className="relative px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Create New Analysis Plan
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div> 

       
        
        
      </div>
    </div>
  );
};

export default analysisPlanPage;