import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    CodeBracketIcon,
    ListBulletIcon,
    DocumentTextIcon,
    VariableIcon,
    ClipboardDocumentIcon,
    ArrowPathIcon,
    LinkIcon,
    PhotoIcon,
    TableCellsIcon,
    ClipboardIcon,
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    QuestionMarkCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { PromptAssetData } from '@/components/tables/PromptAssetsTable';
import { Tooltip } from 'react-tooltip';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import TemplateSelector from './TemplateSelector';
import { PromptTemplate } from '@/config/promptTemplates';
import RequiredCheckbox from './RequiredCheckbox';

/**
 * Props para el componente PromptEditor
 * @interface PromptEditorProps
 * @property {string} value - El valor actual del editor
 * @property {(value: string) => void} onChange - Función llamada cuando el valor cambia
 * @property {string} [placeholder] - Texto de placeholder para el editor
 * @property {number} [rows] - Número de filas visibles del editor
 * @property {PromptAssetData[]} [assets] - Lista de assets disponibles para insertar
 * @property {boolean} [readOnly] - Si el editor es de solo lectura
 * @property {boolean} [showHistory] - Si se muestra el historial de cambios
 * @property {string} [id] - ID único para el editor
 * @property {string} [aria-label] - Etiqueta ARIA para accesibilidad
 * @property {string} [aria-describedby] - ID del elemento que describe el editor
 * @property {React.ReactNode} [extraToolbarButtons] - Botones adicionales para la barra de herramientas
 * @property {string} [className] - Clase adicional para el editor
 */
interface AnalysisPlanEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    assets?: PromptAssetData[];
    readOnly?: boolean;
    showHistory?: boolean;
    id?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
    extraToolbarButtons?: React.ReactNode;
    className?: string;
}

interface HistoryEntry {
    text: string;
    timestamp: number;
}

// Componentes memoizados para los botones de la barra de herramientas
const ToolbarButton = React.memo(({
    onClick,
    icon: Icon,
    label,
    disabled = false,
    tooltip,
    className = "",
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby
}: {
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    disabled?: boolean;
    tooltip?: string;
    className?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 ${className}`}
        data-tooltip-id={`tooltip-${label}`}
        data-tooltip-content={tooltip}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedby}
        role="button"
    >
        <Icon className="w-4 h-4 inline-block mr-1" aria-hidden="true" />
        <span>{label}</span>
    </button>
));

const AnalysisPlanEditor: React.FC<AnalysisPlanEditorProps> = React.memo(({
    value,
    onChange,
    placeholder = "Enter text here...",
    rows = 18,
    assets = [],
    readOnly = false,
    showHistory = true,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    extraToolbarButtons,
    className
}) => {
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const variableButtonRef = useRef<HTMLButtonElement>(null);
    const [showAssetMenu, setShowAssetMenu] = useState(false);
    const [showVariableMenu, setShowVariableMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
    const [isUndoRedo, setIsUndoRedo] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [focusedButton, setFocusedButton] = useState<string | null>(null);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    // Memoizar los assets para evitar re-renders innecesarios
    const memoizedAssets = useMemo(() => assets, [assets]);

    // Función memoizada para manejar cambios de texto
    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isUndoRedo) {
            onChange(e.target.value);

            // Implementar autoguardado
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            setIsAutoSaving(true);
            autoSaveTimeoutRef.current = setTimeout(() => {
                setIsAutoSaving(false);
            }, 1000);
        }
    }, [onChange, isUndoRedo]);

    // Función memoizada para manejar el menú contextual
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowAssetMenu(true);
    }, []);

    // Función memoizada para seleccionar assets
    const handleAssetSelect = useCallback((asset: PromptAssetData) => {
        if (editorRef.current) {
            const textarea = editorRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const variable = `{{${asset.key}}}`;

            const newText = text.substring(0, start) + variable + text.substring(end);
            onChange(newText);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length, start + variable.length);
            }, 0);
        }
        setShowAssetMenu(false);
    }, [onChange]);

    // Función memoizada para insertar plantillas
    const insertTemplate = useCallback((template: string) => {
        if (editorRef.current) {
            const textarea = editorRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const newText = text.substring(0, start) + template + text.substring(end);
            onChange(newText);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + template.length, start + template.length);
            }, 0);
        }
    }, [onChange]);

    // Funciones memoizadas para las acciones de la barra de herramientas
    const handleFormatText = useCallback(() => {
        if (editorRef.current) {
            const textarea = editorRef.current;
            const text = textarea.value;

            // Mejorar el formato del texto
            const formattedText = text
                // Eliminar espacios múltiples
                .replace(/\s+/g, ' ')
                // Eliminar espacios al inicio y final de cada línea
                .split('\n')
                .map(line => line.trim())
                .join('\n')
                // Eliminar líneas vacías múltiples
                .replace(/\n{3,}/g, '\n\n')
                // Eliminar espacios al inicio y final del texto
                .trim();

            onChange(formattedText);

            // Mostrar mensaje de éxito
            showSuccessToast('Text formatted successfully');
        }
    }, [onChange]);

    const handleClearText = useCallback(() => {
        if (window.confirm('Are you sure you want to clear the text?')) {
            onChange('');
        }
    }, [onChange]);

    const handleCopyText = useCallback(() => {
        if (editorRef.current) {
            const text = editorRef.current.value;
            navigator.clipboard.writeText(text)
                .then(() => {
                    showSuccessToast('Text copied to clipboard');
                })
                .catch((error) => {
                    console.error('Error copying text:', error);
                    showErrorToast('Failed to copy text');
                });
        }
    }, []);

    const handlePasteFormatted = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (editorRef.current) {
                const textarea = editorRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const currentText = textarea.value;

                // Formatear el texto pegado
                const formattedPastedText = text
                    // Eliminar espacios múltiples
                    .replace(/\s+/g, ' ')
                    // Eliminar espacios al inicio y final de cada línea
                    .split('\n')
                    .map(line => line.trim())
                    .join('\n')
                    // Eliminar líneas vacías múltiples
                    .replace(/\n{3,}/g, '\n\n')
                    // Eliminar espacios al inicio y final del texto
                    .trim();

                const newText = currentText.substring(0, start) + formattedPastedText + currentText.substring(end);
                onChange(newText);

                // Mostrar mensaje de éxito
                showSuccessToast('Text pasted and formatted successfully');

                // Mantener el foco en el editor y posicionar el cursor después del texto pegado
                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + formattedPastedText.length, start + formattedPastedText.length);
                }, 0);
            }
        } catch (err) {
            console.error('Error pasting text:', err);
            showErrorToast('Failed to paste text');
        }
    }, [onChange]);

    // Funciones memoizadas para el historial
    const handleUndo = useCallback(() => {
        if (currentHistoryIndex > 0) {
            setIsUndoRedo(true);
            const newIndex = currentHistoryIndex - 1;
            setCurrentHistoryIndex(newIndex);
            onChange(history[newIndex].text);
            setIsUndoRedo(false);
        }
    }, [currentHistoryIndex, history, onChange]);

    const handleRedo = useCallback(() => {
        if (currentHistoryIndex < history.length - 1) {
            setIsUndoRedo(true);
            const newIndex = currentHistoryIndex + 1;
            setCurrentHistoryIndex(newIndex);
            onChange(history[newIndex].text);
            setIsUndoRedo(false);
        }
    }, [currentHistoryIndex, history, onChange]);

    // Atajos de teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        if (e.shiftKey) {
                            e.preventDefault();
                            handleRedo();
                        } else {
                            e.preventDefault();
                            handleUndo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        handleRedo();
                        break;
                    case 'b':
                        e.preventDefault();
                        insertTemplate('**texto en negrita**');
                        break;
                    case 'i':
                        e.preventDefault();
                        insertTemplate('*texto en cursiva*');
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, insertTemplate]);

    // Actualizar historial
    useEffect(() => {
        if (value && !isUndoRedo) {
            setHistory(prev => [...prev, { text: value, timestamp: Date.now() }]);
            setCurrentHistoryIndex(prev => prev + 1);
        }
    }, [value, isUndoRedo]);

    // Limpiar timeout de autoguardado
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    const handleTemplateSelect = useCallback((template: PromptTemplate) => {
        if (editorRef.current) {
            const textarea = editorRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const newText = text.substring(0, start) + template.content + text.substring(end);
            onChange(newText);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + template.content.length, start + template.content.length);
            }, 0);
        }
    }, [onChange]);

    // Click handler para el botón de variables
    const handleVariableButtonClick = () => {
        const variableName = window.prompt("Enter the name for the variable (e.g., 'user_name'):");

        if (variableName && variableName.trim() !== '') {
            const sanitizedName = variableName.trim().replace(/\s+/g, '_');
            const variableToInsert = `{{${sanitizedName}}}`;

            if (editorRef.current) {
                const textarea = editorRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;

                const newText = text.substring(0, start) + variableToInsert + text.substring(end);
                onChange(newText);

                // Colocar el cursor después de la variable insertada
                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + variableToInsert.length, start + variableToInsert.length);
                }, 0);
            }
        }
    };

    // Cerrar menú si se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showVariableMenu) {
                setShowVariableMenu(false);
            }
            if (showAssetMenu) {
                setShowAssetMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showVariableMenu, showAssetMenu]);

    return (
        <div
            className="space-y-2"
            role="region"
            aria-label={ariaLabel || "Editor of prompt"}
            aria-describedby={ariaDescribedby}
        >
            {/* Barra de herramientas mejorada */}
            <div
                className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg shadow-sm"
                role="toolbar"
                aria-label="Editor tools"
            >
                {/* Basic Templates Group */}
                <div className="flex gap-2" role="group" aria-label="Basic templates">
                    <ToolbarButton
                        onClick={() => setShowTemplateSelector(true)}
                        icon={DocumentTextIcon}
                        label="Templates"
                        disabled={readOnly}
                        tooltip="Insert template"
                        aria-label="Insert template"
                        aria-describedby="template-desc"
                    />
                    <ToolbarButton
                        onClick={() => insertTemplate('```\n\n```')}
                        icon={CodeBracketIcon}
                        label="Code Block"
                        disabled={readOnly}
                        tooltip="Insert code block"
                        aria-label="Insert code block"
                        aria-describedby="template-code-desc"
                    />
                    <ToolbarButton
                        onClick={() => insertTemplate('- \n- \n- ')}
                        icon={ListBulletIcon}
                        label="List"
                        disabled={readOnly}
                        tooltip="Insert list"
                        aria-label="Insert list"
                        aria-describedby="template-list-desc"
                    />
                </div> 

                {/* Markdown Elements Group */}
                 <div className="flex gap-2" role="group" aria-label="Markdown elements">
                    <ToolbarButton
                        onClick={() => insertTemplate('| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |')}
                        icon={TableCellsIcon}
                        label="Table"
                        disabled={readOnly}
                        tooltip="Insert markdown table"
                        aria-label="Insert markdown table"
                        aria-describedby="template-table-desc"
                    />
                    <ToolbarButton
                        onClick={() => insertTemplate('[link text](https://example.com)')}
                        icon={LinkIcon}
                        label="Link"
                        disabled={readOnly}
                        tooltip="Insert markdown link"
                        aria-label="Insert markdown link"
                        aria-describedby="template-link-desc"
                    />
                </div> 

                {/* Utilities Group */}
                <div className="flex gap-2" role="group" aria-label="Utilities">
                    <ToolbarButton
                        onClick={handleFormatText}
                        icon={ArrowPathIcon}
                        label="Format"
                        disabled={readOnly}
                        tooltip="Format text"
                        aria-label="Format text"
                        aria-describedby="format-desc"
                    />
                    <ToolbarButton
                        onClick={handleCopyText}
                        icon={ClipboardIcon}
                        label="Copy All"
                        tooltip="Copy all text"
                        aria-label="Copy all text"
                        aria-describedby="copy-desc"
                    />
                    <ToolbarButton
                        onClick={handlePasteFormatted}
                        icon={ClipboardDocumentIcon}
                        label="Paste"
                        disabled={readOnly}
                        tooltip="Paste formatted text"
                        aria-label="Paste formatted text"
                        aria-describedby="paste-desc"
                    />
                    <ToolbarButton
                        onClick={handleClearText}
                        icon={ClipboardDocumentIcon}
                        label="Clear"
                        disabled={readOnly}
                        tooltip="Clear all text"
                        aria-label="Clear all text"
                        aria-describedby="clear-desc"
                        className="text-red-600 dark:text-red-400"
                    />
                </div>

                {/* History Controls */}
                {showHistory && (
                    <div className="flex gap-2" role="group" aria-label="History controls">
                        <ToolbarButton
                            onClick={handleUndo}
                            icon={ArrowUturnLeftIcon}
                            label="Undo"
                            disabled={readOnly || currentHistoryIndex <= 0}
                            tooltip="Undo last change (Ctrl+Z)"
                            aria-label="Undo last change"
                            aria-describedby="undo-desc"
                        />
                        <ToolbarButton
                            onClick={handleRedo}
                            icon={ArrowUturnRightIcon}
                            label="Redo"
                            disabled={readOnly || currentHistoryIndex >= history.length - 1}
                            tooltip="Redo last change (Ctrl+Y)"
                            aria-label="Redo last change"
                            aria-describedby="redo-desc"
                        />
                    </div>
                )}

                <div className="flex-grow"></div>

                {/* Insert Reference Buttons */}
                <div className="flex gap-2" role="group" aria-label="Insert references">
                    {extraToolbarButtons}
                </div>

                {/* Variables Button */}
                <div className="flex gap-2" role="group" aria-label="Variables">
                    <button
                        ref={variableButtonRef}
                        type="button"
                        onClick={handleVariableButtonClick}
                        disabled={readOnly}
                        className="px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                        data-tooltip-id="tooltip-variable"
                        data-tooltip-content="Insert a new variable placeholder"
                        aria-label="Insert a new variable placeholder"
                    >
                        <VariableIcon className="w-4 h-4 inline-block mr-1" aria-hidden="true" />
                        <span>Insert Variable</span>
                    </button>
                </div>
            </div>

            {/* Editor de texto mejorado */}
            <div className="relative">
                <textarea
                    ref={editorRef}
                    id="promptText"
                    value={value}
                    onChange={handleTextChange}
                    onContextMenu={handleContextMenu}
                    rows={rows}
                    readOnly={readOnly}
                    className={`w-full px-4 py-2 text-white bg-[#343541] border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-sm transition-shadow duration-200 hover:shadow-md font-mono ${className || ''}`}
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                    placeholder={placeholder}
                    aria-label={ariaLabel || "Editor of prompt"}
                    aria-describedby={ariaDescribedby}
                    aria-multiline="true"
                    aria-readonly={readOnly}
                    role="textbox"
                />
                {isAutoSaving && (
                    <div
                        className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm"
                        role="status"
                        aria-live="polite"
                    >
                        Guarding...
                    </div>
                )}
            </div>

            {/* Menú contextual de assets (clic derecho) - AHORA MUESTRA VARIABLES/ASSETS */}
            {showAssetMenu && (
                <div
                    className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700"
                    style={{
                        left: menuPosition.x,
                        top: menuPosition.y,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}
                    role="menu"
                    aria-label="Insert asset/variable menu"
                >
                    <div className="py-1">
                        {memoizedAssets.length > 0 ? (
                            memoizedAssets.map((asset) => (
                                <button
                                    key={asset.key}
                                    onClick={() => handleAssetSelect(asset)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    role="menuitem"
                                    aria-label={`Insert asset ${asset.name}`}
                                >
                                    {asset.name} ({asset.key})
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No assets available to insert.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Tooltips */}
            <Tooltip id="editor-help" />
            {
                memoizedAssets.map(asset => (
                    <Tooltip key={asset.key} id={`tooltip-${asset.key}`} />
                ))
            }

            {/* Descripciones ocultas para lectores de pantalla */}
            <div className="sr-only">
                <p id="template-basic-desc">Insert a basic AI assistant template</p>
                <p id="template-code-desc">Insert a markdown formatted code block</p>
                <p id="template-list-desc">Insert a bullet list</p>
                <p id="template-table-desc">Insert a markdown table</p>
                <p id="template-link-desc">Insert a markdown link</p>
                <p id="template-image-desc">Insert a markdown image</p>
                <p id="format-desc">Formatea el texto eliminando espacios extra y saltos de línea innecesarios</p>
                <p id="copy-desc">Copia todo el texto al portapapeles</p>
                <p id="paste-desc">Pega texto formateado desde el portapapeles</p>
                <p id="clear-desc">Borra todo el texto del editor</p>
                <p id="undo-desc">Undo last change (Ctrl+Z)</p>
                <p id="redo-desc">Redo last change (Ctrl+Y)</p>
                <p id="variable-desc">Insert a project variable in the text</p>
                <p id="help-desc">Muestra los atajos de teclado disponibles</p>
            </div>

            {/* Template Selector */}
            <TemplateSelector
                isOpen={showTemplateSelector}
                onClose={() => setShowTemplateSelector(false)}
                onSelect={handleTemplateSelect}
            />
        </div >
    );
});

AnalysisPlanEditor.displayName = 'PromptEditor';

export default AnalysisPlanEditor; 