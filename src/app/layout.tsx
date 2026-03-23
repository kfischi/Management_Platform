import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBH Admin - Agency Management Platform",
  description: "פלטפורמת ניהול סוכנות מלאה",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
