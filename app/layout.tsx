import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lord Aniketh Master Chef",
  description:
    "Premium chef-crafted recipes including Hyderabadi Chicken Dum Biryani, Paneer Fingers, Rogan Josh, Chicken Chettinad and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
     <body className="min-h-full flex flex-col">

  <Script
    async
    src="https://www.googletagmanager.com/gtag/js?id=G-2JZBK2FNQG"
  />

  <Script id="google-analytics">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-2JZBK2FNQG');
    `}
  </Script>

  {children}

</body>
    </html>
  );
}
