import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/animations/PageTransition';
// import VisualEffects from '@/components/effects/VisualEffects'; // Commented out as unused
import ThemeCustomizerButton from '@/components/theme/ThemeCustomizerButton';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://softcrown.com'),
  title: {
    default: "SoftCrown - Desarrollo y Diseño Web Profesional",
    template: "%s | SoftCrown",
  },
  description: "Creamos experiencias digitales excepcionales con tecnologías modernas. Desarrollo web, diseño UI/UX, e-commerce y aplicaciones móviles.",
  keywords: ["desarrollo web", "diseño web", "React", "Next.js", "UI/UX", "e-commerce", "aplicaciones móviles"],
  authors: [{ name: "SoftCrown Team" }],
  creator: "SoftCrown",
  publisher: "SoftCrown",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://softcrown.com",
    siteName: "SoftCrown",
    title: "SoftCrown - Desarrollo y Diseño Web Profesional",
    description: "Creamos experiencias digitales excepcionales con tecnologías modernas.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SoftCrown - Desarrollo Web Profesional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoftCrown - Desarrollo y Diseño Web Profesional",
    description: "Creamos experiencias digitales excepcionales con tecnologías modernas.",
    images: ["/og-image.png"],
    creator: "@softcrown",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">
            {/* Skip to main content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
            >
              Saltar al contenido principal
            </a>

            {/* Advanced Visual Effects - Temporarily disabled */}
            {/* <VisualEffects 
              enableParticles={true}
              enableOrbs={true}
              enableGrid={true}
            /> */}

            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />
            </div>
            
            {/* Header */}
            <Header />
            
            {/* Main Content */}
            <main id="main-content" className="relative z-10">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            
            {/* Footer */}
            <Footer />
            
            {/* Portal Roots */}
            <div id="modal-root" />
            <div id="tooltip-root" />
            <div id="dropdown-root" />
            
            {/* Theme Customizer */}
            <ThemeCustomizerButton />
          </div>
        </ThemeProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      // console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      // console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
