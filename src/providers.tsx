'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/feedback/toast';
import { ModalProvider } from '@/components/ui/feedback/modal';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <ModalProvider>
        {children}
      </ModalProvider>
      <ToastProvider
        position="top-right"
        toastOptions={{
          duration: 5000,
          className: 'sonner-toast',
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
          },
        }}
      />
    </>
  );
}

/**
 * Usage:
 * 
 * In your root layout.tsx:
 * 
 * ```tsx
 * import { Providers } from '@/providers';
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <Providers>
 *           {children}
 *         </Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
