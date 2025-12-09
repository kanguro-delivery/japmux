"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    CreateProjectDto,
    CreatePromptDto,
    UpdatePromptDto,
} from '@/services/generated/api';
import {
    promptService,
    projectService,
} from '@/services/api';
import { useProjects } from '@/context/ProjectContext';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import PromptsTable from '@/components/tables/PromptsTable';
import PromptForm from '@/components/form/PromptForm';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import logger from '@/utils/logger';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

// Tipo personalizado para un prompt existente con id
type PromptWithId = CreatePromptDto & { id: string };

// Tipo para prompts con información de idioma
interface PromptWithLanguage extends Omit<PromptWithId, 'languageCode'> {
    languageCode?: string;
}

// Helper para extraer mensajes de error de forma segura

const PromptsPage: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptWithId[]>([]);
    const [loadingPrompts, setLoadingPrompts] = useState<boolean>(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [deletingPrompts, setDeletingPrompts] = useState<Set<string>>(new Set());
    const [lastDeleteTime, setLastDeleteTime] = useState<number>(0);

    const params = useParams();
    const router = useRouter();
    const urlProjectId = params.projectId as string;

    const {
        selectedProjectId: contextProjectId,
        isLoading: projectContextIsLoading,
        selectedProjectFull,
        refreshProjects
    } = useProjects();

    logger.debug(`PromptsPage Rendering. urlProjectId: ${urlProjectId}, contextProjectId: ${contextProjectId}, projectContextIsLoading: ${projectContextIsLoading}, selectedProjectFull: ${selectedProjectFull?.name}`);

    const fetchPrompts = useCallback(async () => {
        if (!contextProjectId) {
            logger.debug("fetchPrompts: No contextProjectId, skipping fetch.");
            setPrompts([]);
            setLoadingPrompts(false);
            return;
        }
        logger.debug(`fetchPrompts: Fetching for contextProjectId: ${contextProjectId}`);
        setLoadingPrompts(true);
        setPageError(null);
        try {
            const data = await promptService.findAll(contextProjectId);
            logger.debug("fetchPrompts: Received data", data);
            logger.debug("fetchPrompts: First few prompt IDs", data.slice(0, 5).map(p => ({ id: p.id, name: p.name })));
            setPrompts(data);
        } catch (err: unknown) {
            logger.error("Error fetching prompts", err);
            setPageError(getApiErrorMessage(err, "Failed to fetch prompts."));
            setPrompts([]);
        } finally {
            setLoadingPrompts(false);
        }
    }, [contextProjectId]);

    useEffect(() => {
        if (!projectContextIsLoading && contextProjectId) {
            console.log("[PromptsPage] useEffect[fetchPrompts]: Context ready and contextProjectId available. Calling fetchPrompts.");
            fetchPrompts();
        } else {
            console.log("[PromptsPage] useEffect[fetchPrompts]: Context loading or no contextProjectId. Prompts will not be fetched yet.");
            setPrompts([]);
            if (projectContextIsLoading) setLoadingPrompts(true);
            else setLoadingPrompts(false);
        }
    }, [projectContextIsLoading, contextProjectId, fetchPrompts]);

    const handleAddPrompt = () => {
        if (contextProjectId) {
            router.push(`/projects/${contextProjectId}/prompts/new`);
        } else {
            showErrorToast("No project selected in context to add a new prompt.");
        }
    };

    const handleEditPrompt = (promptToEdit: PromptWithLanguage) => {
        if (contextProjectId && promptToEdit && promptToEdit.id) {
            router.push(`/projects/${contextProjectId}/prompts/${promptToEdit.id}/edit`);
        } else {
            showErrorToast("Project ID from context or Prompt ID is missing.");
        }
    };

    // Debouncing para operaciones de eliminación
    const handleDeletePrompt = useCallback(async (promptIdToDelete: string, promptName?: string) => {
        logger.debug("handleDeletePrompt called", {
            promptIdToDelete,
            promptName,
            contextProjectId,
            urlProjectId
        });

        // Verificar si ya está siendo eliminado (debouncing)
        if (deletingPrompts.has(promptIdToDelete)) {
            logger.debug(`Prompt ${promptIdToDelete} is already being deleted, ignoring duplicate request`);
            showErrorToast("Esta operación ya está en progreso. Por favor espera.");
            return;
        }

        // Prevenir clicks muy rápidos (debounce adicional de 1 segundo)
        const currentTime = Date.now();
        if (currentTime - lastDeleteTime < 1000) {
            logger.debug("Delete operation too soon after last delete, ignoring");
            showErrorToast("Por favor espera un momento antes de eliminar otro prompt.");
            return;
        }
        setLastDeleteTime(currentTime);

        if (!contextProjectId) {
            showErrorToast("No hay proyecto seleccionado en el contexto.");
            return;
        }

        const confirmMessage = promptName
            ? `¿Estás seguro de que quieres eliminar el prompt "${promptName}"?`
            : "¿Estás seguro de que quieres eliminar este prompt?";

        if (window.confirm(confirmMessage)) {
            // Marcar como eliminándose
            setDeletingPrompts(prev => new Set(prev).add(promptIdToDelete));

            try {
                logger.debug("Calling promptService.remove", {
                    projectId: contextProjectId,
                    promptId: promptIdToDelete
                });

                // Actualización optimística del estado local
                setPrompts(prevPrompts => prevPrompts.filter(p => p.id !== promptIdToDelete));

                await promptService.remove(contextProjectId, promptIdToDelete);
                showSuccessToast(`Prompt ${promptName || promptIdToDelete} eliminado correctamente.`);

                // Sincronizar con el servidor
                await fetchPrompts();
            } catch (err: unknown) {
                logger.error("Error deleting prompt", err);

                // Manejo mejorado de errores
                let errorMessage = "Error al eliminar el prompt.";
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosError = err as any;
                    const status = axiosError.response?.status;
                    const responseData = axiosError.response?.data;

                    switch (status) {
                        case 404:
                            errorMessage = `Prompt con ID "${promptIdToDelete}" no encontrado en el proyecto "${contextProjectId}". Puede que ya haya sido eliminado.`;
                            break;
                        case 500:
                            errorMessage = `Error interno del servidor al eliminar "${promptName || promptIdToDelete}". Por favor revisa los logs del servidor o intenta más tarde.`;
                            break;
                        case 429:
                            errorMessage = `Demasiadas solicitudes. Por favor espera un momento e intenta de nuevo.`;
                            break;
                        case 403:
                            errorMessage = `Permisos denegados. No tienes derechos para eliminar este prompt.`;
                            break;
                        default:
                            if (responseData?.message) {
                                errorMessage = responseData.message;
                            } else {
                                errorMessage = `Error ${status}: No se pudo eliminar el prompt "${promptName || promptIdToDelete}".`;
                            }
                    }
                } else if (err instanceof Error) {
                    errorMessage = `Error de red: ${err.message}`;
                }

                setPageError(errorMessage);
                showErrorToast(errorMessage);

                // En caso de error, restaurar el estado correcto
                await fetchPrompts();
            } finally {
                // Remover de la lista de eliminándose
                setDeletingPrompts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(promptIdToDelete);
                    return newSet;
                });
            }
        }
    }, [contextProjectId, urlProjectId, deletingPrompts, fetchPrompts, lastDeleteTime]);

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        {
            label: projectContextIsLoading ? urlProjectId : (selectedProjectFull?.name || contextProjectId || urlProjectId),
            href: contextProjectId ? `/projects/${contextProjectId}/prompts` : `/projects/${urlProjectId}/prompts`
        },
        { label: "Prompts" }
    ];

    if (projectContextIsLoading) return <p>Loading project information...</p>;
    if (!contextProjectId && !projectContextIsLoading) {
        return <p>No project is currently selected. Please select a project from the header.</p>;
    }
    if ((contextProjectId && !selectedProjectFull && !pageError) || loadingPrompts) {
        return <p>Loading prompts for {selectedProjectFull?.name || contextProjectId}...</p>;
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
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                        Prompts for: <span className="text-black-600 dark:text-black-400">{selectedProjectFull?.name || contextProjectId}</span>
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">
                                        Create, view, and manage all prompts associated with this project. Each prompt can have multiple versions and translations.
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={handleAddPrompt}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        disabled={loadingPrompts || projectContextIsLoading || !contextProjectId}
                                    >
                                        Add New Prompt
                                    </button>
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
                        {pageError && (
                            <div className="mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-red-50/40 to-red-50/60 dark:from-red-900/60 dark:via-red-900/40 dark:to-red-900/60 backdrop-blur-xl rounded-2xl"></div>
                                    <div className="relative p-4 bg-red-50/30 dark:bg-red-900/30 backdrop-blur-sm rounded-2xl border border-red-200/30 dark:border-red-700/40 shadow-lg">
                                        <p className="text-red-600 dark:text-red-400 font-medium">Error: {pageError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty state with glassmorphism */}
                        {!loadingPrompts && prompts.length === 0 && !pageError ? (
                            <div className="text-center py-16">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl"></div>
                                    <div className="relative p-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-white/30 dark:border-gray-700/40 shadow-lg">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                            No Prompts Found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                            This project doesn't have any prompts yet. Get started by creating your first prompt.
                                        </p>
                                        <button
                                            onClick={handleAddPrompt}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            disabled={loadingPrompts || projectContextIsLoading || !contextProjectId}
                                        >
                                            Create First Prompt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Table section with glassmorphism container */
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/40 dark:from-gray-800/40 dark:via-gray-700/20 dark:to-gray-800/40 backdrop-blur-sm rounded-2xl"></div>
                                <div className="relative p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-600/30">
                                    <PromptsTable
                                        prompts={prompts}
                                        onEdit={handleEditPrompt}
                                        onDelete={handleDeletePrompt}
                                        loading={loadingPrompts}
                                        projectId={contextProjectId || ''}
                                        deletingPrompts={deletingPrompts}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptsPage; 