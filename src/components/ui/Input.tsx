import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, icon, hint, className = '', ...rest }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-soft">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full ${icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 rounded-xl bg-[rgb(var(--surface-2))] border border-app text-[rgb(var(--text))] placeholder:text-muted text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 ${error ? 'border-red-500' : ''} ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
