import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export function Logo({ className, showTagline = false }: LogoProps) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <Image
        src="/logo.png"
        alt="Aivy LXP Logo"
        width={140}
        height={50}
        priority
        className="transition-transform duration-300 hover:scale-105"
      />
      {showTagline && (
        <p className="mt-2 text-sm text-medium-gray dark:text-gray-300 text-center">
          Engage. Inspire. Elevate
        </p>
      )}
    </div>
  );
} 