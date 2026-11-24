import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/context/auth-context';
import { NotificationProvider } from '@/components/context/notification-context';
import { Navbar } from '@/components/navigation/navbar';
import { MobileNav } from '@/components/navigation/mobile-nav';

export const metadata: Metadata = {
  title: 'FLOODGUARD AI — See the danger before it becomes an accident',
  description:
    'An AI-powered geospatial platform for detecting, reporting and prioritizing road hazards, waterlogging and flood-related risks.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-slate-950 text-slate-100">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-white pb-16 md:pb-0">
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <MobileNav />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
