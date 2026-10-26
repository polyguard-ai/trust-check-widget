import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ONLOAD_CALLBACK, SITE_URL, explicitScriptUrl } from '@/lib/config';
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'postcaptcha: replace your CAPTCHA with a Polyguard Trust Check',
    template: '%s | postcaptcha',
  },
  description:
    'The only way to be sure an agent did not fill in your form. A keyless, drop-in replacement for reCAPTCHA and Turnstile, verified on your server with one request.',
  keywords: [
    'CAPTCHA alternative',
    'reCAPTCHA alternative',
    'Turnstile alternative',
    'hCaptcha alternative',
    'block AI agents',
    'sign-up form bot protection',
    'Polyguard Trust Check',
  ],
  alternates: {
    canonical: '/',
    types: { 'text/plain': [{ url: '/llms.txt', title: 'Instructions for coding agents' }] },
  },
  openGraph: {
    title: "The only way to be sure an agent didn't fill in your form.",
    description:
      'A keyless Polyguard Trust Check replaces reCAPTCHA or Turnstile. Free for 1,000 Trust Checks a week, no account required.',
    url: SITE_URL,
    siteName: 'postcaptcha',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "The only way to be sure an agent didn't fill in your form.",
    description:
      'A keyless Polyguard Trust Check replaces reCAPTCHA or Turnstile. Free for 1,000 Trust Checks a week, no account required.',
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
