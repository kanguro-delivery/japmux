"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    CreateProjectDto,
    CreatePromptDto,
    CreatePromptAssetDto,
    CreatePromptAssetVersionDto,
    CreateAssetTranslationDto,
    UpdateAssetTranslationDto,
    CreateRegionDto,
} from '@/services/generated/api';
import {
    promptAssetService,
    projectService,
    promptService,
    regionService,
} from '@/services/api';
import Breadcrumb, { Crumb } from '@/components/common/PageBreadCrumb';
import PromptAssetTranslationsTable from '@/components/tables/PromptAssetTranslationsTable';
import PromptAssetTranslationForm from '@/components/form/PromptAssetTranslationForm';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import axios from 'axios';
import { PromptAssetData } from '@/components/tables/PromptAssetsTable';
import { DocumentDuplicateIcon, LanguageIcon } from '@heroicons/react/24/outline';

// Helper para extraer mensajes de error de forma segura
const getApiErrorMessage = (error: unknown, defaultMessage: string): string => {
    if ((axios as any).isAxiosError && (axios as any).isAxiosError(error)) {
        return (error as any).response?.data?.message || (error as any).message || defaultMessage;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return defaultMessage;
};

interface AssetTranslationUIData extends CreateAssetTranslationDto {
    id?: string; // languageCode se usará como id en la UI
}

const PromptAssetTranslationsPage: React.FC = () => {
    const [itemsList, setItemsList] = useState<AssetTranslationUIData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAssetTranslationForm, setShowAssetTranslationForm] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<AssetTranslationUIData | null>(null);

    const [project, setProject] = useState<CreateProjectDto | null>(null);
    const [currentPrompt, setCurrentPrompt] = useState<CreatePromptDto | null>(null);
    const [asset, setAsset] = useState<PromptAssetData | null>(null);
    const [version, setVersion] = useState<CreatePromptAssetVersionDto | null>(null); // version.value es el texto original
    const [breadcrumbLoading, setBreadcrumbLoading] = useState<boolean>(true);

    // Nuevos estados para gestionar las regiones/idiomas disponibles y si todas están traducidas
    const [projectRegions, setProjectRegions] = useState<CreateRegionDto[]>([]); // Para todas las regiones del proyecto
    const [availableLanguagesForNewTranslation, setAvailableLanguagesForNewTranslation] = useState<{ code: string; name: string }[]>([]);
    const [allLanguagesTranslated, setAllLanguagesTranslated] = useState<boolean>(false);

    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const promptId = params.promptId as string;
    const assetKey = params.assetKey as string;
    const versionTag = params.versionTag as string;

    useEffect(() => {
        if (!projectId) return; // Solo necesitamos projectId para las regiones
        setBreadcrumbLoading(true); // Mantener para la carga general de breadcrumbs

        const fetchProjectDetailsAndRegions = async () => {
            try {
                const [projectData, promptData, assetData, versionData, regionsData] = await Promise.all([
                    projectService.findOne(projectId),
                    promptService.findOne(projectId, promptId),
                    promptAssetService.findOne(projectId, promptId, assetKey),
                    promptAssetService.findOneVersion(projectId, promptId, assetKey, versionTag),
                    regionService.findAll(projectId) // Obtener las regiones del proyecto
                ]);

                setProject(projectData as CreateProjectDto);
                setCurrentPrompt(promptData as CreatePromptDto);
                setAsset(assetData as PromptAssetData);
                setVersion(versionData as CreatePromptAssetVersionDto);
                setProjectRegions(regionsData); // Guardar las regiones del proyecto

            } catch (err: unknown) {
                console.error("Error fetching breadcrumb data or project regions:", err);
                const defaultMsg = 'Failed to load project details or regions.';
                showErrorToast(getApiErrorMessage(err, defaultMsg));
                setError(getApiErrorMessage(err, defaultMsg));
                setProjectRegions([]); // Limpiar en caso de error
            } finally {
                setBreadcrumbLoading(false);
            }
        };

        if (projectId && promptId && assetKey && versionTag) {
            fetchProjectDetailsAndRegions();
        } else {
            // Si faltan IDs esenciales para los detalles principales, al menos intentar cargar regiones si projectId existe
            // o manejar el error de IDs faltantes de forma más explícita.
            // Por ahora, la lógica de fetchData ya maneja los IDs faltantes para las traducciones.
            // Y el return de la página maneja la falta de `version`.
            // Si solo falta `projectId` para las regiones, se podría poner un error específico.
            if (!projectId) {
                setError("Project ID is missing, cannot load regions.");
                setBreadcrumbLoading(false);
            } else {
                // Si otros IDs faltan, la carga principal no se hará.
                // Podríamos optar por no cargar nada y mostrar error, o cargar solo regiones.
                // Por consistencia, esperaremos a que todos los IDs estén para la carga inicial combinada.
                // breadcrumbLoading se pondrá a false si faltan IDs y no se entra al fetch.
                if (!promptId || !assetKey || !versionTag) {
                    setBreadcrumbLoading(false); // Asegurar que no se quede cargando si faltan otros IDs
                }
            }
        }

    }, [projectId, promptId, assetKey, versionTag]);

    const fetchData = useCallback(async () => {
        if (!projectId || !promptId || !assetKey || !versionTag) {
            setError("Missing Project ID, Prompt ID, Asset Key, or Version Tag in URL.");
            setLoading(false);
            setItemsList([]);
            setAvailableLanguagesForNewTranslation([]); // Usar array vacío en lugar de ALL_AVAILABLE_LANGUAGES
            setAllLanguagesTranslated(false);
            return;
        }
        if (!version && !breadcrumbLoading) {
            setError(`Asset version "${versionTag}" may not exist or failed to load.`);
            setLoading(false);
            setItemsList([]);
            setAvailableLanguagesForNewTranslation([]);
            setAllLanguagesTranslated(false);
            return;
        }
        if (!version) {
            setLoading(false);
            return;
        }
        // Asegurarse de que projectRegions se haya cargado antes de calcular los idiomas disponibles
        if (projectRegions.length === 0 && !breadcrumbLoading) { // Si no hay regiones y no está cargando breadcrumbs
            // Esto podría indicar que las regiones no se cargaron o no hay ninguna. 
            // Si es un error, ya debería estar en `error`. Si no hay regiones, es un estado válido.
            // console.log("[fetchData] Project regions not loaded yet or empty.");
        }

        setLoading(true);
        setError(null);
        try {
            const data = await promptAssetService.findTranslations(projectId, promptId, assetKey, versionTag);
            let fetchedTranslations: AssetTranslationUIData[] = [];
            if (Array.isArray(data)) {
                fetchedTranslations = data.filter(t => t.languageCode).map(t => ({ ...t, id: t.languageCode })) as AssetTranslationUIData[];
                setItemsList(fetchedTranslations);
            } else {
                console.error("API response for asset translations is not an array:", data);
                setError('Received invalid data format for translations.');
                setItemsList([]);
            }

            const translatedLanguageCodes = new Set(fetchedTranslations.map(t => t.languageCode));
            console.log('Códigos de idioma ya traducidos:', Array.from(translatedLanguageCodes));
            console.log('Regiones del proyecto:', projectRegions);

            // Usar projectRegions como fuente de todos los idiomas posibles
            const allPossibleLanguagesFromProject = projectRegions.map(region => ({
                code: region.languageCode,
                name: region.name
            }));
            console.log('Todos los idiomas posibles del proyecto:', allPossibleLanguagesFromProject);

            // Excluir el idioma original del asset
            const originalLanguageCode = version?.languageCode;
            console.log('Idioma original del asset:', originalLanguageCode);

            const remainingLanguages = allPossibleLanguagesFromProject.filter(lang =>
                !translatedLanguageCodes.has(lang.code) &&
                lang.code !== originalLanguageCode
            );
            console.log('Idiomas disponibles para traducción:', remainingLanguages);

            setAvailableLanguagesForNewTranslation(remainingLanguages);
            setAllLanguagesTranslated(remainingLanguages.length === 0 && allPossibleLanguagesFromProject.length > 0);

        } catch (err: unknown) {
            console.error("Error fetching asset translations:", err);
            setError(getApiErrorMessage(err, 'Failed to fetch asset translations.'));
            setItemsList([]);
            setAvailableLanguagesForNewTranslation([]);
            setAllLanguagesTranslated(false);
        } finally {
            setLoading(false);
        }
    }, [projectId, promptId, assetKey, versionTag, version, breadcrumbLoading, projectRegions]); // projectRegions como dependencia

    useEffect(() => {
        if (projectId && promptId && assetKey && versionTag && !breadcrumbLoading && projectRegions.length > 0) { // También esperar a projectRegions
            fetchData();
        } else if (projectId && !breadcrumbLoading && projectRegions.length === 0 && !error) {
            // Si las regiones del proyecto están vacías (y no es por un error de carga previo),
            // podemos considerar que no hay idiomas para traducir.
            setAvailableLanguagesForNewTranslation([]);
            setAllLanguagesTranslated(true); // O false si se quiere mostrar "No regions configured for this project"
            setLoading(false); // Detener la carga si no hay regiones para procesar
        }
    }, [projectId, promptId, assetKey, versionTag, fetchData, breadcrumbLoading, projectRegions, version, error]);


    const handleAdd = () => {
        setEditingItem(null);
        setShowAssetTranslationForm(true);
    };

    const handleEdit = (item: AssetTranslationUIData) => {
        setEditingItem(item);
        setShowAssetTranslationForm(true);
    };

    const handleDelete = async (languageCode: string) => {
        if (!projectId || !promptId || !assetKey || !versionTag || !languageCode) {
            showErrorToast("Missing required IDs or language code to delete translation.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete the translation for ${languageCode}?`)) {
            setLoading(true);
            try {
                await promptAssetService.removeTranslation(projectId, promptId, assetKey, versionTag, languageCode);
                showSuccessToast("Translation deleted successfully!");
                fetchData();
            } catch (err: unknown) {
                showErrorToast(getApiErrorMessage(err, 'Failed to delete translation.'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async (payloadFromForm: CreateAssetTranslationDto | UpdateAssetTranslationDto) => {
        if (!projectId || !promptId || !assetKey || !versionTag) return;

        if (!editingItem && (!version || !(version as any).id)) {
            showErrorToast("Asset Version ID is missing. Cannot create translation.");
            setLoading(false);
            return;
        }

        setLoading(true); // Podríamos usar un loading específico para la acción de guardado
        try {
            let message = "";
            const langCode = editingItem?.languageCode || (payloadFromForm as CreateAssetTranslationDto).languageCode;
            if (!langCode) {
                showErrorToast("Language code is missing.");
                setLoading(false);
                return;
            }

            if (editingItem && editingItem.languageCode) {
                await promptAssetService.updateTranslation(
                    projectId,
                    promptId,
                    assetKey,
                    versionTag,
                    editingItem.languageCode,
                    payloadFromForm as UpdateAssetTranslationDto
                );
                message = `Asset translation for ${editingItem.languageCode} updated.`;
            } else {
                const { versionId: _discard, ...payloadToSend } = payloadFromForm as any;

                await promptAssetService.createTranslation(
                    projectId,
                    promptId,
                    assetKey,
                    versionTag,
                    payloadToSend as CreateAssetTranslationDto
                );
                message = `Asset translation for ${langCode} created.`;
            }
            setShowAssetTranslationForm(false);
            setEditingItem(null);
            showSuccessToast(message);
            fetchData();
        } catch (err: unknown) {
            showErrorToast(getApiErrorMessage(err, 'Failed to save translation.'));
            console.error("Error saving translation:", err);
        } finally {
            setLoading(false);
        }
    };

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
            href: `/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/edit` // Asumiendo que esta es la página de edición del asset
        });
    }
    if (versionTag) {
        breadcrumbs.push({
            label: breadcrumbLoading ? `Version ${versionTag}` : (version?.versionTag ? `Version ${version.versionTag}` : `Version ${versionTag}`),
            // TODO: Verificar la ruta correcta para la lista de versiones de un asset si existe
            href: `/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions`
        });
        breadcrumbs.push({ label: "Translations" });
    }


    if (breadcrumbLoading) return <div className="p-4">Loading page details...</div>;

    // Si después de cargar breadcrumbs, falta información esencial (como 'version')
    if (!version && !breadcrumbLoading && !error) {
        // Podría ser que 'version' no exista o la carga inicial de 'version' falló (el error se manejaría en fetchData o aquí)
        // Si 'error' ya tiene un mensaje de la carga de breadcrumbs, ese se mostrará.
        // Si no, podemos poner un mensaje específico o dejar que la lógica de 'fetchData' maneje el error si 'version' es crucial.
        return <div className="p-4 text-red-500">Error: Asset Version <span className="font-semibold">{versionTag}</span> for Asset <span className="font-semibold">{assetKey}</span> could not be loaded. It may not exist or an error occurred.</div>;
    }

    // Muestra 'loading' si está cargando y no hay items aún (primera carga)
    if (loading && itemsList.length === 0 && !error) return <p>Loading translations for {asset?.name || assetKey} - {version?.versionTag || versionTag}...</p>;

    const originalAssetValue = version?.value || 'Original asset value not available.';

    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />

            {showAssetTranslationForm ? (
                <div className="mt-8 mb-8">
                    <PromptAssetTranslationForm
                        initialData={editingItem}
                        onSave={handleSave}
                        onCancel={() => {
                            setShowAssetTranslationForm(false);
                            setEditingItem(null);
                        }}
                        versionText={originalAssetValue}
                        availableLanguages={availableLanguagesForNewTranslation}
                        isEditing={!!editingItem}
                    />
                </div>
            ) : (
                <>
                    {/* Header Section */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl px-8 pt-6 pb-8 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent mb-1">Manage Asset Translations</h1>
                            {asset && currentPrompt && project && (
                                <p className="text-md text-gray-600 dark:text-gray-300">
                                    For Asset: <span className="font-semibold">{asset.key}</span> (Version: <span className="font-semibold">{versionTag}</span>)
                                </p>
                            )}
                            {currentPrompt && project && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    In Prompt: {currentPrompt.name} (Project: {project.name})
                                </p>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manage translations for this version of your asset. Each translation allows the asset value to be served in a different language.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Main Content Area: Original Asset Value and Translations Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Columna del texto original del Asset */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-fit">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <DocumentDuplicateIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    Original Asset Value (Version: {versionTag})
                                </h3>
                            </div>
                            <div className="p-6">
                                <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono bg-[#343541] p-4 rounded-lg border border-gray-700 max-h-[calc(100vh-350px)] lg:max-h-[calc(100vh-400px)] overflow-y-auto">
                                    {originalAssetValue}
                                </pre>
                            </div>
                        </div>

                        {/* Columna de traducciones del Asset */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <LanguageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    Asset Translations Table
                                </h3>
                                {!loading && !error && !allLanguagesTranslated && (
                                    <button
                                        onClick={handleAdd}
                                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        disabled={loading || breadcrumbLoading || availableLanguagesForNewTranslation.length === 0}
                                    >
                                        <LanguageIcon className="w-4 h-4 mr-1" />
                                        Add Asset Translation
                                    </button>
                                )}
                            </div>
                            <div className="p-6">
                                {loading && (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                                    </div>
                                )}
                                {!loading && allLanguagesTranslated && itemsList.length > 0 && (
                                    <div className="text-center py-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <h4 className="text-md font-medium text-gray-800 dark:text-white">All Asset Languages Translated!</h4>
                                    </div>
                                )}
                                {!loading && itemsList.length === 0 && !allLanguagesTranslated && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900/30 mb-4">
                                            <LanguageIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Asset Translations Yet</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Start by adding a translation for this asset version.</p>
                                        <button
                                            onClick={handleAdd}
                                            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                            disabled={loading || breadcrumbLoading || availableLanguagesForNewTranslation.length === 0}
                                        >
                                            <LanguageIcon className="w-4 h-4 mr-1" />
                                            Add Asset Translation
                                        </button>
                                    </div>
                                )}
                                {!loading && itemsList.length > 0 && (
                                    <div className="max-h-[calc(100vh-450px)] overflow-y-auto">
                                        <PromptAssetTranslationsTable
                                            translations={itemsList}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default PromptAssetTranslationsPage;

