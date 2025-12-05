import React, { useState } from 'react';

interface RuleFormProps {
  projectId: string;
  onCreate: (data: {
    title: string;
    content: string;
    version: string;
    language: string;
  }) => Promise<void>;
  onUpdate?: (data: any) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  title: string;
  content: string;
  version: string;
  language: string;
}

const RuleForm: React.FC<RuleFormProps> = ({
  onCreate,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    version: '1.0',
    language: 'en-US',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;
    if (!formData.content.trim()) return;
    if (!formData.language.trim()) return;
    if (!formData.version.trim()) return;

    try {
      setIsLoading(true);
      await onCreate(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ✅ Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={handleInputChange('title')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                     rounded-md shadow-sm focus:outline-none focus:ring-2
                     focus:ring-indigo-500 focus:border-indigo-500
                     dark:bg-gray-700 dark:text-white"
          placeholder="Enter rule title"
          required
        />
      </div>

      {/* ✅ Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content *
        </label>
        <textarea
          value={formData.content}
          onChange={handleInputChange('content')}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                     rounded-md shadow-sm focus:outline-none focus:ring-2
                     focus:ring-indigo-500 focus:border-indigo-500
                     dark:bg-gray-700 dark:text-white"
          placeholder="Enter rule content"
          required
        />
      </div>

      {/* ✅ Language + Version Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ✅ Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language *
          </label>
          <select
            value={formData.language}
            onChange={handleInputChange('language')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                       rounded-md shadow-sm focus:outline-none focus:ring-2
                       focus:ring-indigo-500 focus:border-indigo-500
                       dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="en-US">en-US</option>
            <option value="es-ES">es-ES</option>
            <option value="fr-FR">fr-FR</option>
            <option value="de-DE">de-DE</option>
            <option value="pt-PT">pt-PT</option>
          </select>
        </div>

        {/* ✅ Version */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Version *
          </label>
          <input
            type="text"
            value={formData.version}
            onChange={handleInputChange('version')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                       rounded-md shadow-sm focus:outline-none focus:ring-2
                       focus:ring-indigo-500 focus:border-indigo-500
                       dark:bg-gray-700 dark:text-white"
            placeholder="e.g., 1.0"
            required
          />
        </div>
      </div>

      {/* ✅ Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                     bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                     rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600
                     focus:outline-none focus:ring-2 focus:ring-offset-2
                     focus:ring-indigo-500"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600
                     border border-transparent rounded-md shadow-sm
                     hover:bg-indigo-700 focus:outline-none focus:ring-2
                     focus:ring-offset-2 focus:ring-indigo-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Create Rule'}
        </button>
      </div>
    </form>
  );
};

export default RuleForm;
