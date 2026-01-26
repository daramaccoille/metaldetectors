
import Script from 'next/script';
import { subscribe } from './actions';

export default function Home() {
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
          The 2-minute daily read for serious traders.
          <br />
          <span className="highlight-metals">XAU • XAG • Cu • Pt • Pd</span>
        </p>

        <form action={subscribe} className="subscribe-form">
          <input
            name="email"
            type="email"
            required
            placeholder="trader@hedgefund.com"
            className="email-input"
          />
          <button type="submit" className="btn-primary">
            Start Daily Digest
          </button>
        </form>

        {/* Pricing Comparison */}
        <div className="pricing-grid">
          <div className="pricing-card basic">
            <h3 className="card-title">Basic (Free)</h3>
            <div className="price">$0</div>
            <ul className="features-list">
              <li className="feature">❌ XAU Only</li>
              <li className="feature">❌ Weekly Digest</li>
              <li className="feature">❌ No AI Predictions</li>
            </ul>
          </div>

          <div className="pricing-card pro">
            <div className="badge">RECOMMENDED</div>
            <h3 className="card-title" style={{ color: 'white' }}>Pro Analyst</h3>
            <div className="price">$5 <span className="price-period">/ month</span></div>
            <ul className="features-list">
              <li className="feature"><span className="check">✓</span> All 5 Metals</li>
              <li className="feature"><span className="check">✓</span> Daily Morning Brief</li>
              <li className="feature"><span className="check">✓</span> Gemini AI &quot;Buy/Sell&quot; Signals</li>
            </ul>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>

              <stripe-buy-button
                buy-button-id="buy_btn_1StbdRGah8b9m762SrZJcjSt"
                publishable-key="pk_test_51StanwGah8b9m762RPSJLRdMBD9GqogrULvj7yw0Xi7rx3I9oGFoVZWnBi1ETzqJtIlq29MmnkElXN2GVQNFx2BX00z7OOhcDa"
              >
              </stripe-buy-button>
            </div>
          </div>
        </div>

      </div>

      <footer className="footer flex gap-6 text-sm">
        <span>© 2026 MetalDetectors Inc.</span>
        <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
        <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
      </footer>
    </main>
  );
}
