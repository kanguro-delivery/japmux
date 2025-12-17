
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { analysisPlanService, ruleService } from "@/services/api";
import Breadcrumb from "@/components/common/PageBreadCrumb";
import { showErrorToast } from "@/utils/toastUtils";
import RuleForm from "@/components/form/RuleForm";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import AnalysisPlanForm from "@/components/form/analysisPlanForm";

const ViewAnalysisPlanPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const analysisPlanId = params.analysisPlanId as string;
    const [analysisPlanData, setanalysisPlanData] = useState<any | null>(null);
    const [loadingRule, setLoadingRule] = useState<boolean>(true);

    const handleCancel = () => {
        router.push(`/analysis-plan`);
    };

    useEffect(() => {
        if (analysisPlanId) {
            setLoadingRule(true);
            analysisPlanService
                .findOne(analysisPlanId)
                .then((data) => {
                    setanalysisPlanData(data);
                })
                .catch((err) => {
                    console.error("Error fetching rule data:", err);
                    showErrorToast(getApiErrorMessage(err, "Failed to load analysis plan data."));
                    setanalysisPlanData(null);
                })
                .finally(() => setLoadingRule(false));
        }
    }, [analysisPlanId]);

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Analysis Plan", href: "/analysis-plan" },
        { label: loadingRule ? "View Analysis Plan" : analysisPlanData?.title || analysisPlanId },
    ];

    if (loadingRule) return <p>Loading rule…</p>;
    if (!analysisPlanData) return <p>analysis Plan not found.</p>;

    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />

            <div className="my-6">
                <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                    View Rule:{" "}
                    <span className="text-indigo-600 dark:text-indigo-400">
                        {analysisPlanData.title}
                    </span>
                </h2>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6">
                <AnalysisPlanForm
                    initialData={analysisPlanData}
                    onCancel={handleCancel}
                    isLoading={false}
                    readOnly={true} 
                />
            </div>
        </>
    );
};

export default ViewAnalysisPlanPage;
