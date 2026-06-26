import type { Metadata } from "next";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";

export const metadata: Metadata = {
  title: "CoreHardware | Tu tienda de componentes",
  description: "Encontrá el mejor hardware en Bahía Blanca",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/productos"
    >
      <html lang="es" suppressHydrationWarning>
        <body suppressHydrationWarning>  {/* ← agregá esto */}
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}