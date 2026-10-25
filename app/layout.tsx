import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ONLOAD_CALLBACK, explicitScriptUrl } from '@/lib/config';
import './globals.css';

const plexSans = localFont({
  src: './fonts/IBMPlexSans.woff2',
  weight: '400 700',
  variable: '--font-plex-sans',
  display: 'swap',
});
const robotoMono = localFont({
  src: './fonts/RobotoMono.woff2',
  weight: '400 500',
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://postcaptcha.com'),
  title: {
    default: 'postcaptcha: replace your CAPTCHA with a Polyguard Trust Check',
    template: '%s | postcaptcha',
  },
  description:
    'The only way to be sure an agent did not fill in your form. A keyless, drop-in replacement for reCAPTCHA and Turnstile, verified on your server with one request.',
  openGraph: {
    title: "The only way to be sure an agent didn't fill in your form.",
    description:
      'A keyless Polyguard Trust Check replaces reCAPTCHA or Turnstile. Free for 1,000 Trust Checks a week, no account required.',
    url: 'https://postcaptcha.com',
    siteName: 'postcaptcha',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

// Runs before trust-check.js; the widget calls ONLOAD_CALLBACK once it is ready.
const ONLOAD_SCRIPT = `
window.__pgTrustCheckQueue = window.__pgTrustCheckQueue || [];
window.${ONLOAD_CALLBACK} = function () {
  window.__pgTrustCheckLoaded = true;
  var q = window.__pgTrustCheckQueue.splice(0);
  for (var i = 0; i < q.length; i++) {
    try { q[i](); } catch (e) { console.error(e); }
  }
};
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${robotoMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ONLOAD_SCRIPT }} />
        <script src={explicitScriptUrl()} async defer />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
