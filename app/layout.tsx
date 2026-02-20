import type { Metadata } from "next";
import localFont from "next/font/local";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { GrainBackground } from "@/components/shared/grain-background";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});


export const metadata: Metadata = {
  title: "Hyr - AI-Powered Resume Optimization",
  description:
    "Tailor your resume for every job. Beat ATS systems. Auto-apply to relevant positions. Land your dream job with Hyr.",
  openGraph: {
    title: "Hyr - AI-Powered Resume Optimization",
    description:
      "Tailor your resume for every job. Beat ATS systems. Auto-apply to relevant positions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${GeistPixelSquare.variable} antialiased`}
      >
        <GrainBackground />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
