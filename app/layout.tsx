import type { Metadata } from "next";
import { Bricolage_Grotesque, Archivo, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
});

const siteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SEFA",
    template: "%s | SEFA",
  },
  description:
    "Studentska ekonomska fakultetska asocijacija (SEFA) okuplja studente Ekonomskog fakulteta i razvija projekte iz oblasti ekonomije, preduzetništva i ličnog razvoja.",
  openGraph: {
    title: "SEFA",
    description:
      "Studentska ekonomska fakultetska asocijacija (SEFA) okuplja studente Ekonomskog fakulteta i razvija projekte iz oblasti ekonomije, preduzetništva i ličnog razvoja.",
    siteName: "SEFA",
    locale: "sr_RS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEFA",
    description:
      "Studentska ekonomska fakultetska asocijacija (SEFA) okuplja studente Ekonomskog fakulteta i razvija projekte iz oblasti ekonomije, preduzetništva i ličnog razvoja.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sr"
      className={`dark ${bricolageGrotesque.variable} ${archivo.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
