import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CopyButton from '../common/CopyButton';
import { BoltIcon, ClockIcon, DocumentDuplicateIcon, TrashIcon, PencilIcon, BookOpenIcon } from '@heroicons/react/24/outline';

// Tipo personalizado para una regla existente
interface Rule {
    id: string;
    title: string;
    content: string;
    language?: string;
    version?: string;
    createdAt: string;
    updatedAt: string;
}

interface RulesTableProps {
    rules: Rule[];
    onEdit: (item: Rule) => void;
    onDelete: (id: string, name: string) => Promise<void>;
    loading?: boolean;
    deletingRules?: Set<string>;
}

const RulesTable: React.FC<RulesTableProps> = ({ rules, onEdit, onDelete, loading, deletingRules = new Set() }) => {
    const [rulesWithStats, setRulesWithStats] = useState<Rule[]>([]);

    useEffect(() => {
        setRulesWithStats(rules);
    }, [rules]);

    
    // Función para generar bandera de idioma
    const renderLanguageFlag = (language?: string) => {
        if (!language) {
            return null;
        }

        const langParts = language.split('-');
        const countryOrLangCode = langParts.length > 1 ? langParts[1].toLowerCase() : langParts[0].toLowerCase();
        const flagUrl = countryOrLangCode.length === 2 ? `https://flagcdn.com/16x12/${countryOrLangCode}.png` : `https://flagcdn.com/16x12/xx.png`;

        return (
            <div className="flex items-center space-x-1 ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700" title={`Language: ${language}`}>
                <img
                    src={flagUrl}
                    alt={`${language} flag`}
                    className="w-4 h-3 object-cover rounded-sm border border-gray-300 dark:border-gray-500"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://flagcdn.com/16x12/xx.png'; // Fallback
                        target.onerror = null;
                    }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300">{language.toUpperCase()}</span>
            </div>
        );
    };

    if (loading && rules.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rulesWithStats.map((item: Rule) => (
                <div key={item.id} className="group relative">
                    {/* Background blur and gradient effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/80 dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-900/80 backdrop-blur-xl rounded-2xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50/20 via-transparent to-purple-50/20 dark:from-brand-950/10 dark:via-transparent dark:to-purple-950/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Glassmorphism card */}
                    <div className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/40 shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:scale-[1.02]">

                        {/* Header with gradient and rule type badge */}
                        <div className="relative p-6 pb-0 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-white/50 via-white/30 to-white/50 dark:from-gray-800/50 dark:via-gray-700/30 dark:to-gray-800/50">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0 pr-16">

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300 line-clamp-2" title={item.title}>
                                        {item.title}
                                    </h3>

                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100/50 dark:bg-gray-700/50 px-2 py-1 rounded-lg backdrop-blur-sm" title={item.title}>
                                            {item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}
                                        </span>
                                        <CopyButton textToCopy={item.title} />
                                    </div>

                                    {/* Language and version indicators */}
                                    <div className="flex items-center space-x-2">
                                        {renderLanguageFlag(item.language)}
                                        {item.version && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                                                v{item.version}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons with glassmorphism */}
                                <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="relative p-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-700/40 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-110"
                                        aria-label="Edit Rule"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!deletingRules.has(item.id)) {
                                                onDelete(item.id, item.title);
                                            }
                                        }}
                                        disabled={deletingRules.has(item.id)}
                                        className={`relative p-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300 hover:scale-110 ${deletingRules.has(item.id)
                                            ? "text-gray-400 cursor-not-allowed opacity-50"
                                            : "text-red-500 hover:text-red-700 dark:hover:text-red-300"
                                            }`}
                                        aria-label={deletingRules.has(item.id) ? "Deleting..." : "Delete Rule"}
                                        title={deletingRules.has(item.id) ? "Deleting rule..." : "Delete rule"}
                                    >
                                        {deletingRules.has(item.id) ? (
                                            <div className="w-4 h-4 flex items-center justify-center">
                                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <TrashIcon className="w-4 h-4" />
                                        )}
                                        {!deletingRules.has(item.id) && (
                                            <div className="absolute inset-0 bg-red-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content section */}
                        <div className="relative p-6 pt-0 space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3" title={item.content}>
                                {item.content || 'No content provided'}
                            </p>

                            {/* Stats and actions section */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-gray-700/30">
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <Link
                                    href={`/rules/${item.id}`}
                                    className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 group/link"
                                    title="View Rule Details"
                                >
                                    <BookOpenIcon className="w-4 h-4 group-hover/link:scale-110 transition-transform duration-200" />
                                    <span className="font-medium">View</span>
                                </Link>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute top-4 left-4 w-6 h-6 bg-gradient-to-br from-brand-200/20 to-purple-200/20 dark:from-brand-800/10 dark:to-purple-800/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-800/10 dark:to-pink-800/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200"></div>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-200/20 to-purple-200/20 dark:from-brand-800/10 dark:to-purple-800/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"></div>
                </div>
            ))}
            {rules.length === 0 && !loading && (
                <div className="col-span-full">
                    <div className="text-center py-16">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl"></div>
                            <div className="relative p-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-white/30 dark:border-gray-700/40 shadow-lg">
                                <DocumentDuplicateIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Rules Found</h3>
                                <p className="text-gray-500 dark:text-gray-400">No rules have been created for this project yet.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RulesTable;