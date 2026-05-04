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
      <header style={{ width: '100%', maxWidth: '80rem', zIndex: 20, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.025em', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', position: 'absolute', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.05em', color: 'white', fontFamily: 'Inter, sans-serif' }}>
          METALDETECTORS<span style={{ color: '#eab308' }}>.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/login" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#eab308'} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>Sign In</a>
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

      <footer style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '3rem 0', textAlign: 'center', color: '#71717a', fontSize: '0.875rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '3rem', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
        <span>© 2026 metaldetectors.online</span>
        <a href="/login" style={{ color: '#71717a', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#71717a'}>Login</a>
        <a href="/privacy" style={{ color: '#71717a', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#71717a'}>Privacy Policy</a>
        <a href="/terms" style={{ color: '#71717a', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#71717a'}>Terms of Service</a>
      </footer>
    </main>
  );
}
