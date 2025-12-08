"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    projectService,
    CreateProjectDto,
    ruleService,
} from '@/services/api';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';

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

// Inline Rule Form Component
interface RuleInlineFormProps {
    initialData: any;
    projectId: string;
    onUpdate: (rulePayload: { title?: string; content?: string; language?: string; version?: string }) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}

const RuleInlineForm: React.FC<RuleInlineFormProps> = ({
    initialData,
    onUpdate,
    onCancel,
    isSaving,
}) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        language: initialData?.language || '',
        version: initialData?.version || '1.0',
    });

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            showErrorToast('Title is required');
            return;
        }
        
        if (!formData.content.trim()) {
            showErrorToast('Content is required');
            return;
        }

        await onUpdate({
            title: formData.title,
            content: formData.content,
            language: formData.language || undefined,
            version: formData.version || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter rule title"
                    required
                />
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                </label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange('content')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter rule content"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                    </label>
                    <input
                        type="text"
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange('language')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., en, es, fr"
                    />
                </div>

                <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Version
                    </label>
                    <input
                        type="text"
                        id="version"
                        name="version"
                        value={formData.version}
                        onChange={handleInputChange('version')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 1.0, 2.1"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Update Rule'}
                </button>
            </div>
        </form>
    );
};

const EditRulePage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;
    const ruleId = params.ruleId as string;

    const [project, setProject] = useState<CreateProjectDto | null>(null);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);
    const [ruleData, setRuleData] = useState<any | null>(null);
    const [loadingRule, setLoadingRule] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // useEffect(() => {
    //     if (projectId) {
    //         setLoadingProject(true);
    //         projectService.findOne(projectId)
    //             .then(data => setProject(data))
    //             .catch(err => {
    //                 console.error("Error fetching project details:", err);
    //                 showErrorToast(getApiErrorMessage(err, "Failed to load project details."));
    //                 setProject(null);
    //             })
    //             .finally(() => setLoadingProject(false));
    //     }
    // }, [projectId]);

    useEffect(() => {
        if (ruleId) {
            setLoadingRule(true);
            ruleService.findOne( ruleId)
                .then(data => {
                     console.log("Successsssssssssss rule data:", data);
                    setRuleData(data);
                })
                .catch(err => {
                    console.error("Error fetching rule data:", err);
                    showErrorToast(getApiErrorMessage(err, "Failed to load rule data for editing."));
                    setRuleData(null);
                })
                .finally(() => setLoadingRule(false));
        }
    }, [ ruleId]);

    const handleCreateRule = async (rulePayload: { title: string; content: string; language?: string; version?: string }) => {
        // Esta función no debería ser llamada en la página de edición
        showErrorToast("Cannot create a rule in the edit page.");
    };

    const handleUpdateRule = async (rulePayload: { title?: string; content?: string; language?: string; version?: string }) => {
        if (!projectId || !ruleId) {
            showErrorToast("Project ID or Rule ID is missing.");
            return;
        }

        setIsSaving(true);
        try {
            await ruleService.update(ruleId, rulePayload);
            showSuccessToast(`Rule updated successfully.`);
            router.push(`/projects/${projectId}/rules`);
        } catch (err: unknown) {
            console.error("Error updating rule:", err);
            showErrorToast(getApiErrorMessage(err, "Failed to update rule."));
        } finally {
            setIsSaving(false);
        }
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
        { label: loadingRule ? 'Edit Rule' : (ruleData?.title || ruleId) }
    ];

    if (
        // (loadingProject && !project) || 
        (loadingRule && !ruleData)) {
        return <p>Loading data...</p>;
    }

    // if (( !loadingProject) || (!ruleData && !loadingRule)) {
    //     // Si ruleData es null y no está cargando, y ya pasó la carga del proyecto
    //     return <p>Error loading data for editing. The rule may not exist or there was an issue fetching project details.</p>;
    // }

    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />
            <div className="my-6">
                <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                    Edit Rule: <span className="text-indigo-600 dark:text-indigo-400">{ruleData?.title || ruleId}</span>
                </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6">
                {ruleData ? (
                    <RuleInlineForm
                        initialData={ruleData}
                        projectId={projectId}
                        onUpdate={handleUpdateRule}
                        onCancel={handleCancel}
                        isSaving={isSaving}
                    />
                ) : (
                    <p>Rule data could not be loaded or project details are missing.</p>
                )}
            </div>
        </>
    );
};

export default EditRulePage;