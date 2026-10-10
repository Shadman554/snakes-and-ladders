import type { Metadata } from "next";
import "./globals.css";
import "./polish.css";

export const metadata: Metadata = {
  title: "Snakes & Ladders · Little Forest",
  description: "A little luck. A lovely adventure. Play with your hamster and hedgehog friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
