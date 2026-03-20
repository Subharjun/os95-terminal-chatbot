import { VT323 } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata = {
  title: "OS-95 Terminal | Deep Space Network",
  description: "A secure deep-space communication terminal powered by GROQ.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${vt323.variable} antialiased`}>
      <body className="bg-terminal-bg text-terminal-green relative overflow-hidden" style={{ height: "100dvh" }}>
        <div className="crt-overlay"></div>
        <div className="crt-flicker"></div>
        <div className="scanline"></div>
        <main className="relative z-10 flex flex-col" style={{ height: "100dvh" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
