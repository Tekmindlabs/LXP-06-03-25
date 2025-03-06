'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/feedback/toast';
import { ModalProvider } from '@/components/ui/feedback/modal';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers component that wraps the application with all necessary context providers.
 * 
 * This component combines all the providers needed for the UI components to function properly.
 * The order of providers matters in some cases, so be careful when adding new providers.
 * 
 * @param {ReactNode} children - The child components to be wrapped with the providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
      <Toaster />
    </ToastProvider>
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