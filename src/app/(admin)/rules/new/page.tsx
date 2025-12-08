"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ruleService,
    CreateProjectDto, // Unificado aquí
    UpdatePromptDto // Necesario para la firma de onSave en PromptForm
} from '@/services/api';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import PromptForm from '@/components/form/PromptForm';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import * as generated from '@/services/generated/api';
import RuleForm from '@/components/form/RuleForm';

// Helper para extraer mensajes de error de forma segura
const getApiErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return defaultMessage;
};

const NewRulePage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<CreateProjectDto | null>(null);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    
    const initialDataForNewRule = {
        title: '',
        content: '',
        language: '',
        version: '',
      
    };


    const handleCreateRule = async (rulePayload: any) => {

        setIsSaving(true);
        try {
            console.log('Creating rule with payload:', { projectId, ...rulePayload });
            const createdRule = await ruleService.create(projectId, rulePayload);
            if (createdRule && createdRule.id) {
                showSuccessToast(`Rule "${rulePayload.title}" created successfully.`);
                router.push(`/projects/${projectId}/rules`);
            } else {
                throw new Error("Failed to create rule: No rule ID returned");
            }
        } catch (err: unknown) {
            console.error("Error creating rule:", err);
            const errorMessage = getApiErrorMessage(err, "Failed to create rule.");
            showErrorToast(errorMessage);
            // No redirigir en caso de error
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateRule = async (rulePayload: any) => {
        // Esta función no debería ser llamada en la página de creación
        showErrorToast("Cannot update a rule in the creation page.");
    };

    const handleCancel = () => {
        router.push(`/projects/${projectId}/rules`);
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        {
            label: loadingProject ? projectId : (project?.name || projectId),
            href: `/projects/${projectId}/rules`
        },
        { label: "Rules", href: `/projects/${projectId}/rules` },
        { label: "New Rule" }
    ];

    
    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />
            <div className="my-6">
                <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                    Create New Rule <span className="text-indigo-600 dark:text-indigo-400">{project?.name || projectId}</span>
                </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6">
                <RuleForm
                    // initialData={initialDataForNewRule}
                    projectId={projectId}
                    onCreate={handleCreateRule}
                    onUpdate={handleUpdateRule}
                    onCancel={handleCancel}
                />
            </div>
        </>
    );
};

export default NewRulePage; 