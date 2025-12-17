"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    analysisPlanService,
    ruleService,
} from '@/services/api';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import AnalysisPlanForm from '@/components/form/analysisPlanForm';


const NewAnalysisPlanPage: React.FC = () => {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    
    const handleCreateAnalysisPlan = async (analysisPlanPayload: any) => {

        setIsSaving(true);
        try {
            console.log('Creating AnalysisPlan with payload:', {...analysisPlanPayload });
           
            const createdAnalysisPlan = await analysisPlanService.create( analysisPlanPayload);
            if (createdAnalysisPlan && createdAnalysisPlan.id) {
                showSuccessToast(`Analysis Plan "${analysisPlanPayload.name}" created successfully.`);
                router.push(`/analysis-plan`);
            } else {
                throw new Error("Failed to create rule: No rule ID returned");
            }
        } catch (err: unknown) {
            console.error("Error creating AnalysisPlan:", err);
            const errorMessage = getApiErrorMessage(err, "Failed to create AnalysisPlan.");
            showErrorToast(errorMessage);
            // No redirigir en caso de error
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/analysis-plan`);
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "New Analysis Plan" }
    ];

    
    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />
            <div className="my-6">
                <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                    Create New Analysis Plan 
                </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6">
                <AnalysisPlanForm
                    onSubmit={handleCreateAnalysisPlan}
                    onCancel={handleCancel}     
                    submitLabel="Create Analysis Plan"
                    isLoading={isSaving}
                    />
            </div>
        </>
    );
};

export default NewAnalysisPlanPage; 