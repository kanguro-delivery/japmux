"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    AnalysisPlan,
    analysisPlanService,
} from '@/services/api';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import AnalysisPlanForm from '@/components/form/analysisPlanForm';

export interface AnalysisPlanPayload {
  name: string;
  structuredDataPrompt: string;
  structuredDataSchema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}


const EditAnalysisPlanPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const analysisPlanId = params.analysisPlanId as string;
    const [analysisPlanData, setAnalysisPlanData] = useState<AnalysisPlan | null>(null);
    const [loadingAnalysisPlan, setLoadingAnalysisPlan] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    

    useEffect(() => {
        if (analysisPlanId) {
            setLoadingAnalysisPlan(true);
            analysisPlanService.findOne( analysisPlanId)
                .then(data => {
                    setAnalysisPlanData(data);
                })
                .catch(err => {
                    console.error("Error fetching analysis plan data:", err);
                    showErrorToast(getApiErrorMessage(err, "Failed to load analysis plan data for editing."));
                    setAnalysisPlanData(null);
                })
                .finally(() => setLoadingAnalysisPlan(false));
        }
    }, [ analysisPlanId]);


    const handleUpdateAnalysisPlan = async (analysisPlanPayload: AnalysisPlanPayload) => {

        if (!analysisPlanId) {
            showErrorToast("Analysis Plan ID is missing.");
            return;
        }

        setIsSaving(true);
        try {
            // Transform AnalysisPlanPayload to the format the API expects
            const updateDto = {
                name: analysisPlanPayload.name,
                promptText: analysisPlanPayload.structuredDataPrompt,
                properties: Object.entries(analysisPlanPayload.structuredDataSchema.properties).map(([key, value]: [string, any]) => ({
                    name: key,
                    type: value.type as "string" | "boolean",
                    required: analysisPlanPayload.structuredDataSchema.required.includes(key),
                    enumValues: value.enum || []
                }))
            };
            
            await analysisPlanService.update(analysisPlanId, updateDto);
            showSuccessToast(`Analysis Plan updated successfully.`);
            router.push(`/analysis-plan`);
        } catch (err: unknown) {
            console.error("Error updating analysis plan:", err);
            showErrorToast(getApiErrorMessage(err, "Failed to update analysis plan."));
        } finally {
            setIsSaving(false);
        }   
    };

    const handleCancel = () => {
        router.push(`/analysis-plan`);
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Analysis Plan", href: `/analysis-plan` },
        { label: loadingAnalysisPlan ? 'Edit Analysis Plan' : (analysisPlanData?.name || analysisPlanId) }
    ];

    if (
        (loadingAnalysisPlan && !analysisPlanData)) {
        return <p>Loading data...</p>;
    }

    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />
            <div className="my-6">
                <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                    Edit Analysis Plan: <span className="text-indigo-600 dark:text-indigo-400">{analysisPlanData?.name || analysisPlanId}</span>
                </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6">
                {analysisPlanData ? (
                    <AnalysisPlanForm
                    initialData={analysisPlanData}
                    // onSubmit={handleUpdateAnalysisPlan}
                    onCancel={handleCancel}
                    submitLabel="Update Analysis Plan"
                    isLoading={isSaving}
                    />

                ) : (
                    <p>Analysis Plan data could not be loaded.</p>
                )}
            </div>
        </>
    );
};

export default EditAnalysisPlanPage;