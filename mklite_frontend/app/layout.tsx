import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// IMPORTAMOS NUESTRO HEADER y FOOTER
import Header from './components/Header';
import Footer from './components/Footer';
import Providers from './providers';
import SupportChatWidget from './components/SupportChatWidget';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MERKADO LITE | Tienda Online",
  description: "Tu supermercado de calidad a la puerta de tu casa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // AGREGADO: suppressHydrationWarning aquí también
    <html lang="es" suppressHydrationWarning={true}>
      <body
        // MANTENIDO: suppressHydrationWarning aquí
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          {children}
          <SupportChatWidget />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}