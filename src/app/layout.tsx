import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "메모집 | 베트남 패스트트랙 필요할까?",
  description: "베트남 공항 입국 혼잡도 분석 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
