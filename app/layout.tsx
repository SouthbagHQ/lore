import { IBM_Plex_Sans, IBM_Plex_Mono, Cormorant_Garamond } from 'next/font/google';
import { Provider } from '@/components/provider';
import { PalantirEvents } from '@/components/palantir-events';
import Script from 'next/script';
import './global.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sb-sans',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sb-mono',
});

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-sb-display',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${mono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        {/* Palantir: Southbag's shared PostHog wiring (see public/palantir.js). */}
        <Script src="/palantir.js" strategy="afterInteractive" data-app="lore" />
        <PalantirEvents />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
