import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderFooterWrapper from "@/components/includes/HeaderFooterWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eventify",
  icons: {
    icon: [
      { url: "/logo.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/logo.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeaderFooterWrapper>{children}</HeaderFooterWrapper>
      </body>
    </html>
  );
}
