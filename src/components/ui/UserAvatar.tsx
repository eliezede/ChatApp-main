import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  showBorder = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const nameInitial = name ? name.charAt(0).toUpperCase() : '?';

  // Generate a consistent color based on name
  const getAvatarColor = (name?: string) => {
    if (!name) return 'bg-slate-200 text-slate-500';
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-indigo-100 text-indigo-600',
      'bg-purple-100 text-purple-600',
      'bg-emerald-100 text-emerald-600',
      'bg-rose-100 text-rose-600',
      'bg-amber-100 text-amber-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClasses = getAvatarColor(name);
  const showImage = src && !hasError;

  return (
    <div 
      className={`
        relative rounded-full flex items-center justify-center overflow-hidden shrink-0
        ${sizeClasses[size]} 
        ${!showImage ? colorClasses : 'bg-slate-100'} 
        ${showBorder ? 'ring-2 ring-white dark:ring-slate-900 shadow-sm' : ''}
        ${className}
      `}
    >
      {showImage ? (
        <img 
          src={src} 
          alt={name || 'User'} 
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : name ? (
        <span className="font-black tracking-tighter">{nameInitial}</span>
      ) : (
        <UserIcon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 20} strokeWidth={2.5} />
      )}
    </div>
  );
};

