
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ruleService } from "@/services/api";
import Breadcrumb from "@/components/common/PageBreadCrumb";
import { showErrorToast } from "@/utils/toastUtils";
import RuleForm from "@/components/form/RuleForm";

const ViewRulePage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const ruleId = params.ruleId as string;
    const [ruleData, setRuleData] = useState<any | null>(null);
    const [loadingRule, setLoadingRule] = useState<boolean>(true);

    const handleCancel = () => {
        router.push(`/rules`);
    };

    useEffect(() => {
        if (ruleId) {
            setLoadingRule(true);
            ruleService
                .findOne(ruleId)
                .then((data) => {
                    setRuleData(data);
                })
                .catch((err) => {
                    console.error("Error fetching rule data:", err);
                    setRuleData(null);
                })
                .finally(() => setLoadingRule(false));
        }
    }, [ruleId]);

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Rules", href: "/rules" },
        { label: loadingRule ? "View Rule" : ruleData?.title || ruleId },
    ];

    if (loadingRule) return <p>Loading rule…</p>;
    if (!ruleData) return <p>Rule not found.</p>;

    return (
        <>
            <Breadcrumb crumbs={breadcrumbs} />

            <div className="my-6">
                <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                    View Rule:{" "}
                    <span className="text-indigo-600 dark:text-indigo-400">
                        {ruleData.title}
                    </span>
                </h2>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6">
                <RuleForm
                    initialData={ruleData}
                    onCancel={handleCancel}
                    isLoading={false}
                    readOnly={true} 
                />
            </div>
        </>
    );
};

export default ViewRulePage;
