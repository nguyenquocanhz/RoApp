import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/ecosystem/theme.context";
import { AuthProvider } from "@/ecosystem/auth.context";
import { AppStateProvider } from "@/ecosystem/appState.context";
import { NotificationProvider } from "@/ecosystem/notification.context";
import Navbar from "@/ui/components/Navbar/Navbar";
import NotificationContainer from "@/ui/components/Notification/Notification";
import MaintenanceGuard from "@/ui/components/MaintenanceGuard/MaintenanceGuard";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rổ Ứng Dụng - Chia sẻ APK, IPA & Mã nguồn Website",
  description: "Trang web chia sẻ tập tin APK Android, IPA iOS bẻ khóa và mã nguồn website Next.js, React, Laravel chất lượng cao, đã kiểm duyệt an toàn sạch virus 100%.",
  keywords: ["APK", "IPA", "Mã nguồn", "Next.js", "Source code", "Tải game", "Bảo mật"],
  authors: [{ name: "Rổ Ứng Dụng Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppStateProvider>
                <MaintenanceGuard>
                  <Navbar />
                  <NotificationContainer />
                  <main style={{ flex: 1, padding: "2rem 0" }}>
                    {children}
                  </main>
                  <footer style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    fontSize: "0.85rem",
                    color: "hsla(var(--foreground-muted) / 0.8)",
                    borderTop: "1px solid hsla(var(--border) / 0.5)",
                    marginTop: "auto",
                    background: "hsla(var(--card-bg) / 0.3)",
                    backdropFilter: "blur(8px)"
                  }}>
                    <div className="container">
                      <p>© 2026 <strong>Rổ Ứng Dụng</strong>. Thiết kế chuẩn Premium Glassmorphism. Chia sẻ ứng dụng di động & mã nguồn miễn phí.</p>
                      <p style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
                        <Link href="/eula" style={{ color: "hsla(var(--foreground-muted) / 0.8)", textDecoration: "none", fontWeight: 500 }}>
                          Điều khoản sử dụng (EULA)
                        </Link>
                        <Link href="/dmca" style={{ color: "hsla(var(--foreground-muted) / 0.8)", textDecoration: "none", fontWeight: 500 }}>
                          Bảo vệ bản quyền (DMCA)
                        </Link>
                      </p>
                      <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.7 }}>
                        Tất cả các bản tải về đều được giả lập an toàn và bảo mật.
                      </p>
                    </div>
                  </footer>
                </MaintenanceGuard>
              </AppStateProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


