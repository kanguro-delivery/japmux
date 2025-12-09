"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
 ruleService,
} from '@/services/api';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import RuleForm from '@/components/form/RuleForm';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

const EditRulePage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const ruleId = params.ruleId as string;
    const [ruleData, setRuleData] = useState<any | null>(null);
    const [loadingRule, setLoadingRule] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        if (ruleId) {
            setLoadingRule(true);
            ruleService.findOne( ruleId)
                .then(data => {
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


    const handleUpdateRule = async (rulePayload: { title?: string; content?: string; language?: string; version?: string }) => {
        if (!ruleId) {
            showErrorToast("Rule ID is missing.");
            return;
        }

        setIsSaving(true);
        try {
            await ruleService.update(ruleId, rulePayload);
            showSuccessToast(`Rule updated successfully.`);
            router.push(`/rules`);
        } catch (err: unknown) {
            console.error("Error updating rule:", err);
            showErrorToast(getApiErrorMessage(err, "Failed to update rule."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/rules`);
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Rules", href: `/rules` },
        { label: loadingRule ? 'Edit Rule' : (ruleData?.title || ruleId) }
    ];

    if (
        (loadingRule && !ruleData)) {
        return <p>Loading data...</p>;
    }

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
                    <RuleForm
                    initialData={ruleData}
                    onSubmit={handleUpdateRule}
                    onCancel={handleCancel}
                    submitLabel="Update Rule"
                    isLoading={isSaving}
                    />

                ) : (
                    <p>Rule data could not be loaded or project details are missing.</p>
                )}
            </div>
        </>
    );
};

export default EditRulePage;