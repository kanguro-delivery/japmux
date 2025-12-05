"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import { ProjectRulesList } from '@/components/rules/ProjectRulesList';
import { useProjects } from '@/context/ProjectContext';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';

const ProjectRulesPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const { projects } = useProjects();
  const [projectName, setProjectName] = useState<string>(projectId);
  const [loading, setLoading] = useState<boolean>(true);

  // Find project details
  useEffect(() => {
    if (projects && projectId) {
      const currentProject = projects.find(p => p.description=== projectId);
      if (currentProject) {
        setProjectName(currentProject.name || projectId);
      }
      setLoading(false);
    }
  }, [projects, projectId]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    {
      label: loading ? "Loading..." : projectName,
      href: `/projects/${projectId}`
    },
    { label: "Rules" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-transparent bg-gradient-to-r from-brand-500 to-purple-600"></div>
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-brand-400 to-purple-500 opacity-30 blur-md"></div>
          <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
            <FolderIcon className="h-8 w-8 text-brand-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Rules for <span className="text-brand-600 dark:text-brand-400">{projectName}</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and organize your prompt rules for this project
              </p>
            </div>
            <Link
              href={`/projects/${projectId}/rules/new`}
              className="relative px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Create New Rule
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>

        {/* Rules list section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl"></div>
          
          <div className="relative p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-white/30 dark:border-gray-700/40 shadow-xl">
            <ProjectRulesList projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectRulesPage;