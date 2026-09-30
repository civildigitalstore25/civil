import React, { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X, Check, Grid } from 'lucide-react';

interface IconPickerModalProps {
  value: string;
  onChange: (iconName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIZED_ICONS: Record<string, string[]> = {
  All: [],
  'Tech & Files': [
    'FileText', 'FileCheck', 'FileCode', 'Download', 'HardDrive', 'Cpu', 'Database',
    'Folder', 'Layers', 'Code', 'Terminal', 'Monitor', 'Smartphone', 'Box', 'Archive', 'Zap'
  ],
  'Engineering & Tools': [
    'Wrench', 'PenTool', 'Compass', 'Ruler', 'Settings', 'Sliders', 'Activity', 'Shield',
    'Lock', 'Unlock', 'CheckCircle', 'Star', 'Sparkles', 'Tag', 'Briefcase', 'Globe'
  ],
  'Badges & Status': [
    'Check', 'Info', 'AlertTriangle', 'HelpCircle', 'Award', 'BadgeCheck', 'CheckSquare',
    'TrendingUp', 'ThumbsUp', 'RefreshCw', 'Maximize', 'Minimize', 'Eye', 'DollarSign'
  ]
};

// Build list of available icons from Lucide
const ALL_LUCIDE_ICONS = Object.keys(LucideIcons).filter(
  (name) =>
    typeof (LucideIcons as any)[name] === 'object' ||
    typeof (LucideIcons as any)[name] === 'function'
);

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  value,
  onChange,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter icons based on category and search query
  const filteredIconNames = (
    selectedCategory === 'All'
      ? ALL_LUCIDE_ICONS
      : CATEGORIZED_ICONS[selectedCategory] || []
  ).filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    return <IconComponent className={className} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-[#F5A000] rounded-xl">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Select Feature Icon</h3>
              <p className="text-[11px] text-slate-500">Search and filter Lucide icons</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search icon name (e.g. Check, Shield, Star)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {Object.keys(CATEGORIZED_ICONS).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-72">
          {filteredIconNames.length > 0 ? (
            filteredIconNames.slice(0, 120).map((iconName) => {
              const isSelected = value === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    onClose();
                  }}
                  title={iconName}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-[#F5A000] bg-amber-50 text-[#F5A000] ring-2 ring-[#F5A000]/30'
                      : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {renderIcon(iconName, 'w-5 h-5')}
                  <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center group-hover:text-slate-900">
                    {iconName}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#F5A000] text-white rounded-full flex items-center justify-center text-[8px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-400 font-medium">
              No matching icons found for "{searchTerm}".
            </div>
          )}
        </div>

        {/* Selected Icon Preview & Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>Selected:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
              {renderIcon(value, 'w-4 h-4 text-[#F5A000]')}
              <span className="font-mono text-[11px] text-slate-800">{value}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
