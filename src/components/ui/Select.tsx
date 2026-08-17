import { type SelectHTMLAttributes, forwardRef } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, className = '', children, ...rest }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5 text-soft">{label}</label>}
      <select
        ref={ref}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[rgb(var(--surface-2))] border border-app text-[rgb(var(--text))] text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 ${error ? 'border-red-500' : ''} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';
