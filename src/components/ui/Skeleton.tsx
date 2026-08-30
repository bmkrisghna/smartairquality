interface Props {
  className?: string;
  lines?: number;
}

export const Skeleton = ({ className = '', lines = 1 }: Props) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="skeleton h-4 rounded-lg" style={{ width: `${100 - i * 15}%` }} />
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-6 w-1/3 rounded-lg" />
    <div className="skeleton h-32 rounded-xl" />
    <div className="skeleton h-4 w-2/3 rounded-lg" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="card p-5">
    <div className="skeleton h-6 w-1/4 rounded-lg mb-4" />
    <div className="skeleton h-64 rounded-xl" />
  </div>
);
