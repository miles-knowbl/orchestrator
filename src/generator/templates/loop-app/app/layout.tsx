import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "{{LOOP_NAME}}",
  description: "{{LOOP_DESCRIPTION}}",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100">
        {children}
      </body>
    </html>
  );
}
