import { ReactNode, useEffect } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';
type Variant = 'light' | 'dark';

const sizeClass: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const variantStyles: Record<Variant, { panel: string; title: string; close: string }> = {
  light: {
    panel: 'bg-white text-gray-900',
    title: 'text-gray-900',
    close: 'text-gray-400 hover:text-gray-600',
  },
  dark: {
    panel: 'bg-gray-800 border border-gray-700 text-white',
    title: 'text-white',
    close: 'text-gray-400 hover:text-white',
  },
};

interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: Size;
  variant?: Variant;
  /** Extra classes applied to the scrollable content area */
  contentClassName?: string;
}

export default function Dialog({
  title,
  onClose,
  children,
  size = 'lg',
  variant = 'light',
  contentClassName = '',
}: DialogProps) {
  const styles = variantStyles[variant];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      dir="rtl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${sizeClass[size]} max-h-[90vh] flex flex-col rounded-2xl shadow-2xl ${styles.panel}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-black/10">
          <h2 className={`text-lg font-bold ${styles.title}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`text-xl leading-none transition-colors ${styles.close}`}
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={`overflow-y-auto px-6 py-5 flex-1 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
