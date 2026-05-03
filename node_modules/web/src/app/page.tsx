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
    <main className="main-layout selection:bg-yellow-500/30">
      <Script src="https://js.stripe.com/v3/buy-button.js" async />

      {/* Background Radiance */}
      <div className="bg-ambience"></div>

      {/* Header */}
      <header className="w-full max-w-7xl z-20 p-6 flex justify-between items-center text-sm font-medium tracking-wide border-b border-white/5 bg-black/50 backdrop-blur-md absolute top-0">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          METALDETECTORS<span style={{ color: '#eab308' }}>.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-gray-300 hover:text-yellow-500 transition-colors font-medium">Sign In</a>
        </div>
      </header>

      <div className="container hero-section z-10 pt-24">
        <h1 className="hero-title">
          Daily AI <span className="title-gradient-text">Metals Signals.</span>
        </h1>
        <p className="hero-subtitle">
          The 2-minute daily read for informed trading.
        </p>
        <span className="highlight-metals">XAU • XAG • Cu • Pt • Pd</span>

        {/* Client-Side Form Component handles validation and subscription */}
        <SubscribeForm
          currencySymbol={currencySymbol}
          price={price}
          basicPrice={basicPrice}
        />

      </div>

      <footer className="w-full border-t border-white/10 py-12 text-center text-zinc-500 text-sm flex gap-6 justify-center mt-12 bg-black/40 backdrop-blur-sm">
        <span>© 2026 metaldetectors.online</span>
        <a href="/login" className="hover:text-white transition-colors">Login</a>
        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
      </footer>
    </main>
  );
}
