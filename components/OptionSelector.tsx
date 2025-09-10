
import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface OptionSelectorProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({ label, options, selectedValue, onChange, disabled }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className={`grid grid-cols-${options.length} gap-2 bg-gray-900 p-1 rounded-lg border border-gray-700 ${disabled ? 'opacity-50' : ''}`}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
              selectedValue === option.value
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-300 hover:bg-gray-700'
            } ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
