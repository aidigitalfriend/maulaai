'use client';

import { Template } from '../types';
import { BRAND_COLORS, TEMPLATES } from '../constants';

interface TemplateSelectorProps {
  isOpen: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onTemplateSelect: (template: Template) => void;
}

export default function TemplateSelector({
  isOpen,
  selectedCategory,
  onCategoryChange,
  onTemplateSelect,
}: TemplateSelectorProps) {
  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
  const filteredTemplates = selectedCategory === 'All' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className={`${BRAND_COLORS.border} border-b max-h-80 overflow-hidden flex flex-col`}>
      {/* Category Tabs */}
      <div className={`flex overflow-x-auto p-2 gap-1 ${BRAND_COLORS.border} border-b flex-shrink-0`}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? BRAND_COLORS.btnPrimary
                : `${BRAND_COLORS.textSecondary} ${BRAND_COLORS.bgHover}`
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Templates Grid */}
      <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          {filteredTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template)}
              className={`p-2.5 rounded-xl text-left transition-all hover:scale-[1.02] ${BRAND_COLORS.bgSecondary} ${BRAND_COLORS.bgHover} border ${BRAND_COLORS.border} hover:border-cyan-500/50 group`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg group-hover:scale-110 transition-transform">{template.icon}</span>
                <div>
                  <p className={`text-xs font-medium ${BRAND_COLORS.text}`}>{template.name}</p>
                  <p className={`text-[10px] ${BRAND_COLORS.textMuted}`}>{template.category}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
