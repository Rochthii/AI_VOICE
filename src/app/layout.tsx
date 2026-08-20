import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHI VOICE — Thuyết Minh Viên Giọng Nói AI Địa Đạo Củ Chi",
  description: "Web App (PWA) thuyết minh viên giọng nói AI thông minh tại Di tích Lịch sử Quốc gia Đặc biệt Địa đạo Củ Chi — Thiết kế Sonic Monolith, chạy ngầm mượt mà cả khi mất 100% sóng dưới lòng đất.",
  applicationName: "CHI VOICE",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CHI VOICE"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0D0E11"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark bg-tunnel-base text-tunnel-chalk h-full overflow-hidden">
      <body className="h-full w-full overflow-hidden antialiased select-none touch-manipulation bg-tunnel-base">
        {children}
      </body>
    </html>
  );
}
