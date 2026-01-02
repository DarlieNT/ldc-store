import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { getSiteSetting } from "@/lib/db/queries";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteSetting('siteName') || 'LDC Shop';
  const siteDescription = await getSiteSetting('siteDescription') || 'Virtual goods shop for Linux DO ecosystem';

  return {
    title: siteName,
    description: siteDescription,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
