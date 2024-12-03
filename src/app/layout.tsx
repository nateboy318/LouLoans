import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex min-h-screen w-full bg-white text-black",
          inter.className,
          { "debug-screens": process.env.NODE_ENV === "development" },
        )}
      >
        {/* Sidebar */}
        <Sidebar />
        {/* main page */}
        <div className="w-full p-8">{children}</div>
      </body>
    </html>
  );
}
