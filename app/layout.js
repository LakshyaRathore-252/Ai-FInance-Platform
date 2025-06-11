import "./globals.css";
import { Inter } from "next/font/google"
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
const inter = Inter({ subsets: ["latin"] })
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner";
export const metadata = {
  title: "Wealth",
  description: "One stop finance App",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className} antialiased`}
        >

          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {/* Header */}
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster richColors />


            {/* Footer */}
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gary-200">
                <p>Made with 🧡 by Lakshya Rathore</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
