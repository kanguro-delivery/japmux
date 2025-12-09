"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    UpdatePromptDto,
    promptService,
    projectService,
    CreateProjectDto,
    PromptDto, // Para tipar el prompt cargado
    CreatePromptDto as CreatePromptDtoType, // Alias para evitar conflicto con el DTO del proyecto
    CreatePromptDto as GeneratedCreatePromptDto,
} from '@/services/api';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import PromptForm from '@/components/form/PromptForm';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import * as generated from '@/services/generated/api';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

const EditPromptPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;
    const promptId = params.promptId as string;

    const [project, setProject] = useState<CreateProjectDto | null>(null);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);
    const [promptData, setPromptData] = useState<PromptDto | null>(null);
    const [loadingPrompt, setLoadingPrompt] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        if (projectId) {
            setLoadingProject(true);
            projectService.findOne(projectId)
                .then(data => setProject(data))
                .catch(err => {
                    console.error("Error fetching project details:", err);
                    showErrorToast(getApiErrorMessage(err, "Failed to load project details."));
                    setProject(null);
                })
                .finally(() => setLoadingProject(false));
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId && promptId) {
            setLoadingPrompt(true);
            promptService.findOne(projectId, promptId)
                .then(data => {
                    setPromptData(data);
                })
                .catch(err => {
                    console.error("Error fetching prompt data:", err);
                    showErrorToast(getApiErrorMessage(err, "Failed to load prompt data for editing."));
                    setPromptData(null);
                })
                .finally(() => setLoadingPrompt(false));
        }
    }, [projectId, promptId]);

    const handleCreatePrompt = async (promptPayload: Omit<GeneratedCreatePromptDto, 'tenantId'>) => {
        // Esta función no debería ser llamada en la página de edición
        showErrorToast("Cannot create a prompt in the edit page.");
    };

    const handleUpdatePrompt = async (promptPayload: UpdatePromptDto) => {
        if (!projectId || !promptId) {
            showErrorToast("Project ID or Prompt ID is missing.");
            return;
        }

        setIsSaving(true);
        try {
            await promptService.update(projectId, promptId, promptPayload);
            showSuccessToast(`Prompt updated successfully.`);
            router.push(`/projects/${projectId}/prompts`);
        } catch (err: unknown) {
            console.error("Error updating prompt:", err);
            showErrorToast(getApiErrorMessage(err, "Failed to update prompt."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/projects/${projectId}/prompts`);
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        {
            label: loadingProject ? projectId : (project?.name || projectId),
            href: `/projects/${projectId}/prompts`
        },
        { label: "Prompts", href: `/projects/${projectId}/prompts` },
        { label: loadingPrompt ? 'Edit Prompt' : (promptData?.name || promptId) }
    ];

    if ((loadingProject && !project) || (loadingPrompt && !promptData)) {
        return <p>Loading data...</p>;
    }

    if ((!project && !loadingProject) || (!promptData && !loadingPrompt)) {
        // Si promptData es null y no está cargando, y ya pasó la carga del proyecto
        return <p>Error loading data for editing. The prompt may not exist or there was an issue fetching project details.</p>;
    }

    // Ya no es necesario construir initialFormData aquí, pasaremos promptData directamente a PromptForm.
    // promptData es de tipo PromptDto | null. Cuando no es null, es PromptDto.
    // PromptForm espera initialData: PromptDto | CreatePromptDto | null.
    // PromptDto tiene 'id', por lo que 'isEditing' será true en PromptForm.

    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />
            <div className="my-6">
                <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                    Edit Prompt: <span className="text-indigo-600 dark:text-indigo-400">{promptData?.name || promptId}</span>
                </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6">
                {promptData ? (
                    <PromptForm
                        initialData={promptData}
                        projectId={projectId}
                        isEditing={true}
                        onCreate={handleCreatePrompt}
                        onUpdate={handleUpdatePrompt}
                        onCancel={handleCancel}
                    />
                ) : (
                    <p>Prompt data could not be loaded or project details are missing.</p>
                )}
            </div>
        </>
    );
};

export default EditPromptPage; 