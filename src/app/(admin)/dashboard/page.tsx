"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '@/context/ProjectContext';
import { useTenantAdmin } from '@/hooks/useTenantAdmin';
import {
    BoltIcon,
    BuildingOfficeIcon,
    FolderIcon,
    UserCircleIcon,
    SparklesIcon,
    PaperAirplaneIcon,
    ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import {
    DocumentDuplicateIcon,
    LanguageIcon,
    TagIcon,
    GlobeAltIcon as GlobeIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import Breadcrumb from '@/components/common/Breadcrumb';
import { dashboardService, DashboardStats, RecentActivity } from '@/services/api/dashboardService';

const DashboardPage: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const { selectedProjectId } = useProjects();
    const { isTenantAdmin } = useTenantAdmin();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/signin');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [statsData, activityData] = await Promise.all([
                    dashboardService.getStats(selectedProjectId || undefined),
                    dashboardService.getRecentActivity(selectedProjectId || undefined)
                ]);
                setStats(statsData);
                setRecentActivity(activityData);
                setError(null);
            } catch (err) {
                console.error('Detailed dashboard error:', err);
                setError('Error loading dashboard data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAuthenticated, router, selectedProjectId]);

    const quickActions = [
        {
            name: 'My Prompts',
            description: 'Manage your saved prompts',
            icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />,
            href: selectedProjectId ? `/projects/${selectedProjectId}/prompts` : '#',
            color: 'from-emerald-500 to-teal-600',
            bgPattern: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
        },
        {
            name: 'My Rules',
            description: 'Manage your saved rules',
            icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />,
            href: selectedProjectId ? `/projects/${selectedProjectId}/rules` : '#',
            color: 'from-emerald-500 to-teal-600',
            bgPattern: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
        },
        {
            name: 'Magic Assistant',
            description: 'Intelligent assistant for your prompts',
            icon: <SparklesIcon className="h-6 w-6" />,
            href: '/prompt-wizard',
            color: 'from-purple-500 to-violet-600',
            bgPattern: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
        },
        {
            name: 'Run Prompt',
            description: 'Execute a prompt in the current project',
            icon: <PaperAirplaneIcon className="h-6 w-6" />,
            href: '/serveprompt',
            color: 'from-blue-500 to-cyan-600',
            bgPattern: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
        },
        {
            name: 'Projects',
            description: 'Manage your projects',
            icon: <FolderIcon className="h-6 w-6" />,
            href: '/projects',
            color: 'from-orange-500 to-amber-600',
            bgPattern: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-transparent bg-gradient-to-r from-brand-500 to-purple-600 rounded-full"></div>
                    <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-brand-400 to-purple-500 opacity-30 blur-md"></div>
                    <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                        <SparklesIcon className="h-8 w-8 text-brand-500 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl relative overflow-hidden" role="alert">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 to-pink-100/20 dark:from-red-900/20 dark:to-pink-900/20"></div>
                    <div className="relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/20 dark:bg-brand-800/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/10 dark:bg-indigo-800/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Dashboard', href: '/dashboard' },
                    ]}
                />

                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
                            japm.app
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Your intelligent control center for
                        <span className="text-brand-600 dark:text-brand-400 font-semibold"> prompt mastery </span>
                    </p>
                </div>

                {!isTenantAdmin && (
                    <>
                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {stats && [
                                {
                                    name: 'Active Projects',
                                    value: stats.activeProjects.toString(),
                                    icon: <FolderIcon className="h-7 w-7" />,
                                    gradient: 'from-orange-500 to-amber-500',
                                    bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
                                },
                                {
                                    name: 'Executed Prompts',
                                    value: stats.executedPrompts.toString(),
                                    icon: <PaperAirplaneIcon className="h-7 w-7" />,
                                    gradient: 'from-blue-500 to-cyan-500',
                                    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
                                },
                                {
                                    name: 'Project AI Models',
                                    value: stats.activeModels.toString(),
                                    icon: <BoltIcon className="h-7 w-7" />,
                                    gradient: 'from-purple-500 to-violet-500',
                                    bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
                                },
                                {
                                    name: 'Tenant Active Users',
                                    value: stats.activeUsers.toString(),
                                    icon: <UserCircleIcon className="h-7 w-7" />,
                                    gradient: 'from-emerald-500 to-teal-500',
                                    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
                                },
                            ].map((stat, index) => (
                                <div
                                    key={stat.name}
                                    className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-brand-500/20 dark:hover:shadow-brand-400/20 group animate-fade-in-up`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Glassmorphism overlay */}
                                    <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl"></div>

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {stat.name}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`relative p-4 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-12`}>
                                            <div className="text-white">
                                                {stat.icon}
                                            </div>
                                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`}></div>
                                        </div>
                                    </div>

                                    {/* Animated border */}
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.gradient} opacity-20 animate-pulse`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Quick Actions */}
                        <div className="mb-12">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                                        Quick Actions
                                    </span>
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">Jump into action with these powerful tools</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={action.name}
                                        href={action.href}
                                        className={`group relative overflow-hidden ${action.bgPattern} backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up`}
                                        style={{ animationDelay: `${index * 150}ms` }}
                                        onClick={(e) => {
                                            if (action.href === '#') {
                                                e.preventDefault();
                                                return;
                                            }
                                        }}
                                    >
                                        {/* Glassmorphism overlay */}
                                        <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl"></div>

                                        <div className="relative">
                                            <div className={`inline-flex p-4 bg-gradient-to-br ${action.color} rounded-2xl shadow-lg mb-4 group-hover:shadow-xl transition-all duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                                                <div className="text-white">
                                                    {action.icon}
                                                </div>
                                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-300`}></div>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                                                {action.name}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                {action.description}
                                            </p>
                                        </div>

                                        {/* Hover effect border */}
                                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.color} opacity-20 animate-pulse`}></div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Enhanced Recent Activity */}
                <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
                            <ClockIcon className="h-8 w-8 text-brand-500 mr-3 animate-pulse" />
                            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                                Recent Activity
                            </span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">Stay updated with the latest actions in your workspace</p>
                    </div>
                    <div className="relative overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-purple-50/50 dark:from-brand-950/20 dark:to-purple-950/20"></div>

                        {recentActivity.length === 0 ? (
                            <div className="relative p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-6">
                                        <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full">
                                            <ClockIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-200/30 to-purple-200/30 dark:from-brand-800/30 dark:to-purple-800/30 rounded-full blur-xl animate-pulse"></div>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No recent activity</p>
                                    <p className="text-gray-500 dark:text-gray-500">Your actions will appear here as you work</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-sm">
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                Action
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                Details
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                Project
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm divide-y divide-gray-200/30 dark:divide-gray-700/30">
                                        {recentActivity.map((activity, index) => (
                                            <tr
                                                key={activity.id}
                                                className="hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-300 group animate-fade-in-up"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="relative p-2 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                                {activity.entityType === 'PROMPT' && <PaperAirplaneIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'AI_MODEL' && <BoltIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'PROJECT' && <FolderIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'PROMPT_ASSET' && <DocumentDuplicateIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'PROMPT_TRANSLATION' && <LanguageIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'ENVIRONMENT' && <BuildingOfficeIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'TAG' && <TagIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'REGION' && <GlobeIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'CULTURAL_DATA' && <AcademicCapIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                {activity.entityType === 'RAG_DOCUMENT' && <DocumentTextIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />}
                                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-200/50 to-purple-200/50 dark:from-brand-800/50 dark:to-purple-800/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                                                                {activity.userName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-brand-100 to-purple-100 dark:from-brand-900/50 dark:to-purple-900/50 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-700/50">
                                                            {activity.action.toLowerCase() === 'create' && 'Created'}
                                                            {activity.action.toLowerCase() === 'update' && 'Updated'}
                                                            {activity.action.toLowerCase() === 'delete' && 'Deleted'}
                                                            {activity.action.toLowerCase() === 'publish' && 'Published'}
                                                            {activity.action.toLowerCase() === 'unpublish' && 'Unpublished'}
                                                            {activity.action.toLowerCase() === 'approve' && 'Approved'}
                                                            {activity.action.toLowerCase() === 'reject' && 'Rejected'}
                                                        </span>
                                                        <span className="ml-2 text-gray-600 dark:text-gray-400 font-medium">
                                                            {activity.entityType.toLowerCase().replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        {activity.changes?.new && (
                                                            <div className="space-y-2">
                                                                {Object.entries(activity.changes.new)
                                                                    .filter(([key]) => !['tenantId', 'name', 'initialChangeMessage'].includes(key))
                                                                    .map(([key, value]) => (
                                                                        <div key={key} className="flex items-start">
                                                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 min-w-[80px]">
                                                                                {key}:
                                                                            </span>
                                                                            <span className="text-gray-600 dark:text-gray-400 ml-2 text-xs break-all">
                                                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50">
                                                            {activity.projectName || activity.projectId}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom styles for animations */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes gradient-x {
                    0%, 100% {
                        background-size: 200% 200%;
                        background-position: left center;
                    }
                    50% {
                        background-size: 200% 200%;
                        background-position: right center;
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-gradient-x {
                    animation: gradient-x 4s ease infinite;
                    background-size: 200% 200%;
                }
            `}</style>
        </div>
    );
};

export default DashboardPage; 