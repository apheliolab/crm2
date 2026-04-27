import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CrmProvider } from "@/hooks/use-crm-store";
import { getSupabasePublicEnvScript } from "@/lib/supabase/env";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aphelio CRM",
  description: "CRM comercial simples, rapido e moderno para a Aphelio Lab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseEnvScript = getSupabasePublicEnvScript();

  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: supabaseEnvScript }} />
        <CrmProvider>{children}</CrmProvider>
      </body>
    </html>
  );
}
