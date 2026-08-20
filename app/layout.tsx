import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GymPro SaaS — Multi-Tenant Gym Management',
  description: 'Production multi-tenant gym management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="min-h-screen w-full m-0 p-0 bg-slate-900 font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}