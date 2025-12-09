"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    CreatePromptDto,
    projectService,
    promptService,
    CreateProjectDto, // Unificado aquí
    UpdatePromptDto // Necesario para la firma de onSave en PromptForm
} from '@/services/api';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import PromptForm from '@/components/form/PromptForm';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import * as generated from '@/services/generated/api';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

// Helper para extraer mensajes de error de forma segura

const NewPromptPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<CreateProjectDto | null>(null);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Definir initialData para un nuevo prompt
    // tenantId ya no se necesita aquí, se infiere en el backend
    const initialDataForNewPrompt: Omit<generated.CreatePromptDto, 'tenantId'> = {
        name: '',
        description: '',
        promptText: '',
        type: {},
        languageCode: '',
    };

    useEffect(() => {
        if (projectId) {
            setLoadingProject(true);
            projectService.findOne(projectId)
                .then(data => setProject(data))
                .catch(err => {
                    console.error("Error fetching project details:", err);
                    showErrorToast(getApiErrorMessage(err, "Failed to load project details."));
                    setProject(null); // Asegurarse de que project es null si hay error
                })
                .finally(() => setLoadingProject(false));
        }
    }, [projectId]);

    const handleCreatePrompt = async (promptPayload: Omit<generated.CreatePromptDto, 'tenantId'>) => {
        if (!projectId) {
            showErrorToast("Project ID is missing.");
            return;
        }

        setIsSaving(true);
        try {
            console.log('Creating prompt with payload:', { projectId, ...promptPayload });
            const createdPrompt = await promptService.create(projectId, promptPayload);
            if (createdPrompt && createdPrompt.id) {
                showSuccessToast(`Prompt "${promptPayload.name}" created successfully.`);
                router.push(`/projects/${projectId}/prompts`);
            } else {
                throw new Error("Failed to create prompt: No prompt ID returned");
            }
        } catch (err: unknown) {
            console.error("Error creating prompt:", err);
            const errorMessage = getApiErrorMessage(err, "Failed to create prompt.");
            showErrorToast(errorMessage);
            // No redirigir en caso de error
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePrompt = async (promptPayload: UpdatePromptDto) => {
        // Esta función no debería ser llamada en la página de creación
        showErrorToast("Cannot update a prompt in the creation page.");
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
        { label: "New Prompt" }
    ];

    if (loadingProject && !project) {
        return <p>Loading project details...</p>;
    }

    if (!project && !loadingProject) {
        return <p>Error loading project details. Cannot create prompt.</p>;
    }


    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />
            <div className="my-6">
                <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                    Create New Prompt for <span className="text-indigo-600 dark:text-indigo-400">{project?.name || projectId}</span>
                </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6">
                <PromptForm
                    initialData={initialDataForNewPrompt}
                    projectId={projectId}
                    onCreate={handleCreatePrompt}
                    onUpdate={handleUpdatePrompt}
                    onCancel={handleCancel}
                />
            </div>
        </>
    );
};

export default NewPromptPage; 