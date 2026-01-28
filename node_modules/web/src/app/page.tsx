
import Script from 'next/script';
import { headers } from 'next/headers';
import SubscribeForm from '@/components/SubscribeForm';

// Cloudflare Pages requires Edge runtime for dynamic functionality
export const runtime = 'edge';
export const preferredRegion = 'auto';

export default async function Home() {
  const headersList = await headers();
  const country = headersList.get('cf-ipcountry');

  let currencySymbol = '$';
  let price = '5';
  let basicPrice = '1';

  if (country === 'GB') {
    currencySymbol = '£';
    price = '4';
    basicPrice = '1';
  } else if (['IE', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'BE', 'AT'].includes(country || '')) {
    currencySymbol = '€';
    price = '5';
    basicPrice = '1';
  }

  return (
    <main className="main-layout">
      <Script src="https://js.stripe.com/v3/buy-button.js" async />

      {/* Background Ambience */}
      <div className="bg-ambience">
        <div className="orb" />
      </div>

      <div className="glass container hero-section">
        <h1 className="hero-title hero-text">
          Daily AI Metals Signals.
        </h1>
        <p className="hero-subtitle">
          The 2-minute daily read for informed trading.
          <br />
          <span className="highlight-metals">XAU • XAG • Cu • Pt • Pd</span>
        </p>

        {/* Client-Side Form Component handles validation and subscription */}
        <SubscribeForm
          currencySymbol={currencySymbol}
          price={price}
          basicPrice={basicPrice}
        />

      </div>

      <footer className="footer flex gap-6 text-sm">
        <span>© 2026 metaldetectors.online</span>
        <br />
        <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy </a>
        <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service </a>
      </footer>
    </main>
  );
}
