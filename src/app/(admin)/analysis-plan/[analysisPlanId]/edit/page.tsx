"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    AnalysisPlan,
    AnalysisPlanProperty,
    analysisPlanService,
} from '@/services/api';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import AnalysisPlanForm from '@/components/form/analysisPlanForm';
import { schemaToProperties } from '@/utils/schemaToProperties';

// export interface AnalysisPlanPayload {
//   name: string;
//   structuredDataPrompt: string;
//   structuredDataSchema: {
//     type: "object";
//     properties: Record<string, any>;
//     required: string[];
//   };
// }

const EditAnalysisPlanPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const analysisPlanId = params.analysisPlanId as string;
    const [analysisPlanData, setAnalysisPlanData] = useState<AnalysisPlan | null>(null);
    const [loadingAnalysisPlan, setLoadingAnalysisPlan] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [initialFormData, setInitialFormData] = useState<{
        name: string;
        promptText: string;
        properties: AnalysisPlanProperty[];
        } | undefined>(undefined);

        useEffect(() => {
        if (analysisPlanData) {
            setInitialFormData({
            name: analysisPlanData.name,
            promptText: analysisPlanData.structuredDataPrompt,
            properties: schemaToProperties(analysisPlanData.structuredDataSchema),
            });
        }
        }, [analysisPlanData]);


    useEffect(() => {
        if (analysisPlanId) {
            setLoadingAnalysisPlan(true);
            analysisPlanService.findOne( analysisPlanId)
                .then(data => {
                    setAnalysisPlanData(data);
                })
                .catch(err => {
                    showErrorToast(getApiErrorMessage(err, "Failed to load analysis plan data."));
                    setAnalysisPlanData(null);
                })
                .finally(() => setLoadingAnalysisPlan(false));
        }
    }, [ analysisPlanId]);


    const handleUpdateAnalysisPlan= async (analysisPlanPayload: any) => {

        setIsSaving(true);
        try {
            await analysisPlanService.update(analysisPlanId, analysisPlanPayload);
                showSuccessToast(`Analysis Plan "${analysisPlanPayload.name}" edited successfully.`);
                router.push(`/analysis-plan`);
        
        } catch (err: unknown) {
            const errorMessage = getApiErrorMessage(err, "Failed to edit AnalysisPlan.");
            showErrorToast(errorMessage);
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
                {initialFormData ? (
                    <AnalysisPlanForm
                    initialData={initialFormData}
                    onSubmit={handleUpdateAnalysisPlan}
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