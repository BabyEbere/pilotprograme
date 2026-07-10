import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PilotPrograme - AI-Powered YouTube Content Creation",
  description: "Create viral YouTube content in minutes with AI-powered automation from PilotPrograme",
  icons: {
    icon: "/pilotprograme-logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-BPW39ST45W"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BPW39ST45W');
              
              // Define __API_URL__ globally on the client side
              window.__API_URL__ = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api';
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-900 dark:text-white transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
