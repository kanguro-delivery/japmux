"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { promptAssetService, projectService } from '@/services/api';
import { PromptAssetData } from '@/components/tables/PromptAssetsTable'; // Asumiendo que esta interfaz es útil
import { UpdatePromptAssetDto, CreateProjectDto } from '@/services/generated/api';
import Breadcrumb, { Crumb } from '@/components/common/PageBreadCrumb';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import Link from 'next/link';

// Helper para obtener mensajes de error (puede ser importado de un archivo utils si es compartido)
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

const EditPromptAssetPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();

    const projectId = params.projectId as string;
    const promptId = params.promptId as string;
    const assetKey = params.assetKey as string;

    const [asset, setAsset] = useState<PromptAssetData | null>(null);
    const [project, setProject] = useState<CreateProjectDto | null>(null);
    // const [currentPrompt, setCurrentPrompt] = useState<PromptDto | null>(null); // Para breadcrumbs si es necesario

    const [category, setCategory] = useState('');
    const [enabled, setEnabled] = useState(true);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [breadcrumbLoading, setBreadcrumbLoading] = useState<boolean>(true);


    const fetchAssetData = useCallback(async () => {
        if (!projectId || !promptId || !assetKey) {
            setError("Missing IDs in URL.");
            setLoading(false);
            setBreadcrumbLoading(false);
            return;
        }
        setLoading(true);
        setBreadcrumbLoading(true);
        try {
            const assetDataPromise = promptAssetService.findOne(projectId, promptId, assetKey);
            const projectDataPromise = projectService.findOne(projectId);
            // const promptDataPromise = promptService.findOne(projectId, promptId); // Si necesitas nombre del prompt

            const [assetData, projectData] = await Promise.all([
                assetDataPromise,
                projectDataPromise,
                // promptDataPromise
            ]);

            setAsset(assetData);
            setProject(projectData);
            // setCurrentPrompt(promptData);

            // Poblar formulario
            setCategory(assetData.category || '');
            setEnabled(assetData.enabled !== undefined ? assetData.enabled : true);

        } catch (err) {
            console.error("Error fetching asset data:", err);
            const apiErrorMessage = getApiErrorMessage(err, "Failed to load asset data.");
            showErrorToast(apiErrorMessage);
            setError(apiErrorMessage);
        } finally {
            setLoading(false);
            setBreadcrumbLoading(false);
        }
    }, [projectId, promptId, assetKey]);

    useEffect(() => {
        fetchAssetData();
    }, [fetchAssetData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !promptId || !assetKey) {
            showErrorToast("Cannot save: Missing critical IDs.");
            return;
        }
        setSaving(true);
        setError(null);

        const payload: UpdatePromptAssetDto = {
            category: category || undefined, // Enviar undefined si está vacío para que no se actualice si no se quiere
            enabled: enabled,
        };

        try {
            await promptAssetService.update(projectId, promptId, assetKey, payload);
            showSuccessToast(`Asset "${asset?.name || assetKey}" updated successfully!`);
            router.push(`/projects/${projectId}/prompts/${promptId}/assets`);
        } catch (err) {
            console.error("Error updating asset:", err);
            const apiErrorMessage = getApiErrorMessage(err, "Failed to update asset.");
            showErrorToast(apiErrorMessage);
            setError(apiErrorMessage);
        } finally {
            setSaving(false);
        }
    };

    const breadcrumbs: Crumb[] = [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
    ];
    if (project) {
        breadcrumbs.push({
            label: breadcrumbLoading ? projectId : (project.name || projectId),
            href: `/projects/${projectId}/prompts`
        });
    }
    // Asumiendo que necesitamos el nombre del prompt para las breadcrumbs
    // Si setCurrentPrompt se usa, añadir su lógica de carga y push al breadcrumb
    if (promptId) {
        breadcrumbs.push({
            label: breadcrumbLoading ? promptId : (asset?.promptName || 'Prompt Assets'), // Usar promptName del asset si está disponible
            href: `/projects/${projectId}/prompts/${promptId}/assets`
        });
    }
    if (asset) {
        breadcrumbs.push({ label: asset.name || assetKey, href: `/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions` }); // O a la página de detalle/versiones del asset
        breadcrumbs.push({ label: "Edit" });
    } else if (assetKey) {
        breadcrumbs.push({ label: assetKey, href: `/projects/${projectId}/prompts/${promptId}/assets` });
        breadcrumbs.push({ label: "Edit" });
    }


    if (loading && !asset) {
        return <div className="p-4 text-center">Loading asset details...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!asset && !loading) {
        return <div className="p-4 text-center text-red-500">Asset not found.</div>;
    }

    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                    Edit Asset: <span className="text-indigo-600 dark:text-indigo-400">{asset?.name || assetKey}</span>
                </h1>

                <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <div>
                        <label htmlFor="assetKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Asset Key (Name/ID)
                        </label>
                        <input
                            type="text"
                            name="assetKey"
                            id="assetKey"
                            value={assetKey}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The asset key cannot be changed.</p>
                    </div>

                    <div>
                        <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Display Name
                        </label>
                        <input
                            type="text"
                            name="assetName"
                            id="assetName"
                            value={asset?.name || ''}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Display name is derived from the latest version or initial creation and is not directly editable here. Manage via versions.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                        </label>
                        <input
                            type="text"
                            name="category"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="enabled"
                            name="enabled"
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:checked:bg-indigo-500"
                        />
                        <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Enabled
                        </label>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    <div className="flex justify-end space-x-3">
                        <Link href={`/projects/${projectId}/prompts/${promptId}/assets`}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditPromptAssetPage; 