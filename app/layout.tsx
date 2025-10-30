import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeCrack",
  description: "Practice coding problems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
