import React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { Suspense } from 'react';
import Head from 'next/head';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guardian Angel LISA - Telegram Mini App Game',
  description:
    'Tap-to-earn mining game with 3D RPG adventure featuring Guardian Angel Lisa on TON blockchain',
  generator: 'v0.app',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <Head>
          <script src="https://telegram.org/js/telegram-web-app.js" async />
        </Head>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  );
}
