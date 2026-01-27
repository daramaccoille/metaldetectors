
import Script from 'next/script';
import { subscribe } from './actions';

import { headers } from 'next/headers';

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

        <form action={subscribe} className="subscribe-form">
          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="email-input"
          />
          <button type="submit" className="btn-primary">
            Start Daily Digest
          </button>
        </form>

        {/* Pricing Comparison */}
        <div className="pricing-grid">

          {/* BASIC PLAN */}
          <div className="pricing-card basic">
            <h3 className="card-title">Basic (nominal fee)</h3>
            <div className="price">{currencySymbol}{basicPrice} <span className="price-period">/ month</span></div>
            <ul className="features-list">
              <li className="feature">❌ XAU Only</li>
              <li className="feature">❌ Weekly Digest</li>
              <li className="feature">❌ No AI Predictions</li>
            </ul>

            <form action={subscribe} style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <input type="hidden" name="email" value="" className="js-email-transfer" />
              <input type="hidden" name="plan" value="basic" />
              <button type="submit" className="btn-secondary w-full">
                Select Basic
              </button>
            </form>
          </div>

          {/* PRO PLAN */}
          <div className="pricing-card pro">
            <div className="badge">RECOMMENDED</div>
            <h3 className="card-title" style={{ color: 'white' }}>Pro Analyst</h3>
            <div className="price">{currencySymbol}{price} <span className="price-period">/ month</span></div>
            <ul className="features-list">
              <li className="feature"><span className="check">✓</span> All 5 Metals</li>
              <li className="feature"><span className="check">✓</span> Best daily predictions</li>
              <li className="feature"><span className="check">✓</span> Deep learning &quot;Buy/Sell&quot; Signals</li>
            </ul>

            <form action={subscribe} style={{ marginTop: 'auto' }}>
              <input type="hidden" name="email" value="" className="js-email-transfer" />
              <input type="hidden" name="plan" value="pro" />
              <button type="submit" className="btn-primary w-full" style={{ width: '100%', marginTop: '1rem' }}>
                Select Pro
              </button>
            </form>
          </div>
        </div>

        {/* Client-side script to stash the email from the main input into the hidden fields */}
        <Script id="email-transfer" strategy="afterInteractive">
          {`
            const mainInput = document.querySelector('input[name="email"]');
            const hiddenInputs = document.querySelectorAll('.js-email-transfer');
            
            if(mainInput) {
                mainInput.addEventListener('input', (e) => {
                    hiddenInputs.forEach(input => input.value = e.target.value);
                });
            }
            
            // Allow main form submit to default to PRO
            const mainForm = document.querySelector('.subscribe-form');
            if(mainForm) {
                // If they hit enter on the main input, treat it as PRO subscription
                const hiddenPlan = document.createElement('input');
                hiddenPlan.type = 'hidden';
                hiddenPlan.name = 'plan';
                hiddenPlan.value = 'pro';
                mainForm.appendChild(hiddenPlan);
            }
        `}
        </Script>

      </div>

      <footer className="footer flex gap-6 text-sm">
        <span>© 2026 metaldetectors.online</span>
        <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
        <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
      </footer>
    </main>
  );
}
