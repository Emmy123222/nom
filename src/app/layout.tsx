import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WalletProvider } from '@/components/providers/WalletProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import ParticleBackground from '@/components/ui/ParticleBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nomad City AI Agent - Your Gateway to Network States',
  description: 'AI-powered assistant for digital nomads navigating crypto cities and network states. Discover, join, and thrive in decentralized communities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WalletProvider>
            <ParticleBackground />
            <div className="relative z-10">
              {children}
            </div>
            <Toaster position="top-right" />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}