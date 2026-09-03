import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "VANTAGE // EVE CORPORATION", description: "Vantage EVE Online corporation portal" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
