"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    promptAssetService,
    projectService,
    promptService,
} from '@/services/api';
import { PromptAssetData } from '@/components/tables/PromptAssetsTable';
import PromptAssetsTable from '@/components/tables/PromptAssetsTable';
import Breadcrumb, { Crumb } from '@/components/common/PageBreadCrumb';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CreateProjectDto, UpdatePromptDto, CreatePromptDto } from '@/services/generated';

// Tipo personalizado para un prompt existente con id
type PromptWithId = CreatePromptDto & { id: string };

const getApiErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.isAxiosError && axiosError.response && axiosError.response.data && axiosError.response.data.message) {
            return axiosError.response.data.message;
        }
        return error.message;
    }
    return defaultMessage;
};

const PromptAssetsListPage: React.FC = () => {
    const [assets, setAssets] = useState<PromptAssetData[]>([]);
    const [project, setProject] = useState<CreateProjectDto | null>(null);
    const [currentPrompt, setCurrentPrompt] = useState<PromptWithId | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [breadcrumbLoading, setBreadcrumbLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const router = useRouter();

    // Usar projectId consistentemente
    const projectId = params.projectId as string;
    const promptId = params.promptId as string;

    console.log("DEBUG: assets/page.tsx - projectId from URL:", projectId);
    console.log("DEBUG: assets/page.tsx - promptId from URL:", promptId);

    const fetchPageData = useCallback(async () => {
        if (!projectId || !promptId) { // Actualizado
            setError("Project ID or Prompt ID is missing from URL.");
            setLoading(false);
            setBreadcrumbLoading(false);
            return;
        }
        setLoading(true);
        setBreadcrumbLoading(true);
        setError(null);

        try {
            // Usar projectId para las llamadas
            const projectDataPromise = projectService.findOne(projectId);
            const promptDataPromise = promptService.findOne(projectId, promptId);
            const assetDataPromise = promptAssetService.findAll(projectId, promptId);

            const [projectData, promptData, assetData] = await Promise.all([
                projectDataPromise,
                promptDataPromise,
                assetDataPromise
            ]);

            setProject(projectData);
            setCurrentPrompt(promptData);
            setAssets(assetData);

        } catch (err) {
            console.error("Error fetching prompt assets or breadcrumb data:", err);
            const apiErrorMessage = getApiErrorMessage(err, "Failed to load page data.");
            showErrorToast(apiErrorMessage);
            setError(apiErrorMessage);
        } finally {
            setLoading(false);
            setBreadcrumbLoading(false);
        }
    }, [projectId, promptId]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const handleEditAsset = (asset: PromptAssetData) => {
        // console.log("Edit asset:", asset);
        router.push(`/projects/${projectId}/prompts/${promptId}/assets/${asset.key}/edit`);
        // showErrorToast("Edit functionality for assets not yet implemented on this page."); // Comentado o eliminado
    };

    const handleDeleteAsset = async (assetKey: string) => {
        if (!projectId || !promptId) return; // Actualizado
        if (window.confirm(`Are you sure you want to delete asset "${assetKey}"? This action cannot be undone.`)) {
            setLoading(true);
            try {
                // Usar projectId para la llamada
                await promptAssetService.remove(projectId, promptId, assetKey);
                showSuccessToast(`Asset ${assetKey} deleted successfully.`);
                await fetchPageData();
            } catch (err) {
                const apiErrorMessage = getApiErrorMessage(err, "Failed to delete asset.");
                showErrorToast(apiErrorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const breadcrumbs: Crumb[] = [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
    ];
    if (projectId) { // Actualizado
        breadcrumbs.push({
            label: breadcrumbLoading ? projectId : (project?.name || projectId), // Actualizado
            href: `/projects/${projectId}/prompts` // Actualizado
        });
    }
    if (promptId) {
        breadcrumbs.push({
            label: breadcrumbLoading ? promptId : (currentPrompt?.name || currentPrompt?.id || promptId),
            href: `/projects/${projectId}/prompts/${promptId}` // Actualizado
        });
        breadcrumbs.push({ label: "Assets" });
    }

    if (error && !loading) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="relative min-h-screen">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-200/10 dark:bg-brand-800/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-200/10 dark:bg-purple-800/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative">
                <Breadcrumb crumbs={breadcrumbs} />

                {/* Header section with glassmorphism */}
                <div className="my-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-white/30 to-white/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 backdrop-blur-xl rounded-2xl"></div>
                        <div className="relative p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/40 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-8">
                                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                        Assets for: <span className="text-indigo-600 dark:text-indigo-400">{breadcrumbLoading ? promptId : (currentPrompt?.name || promptId)}</span>
                                    </h1>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">
                                        Manage reusable text components and variables for this prompt. Assets can be versioned, translated, and referenced within prompt templates.
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Link
                                        href={`/projects/${projectId}/prompts/${promptId}/assets/new`}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 inline-flex items-center"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Create New Asset
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content with glassmorphism */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl"></div>

                    <div className="relative p-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-white/30 dark:border-gray-700/40 shadow-xl">
                        {/* Error message with glassmorphism */}
                        {error && !loading && (
                            <div className="mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-red-50/40 to-red-50/60 dark:from-red-900/60 dark:via-red-900/40 dark:to-red-900/60 backdrop-blur-xl rounded-2xl"></div>
                                    <div className="relative p-4 bg-red-50/30 dark:bg-red-900/30 backdrop-blur-sm rounded-2xl border border-red-200/30 dark:border-red-700/40 shadow-lg">
                                        <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading state with glassmorphism */}
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl"></div>
                                    <div className="relative p-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-white/30 dark:border-gray-700/40 shadow-lg">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                                        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading assets...</p>
                                    </div>
                                </div>
                            </div>
                        ) : assets.length === 0 ? (
                            /* Empty state with glassmorphism */
                            <div className="text-center py-16">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl"></div>
                                    <div className="relative p-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-white/30 dark:border-gray-700/40 shadow-lg">
                                        <div className="mb-6">
                                            <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl inline-block">
                                                <PlusIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                            No Assets Found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                            Assets are reusable text components that can be shared across prompt versions. Create your first asset to get started.
                                        </p>
                                        <Link
                                            href={`/projects/${projectId}/prompts/${promptId}/assets/new`}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 inline-flex items-center"
                                        >
                                            <PlusIcon className="h-5 w-5 mr-2" />
                                            Create First Asset
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Table section with glassmorphism container */
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/40 dark:from-gray-800/40 dark:via-gray-700/20 dark:to-gray-800/40 backdrop-blur-sm rounded-2xl"></div>
                                <PromptAssetsTable
                                    promptAssets={assets}
                                    projectId={projectId}
                                    promptId={promptId}
                                    onEdit={handleEditAsset}
                                    onDelete={handleDeleteAsset}
                                    loading={loading}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptAssetsListPage; 