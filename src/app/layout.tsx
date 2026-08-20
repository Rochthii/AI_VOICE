import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHI VOICE — Thuyết Minh Viên Giọng Nói AI Địa Đạo Củ Chi",
  description: "Web App (PWA) thuyết minh viên giọng nói AI thông minh tại Di tích Lịch sử Quốc gia Đặc biệt Địa đạo Củ Chi — Thiết kế Heritage Monolith, chạy ngầm mượt mà cả khi mất 100% sóng dưới lòng đất.",
  applicationName: "CHI VOICE",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
  themeColor: "#FAF7F2"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="bg-[#E8E2D5] text-[#1C1917] h-full overflow-hidden">
      <body className="h-full w-full overflow-hidden antialiased select-none touch-manipulation bg-[#E8E2D5]">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('[CHI PWA] ServiceWorker registered with scope:', reg.scope);
                  }).catch(function(err) {
                    console.warn('[CHI PWA] ServiceWorker registration failed:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
