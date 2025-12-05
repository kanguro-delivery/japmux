"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    CreateProjectDto,
    CreatePromptAssetVersionDto,
    UpdatePromptAssetVersionDto,
    CreatePromptDto,
} from '@/services/generated/api';
import {
    promptAssetService,
    projectService,
    promptService,
} from '@/services/api';
import Breadcrumb, { Crumb } from '@/components/common/PageBreadCrumb';
import PromptAssetVersionsTable from '@/components/tables/PromptAssetVersionsTable';
import PromptAssetVersionForm from '@/components/form/PromptAssetVersionForm';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import axios from 'axios';
import { PromptAssetData } from '@/components/tables/PromptAssetsTable';

const getApiErrorMessage = (error: unknown, defaultMessage: string): string => {
    if ((axios as any).isAxiosError && (axios as any).isAxiosError(error)) {
        return (error as any).response?.data?.message || (error as any).message || defaultMessage;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return defaultMessage;
};

export interface AssetVersionUIData extends CreatePromptAssetVersionDto {
    id: string;
    versionTag: string;
    createdAt?: string;
}

const getLatestAssetVersionTag = (versions: AssetVersionUIData[]): string | null => {
    if (!versions || versions.length === 0) return null;
    const sorted = [...versions].sort((a, b) => {
        const tagA = a.versionTag?.startsWith('v') ? a.versionTag.substring(1) : a.versionTag;
        const tagB = b.versionTag?.startsWith('v') ? b.versionTag.substring(1) : b.versionTag;
        return (tagB || '').localeCompare(tagA || '');
    });
    return sorted[0].versionTag || null;
};

const PromptAssetVersionsPage: React.FC = () => {
    const [itemsList, setItemsList] = useState<AssetVersionUIData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<AssetVersionUIData | null>(null);
    const [latestVersionTagForForm, setLatestVersionTagForForm] = useState<string | null>(null);

    const [project, setProject] = useState<CreateProjectDto | null>(null);
    const [currentPrompt, setCurrentPrompt] = useState<CreatePromptDto | null>(null);
    const [asset, setAsset] = useState<PromptAssetData | null>(null);
    const [breadcrumbLoading, setBreadcrumbLoading] = useState<boolean>(true);

    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const promptId = params.promptId as string;
    const assetKey = params.assetKey as string;

    useEffect(() => {
        if (!projectId || !promptId || !assetKey) return;
        setBreadcrumbLoading(true);
        Promise.all([
            projectService.findOne(projectId),
            promptService.findOne(projectId, promptId),
            promptAssetService.findOne(projectId, promptId, assetKey)
        ]).then(([projectData, promptData, assetData]) => {
            setProject(projectData as CreateProjectDto);
            setCurrentPrompt(promptData as CreatePromptDto);
            setAsset(assetData as PromptAssetData);
        }).catch(err => {
            console.error("Error fetching breadcrumb data (project/prompt/asset):", err);
            const defaultMsg = "Failed to load project, prompt, or asset details for breadcrumbs.";
            showErrorToast(getApiErrorMessage(err, defaultMsg));
            setProject(null);
            setCurrentPrompt(null);
            setAsset(null);
        }).finally(() => {
            setBreadcrumbLoading(false);
        });
    }, [projectId, promptId, assetKey]);

    const fetchData = useCallback(async () => {
        if (!projectId || !promptId || !assetKey) {
            setError("Project ID, Prompt ID, or Asset Key is missing.");
            setLoading(false);
            setItemsList([]);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const data = await promptAssetService.findVersions(projectId, promptId, assetKey);
            if (Array.isArray(data)) {
                const versionsData = data.map(v => ({
                    ...v,
                    id: typeof v.versionTag === 'string' ? v.versionTag : String(Date.now() + Math.random()),
                    versionTag: typeof v.versionTag === 'string' ? v.versionTag : 'N/A',
                })) as AssetVersionUIData[];
                setItemsList(versionsData);
                const latestTag = getLatestAssetVersionTag(versionsData);
                setLatestVersionTagForForm(latestTag);
            } else {
                console.error("API response for asset versions is not an array:", data);
                setError('Received invalid data format for asset versions.');
                setItemsList([]);
                setLatestVersionTagForForm(null);
            }
        } catch (err: unknown) {
            console.error("Error fetching asset versions:", err);
            setError(getApiErrorMessage(err, 'Failed to fetch asset versions.'));
            setItemsList([]);
            setLatestVersionTagForForm(null);
        } finally {
            setLoading(false);
        }
    }, [projectId, promptId, assetKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: AssetVersionUIData) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (versionTagToDelete: string) => {
        if (!projectId || !promptId || !assetKey) return;
        if (window.confirm(`Are you sure you want to delete version "${versionTagToDelete}" for asset "${asset?.name || assetKey}"?`)) {
            setLoading(true);
            try {
                await promptAssetService.removeVersion(projectId, promptId, assetKey, versionTagToDelete);
                showSuccessToast(`Version ${versionTagToDelete} deleted successfully!`);
                fetchData();
            } catch (err: unknown) {
                setError(getApiErrorMessage(err, 'Failed to delete version.'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async (payload: CreatePromptAssetVersionDto | UpdatePromptAssetVersionDto) => {
        if (!projectId || !promptId || !assetKey) return;
        setLoading(true);
        try {
            let message = "";
            if (editingItem && editingItem.versionTag && editingItem.versionTag !== 'N/A') {
                await promptAssetService.updateVersion(projectId, promptId, assetKey, editingItem.versionTag, payload as UpdatePromptAssetVersionDto);
                message = `Version ${editingItem.versionTag} updated successfully!`;
            } else {
                const createPayload = payload as CreatePromptAssetVersionDto;
                if (!createPayload.versionTag) {
                    showErrorToast("Version Tag is required for new versions.");
                    setLoading(false);
                    return;
                }
                await promptAssetService.createVersion(projectId, promptId, assetKey, createPayload);
                message = "New version created successfully!";
            }
            setIsModalOpen(false);
            showSuccessToast(message);
            fetchData();
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to save version.'));
        } finally {
            setLoading(false);
        }
    };

    // handleViewTranslations removed - not used in current UI

    const breadcrumbs: Crumb[] = [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
    ];
    if (projectId) {
        breadcrumbs.push({
            label: breadcrumbLoading ? projectId : (project?.name || projectId),
            href: `/projects/${projectId}/prompts`
        });
    }
    if (promptId) {
        breadcrumbs.push({
            label: breadcrumbLoading ? promptId : (currentPrompt?.name || promptId),
            href: `/projects/${projectId}/prompts/${promptId}/assets`
        });
    }
    if (assetKey) {
        breadcrumbs.push({
            label: breadcrumbLoading ? assetKey : (asset?.name || asset?.key || assetKey),
            href: `/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/edit`
        });
        breadcrumbs.push({ label: "Versions" });
    }

    if (breadcrumbLoading) return <p>Loading page details...</p>;
    if (!project || !currentPrompt || !asset) {
        return <p>Error loading essential details (project, prompt, or asset). Please check the console and try again.</p>;
    }

    if (isModalOpen) {
        return (
            <>
                <Breadcrumb crumbs={breadcrumbs} />
                <div className="my-6">
                    <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                        {editingItem ? `Edit Version: ${editingItem.versionTag}` : 'Add New Asset Version'}
                        {' for Asset: '}
                        <span className="text-indigo-600 dark:text-indigo-400">{asset?.name || assetKey}</span>
                    </h2>
                </div>
                <PromptAssetVersionForm
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                    onSave={async (payload) => {
                        await handleSave(payload);
                    }}
                    initialData={editingItem}
                    latestVersionTag={latestVersionTagForForm ?? undefined}
                    projectId={projectId}
                    promptId={promptId}
                    assetKey={assetKey}
                />
            </>
        );
    }

    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />
            <div className="my-6">
                <h2 className="text-2xl font-semibold mb-2 text-black dark:text-white">
                    Versions for Asset: <span className="text-indigo-600 dark:text-indigo-400">{asset?.name || assetKey}</span>
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Project: <span className="font-medium">{project?.name || projectId}</span><br />
                    Prompt: <span className="font-medium">{currentPrompt?.name || promptId}</span>
                </p>
            </div>

            <div className="flex justify-end mb-4">
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors duration-150"
                    disabled={loading}
                    title="Add New Asset Version"
                >
                    Add Version
                </button>
            </div>

            {error && <p className="text-red-500 py-2">Error fetching versions: {error}</p>}
            {loading && itemsList.length === 0 && <p>Loading versions...</p>}

            {!loading && itemsList.length === 0 && !error && (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">No versions found for this asset.</p>
            )}

            {itemsList.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
                    <PromptAssetVersionsTable
                        promptAssetVersions={itemsList}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        projectId={projectId}
                        promptId={promptId}
                        assetKey={assetKey}
                        loading={loading}
                    />
                </div>
            )}
        </>
    );
};

export default PromptAssetVersionsPage; 