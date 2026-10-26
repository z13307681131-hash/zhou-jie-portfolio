import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./responsive.css";

export const viewport: Viewport = {width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#070708"};

export const metadata: Metadata = {
  title: "周杰 · Brand Planner / Visual Designer",
  description: "周杰的求职作品集，涵盖品牌策划、视觉系统、AI 设计、平面、包装、UI、H5 与商业传播。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
