'use client';

import './globals.css';
import Layout from '@/components/Layout';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body style={{ margin: 0 }}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
