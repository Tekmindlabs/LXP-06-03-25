import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { PreferencesProvider } from '@/contexts/preferences-context';
import { ThemeProvider } from '@/providers/theme-provider';
import { TRPCProvider } from '@/trpc/provider';
import { AppShellWrapper } from "@/components/layout/app-shell-wrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AIVY LXP",
    template: "%s | AIVY LXP",
  },
  description: "AIVY Learning Experience Platform - Engage. Inspire. Elevate.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <TRPCProvider>
          <PreferencesProvider>
            <ThemeProvider>
              <Providers>
                <AppShellWrapper>{children}</AppShellWrapper>
              </Providers>
            </ThemeProvider>
          </PreferencesProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
