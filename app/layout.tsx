import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "混沌仲裁者", description: "混沌仲裁者 EVE Online 军团官网" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
