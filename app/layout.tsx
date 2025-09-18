import type { Metadata } from "next";
import { Rajdhani, Chakra_Petch } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casino",
  description: "Play and Earn",
};

const rajdhani = Rajdhani({
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700"]
})

const chakraPetch = Chakra_Petch({
  subsets: ["latin", "thai", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"]
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rajdhani.className} ${chakraPetch.className}`}
      >
        {children}
      </body>
    </html>
  );
}
