import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next"

// onfigurar la fuente
const inter = Inter({ subsets: ['latin'] }); 

export const metadata: Metadata = {
  title: 'Generador de QR',
  description: 'Herramienta simple para crear códigos QR.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/*Aplicar fuente a body */}
      <body className={`${inter.className} bg-gray-50 min-h-screen`}> 
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}