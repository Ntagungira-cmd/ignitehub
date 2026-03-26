import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export const Logo = ({ className = '', showText = true, size = 'md', href = '/' }: LogoProps) => {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-8 rounded-lg',
      text: 'text-lg',
      font: 'text-base',
    },
    md: {
      container: 'w-10 h-10 rounded-xl',
      text: 'text-xl',
      font: 'text-xl',
    },
    lg: {
      container: 'w-12 h-12 rounded-2xl',
      text: 'text-2xl',
      font: 'text-2xl',
    },
  };

  const { container, text, font } = sizeClasses[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${container} bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20`}>
        <span className={`text-white font-bold ${text} italic`}>I</span>
      </div>
      {showText && (
        <span className={`${font} font-extrabold tracking-tight text-slate-900`}>
          Ignite<span className="text-brand-600">Hub</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
