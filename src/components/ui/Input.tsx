import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  suffix,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          className={`
            w-full px-3 py-2 text-sm
            border border-gray-300 rounded-lg
            bg-white text-gray-900
            focus:outline-none focus:ring-2 focus:ring-golf-green focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${suffix ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-xs text-gray-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 text-sm
          border border-gray-300 rounded-lg
          bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-golf-green focus:border-transparent
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-3 py-2 text-sm
          border border-gray-300 rounded-lg
          bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-golf-green focus:border-transparent
          resize-none
          ${className}
        `}
        {...props}
      />
    </div>
  );
};
