import { type ReactNode } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export const Card = ({ title, subtitle, children, className = '', action, noPadding }: Props) => (
  <div className={`card ${noPadding ? '' : 'p-5'} ${className}`}>
    {(title || action) && (
      <div className="flex items-start justify-between mb-4">
        <div>
          {title && <h3 className="font-semibold text-lg" style={{ color: 'rgb(var(--text))' }}>{title}</h3>}
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);
