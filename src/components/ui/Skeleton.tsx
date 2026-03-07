
import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
    );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
    return (
        <div className="w-full space-y-4">
            <div className="flex gap-4 mb-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-100 grid grid-cols-5 gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="p-4 border-b border-slate-50 grid grid-cols-5 gap-4 last:border-0">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
};
