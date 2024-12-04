import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../../node_modules/react-grid-layout/css/styles.css";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UPLB Degree Planner",
  description: "...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={
          inter.className +
          " bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
        }
      >
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </body>
    </html>
  );
}
