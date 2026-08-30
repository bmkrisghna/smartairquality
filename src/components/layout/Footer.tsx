import { Link } from 'react-router-dom';
import { Wind, Mail, MapPin, Phone, Globe, Send, Share2 } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-soft border-t border-app mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center">
            <Wind className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold brand-text">AirGuide</span>
        </div>
        <p className="text-sm text-muted max-w-xs">
          Smart air quality prediction and route health advisory platform. Breathe smarter, travel safer.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-3" style={{ color: 'rgb(var(--text))' }}>Product</h4>
        <ul className="space-y-2 text-sm text-muted">
          <li><Link to="/#features" className="hover:text-[rgb(var(--text))] transition-colors">Features</Link></li>
          <li><Link to="/#how-it-works" className="hover:text-[rgb(var(--text))] transition-colors">How It Works</Link></li>
          <li><Link to="/#benefits" className="hover:text-[rgb(var(--text))] transition-colors">Benefits</Link></li>
          <li><Link to="/register" className="hover:text-[rgb(var(--text))] transition-colors">Get Started</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-3" style={{ color: 'rgb(var(--text))' }}>Company</h4>
        <ul className="space-y-2 text-sm text-muted">
          <li><a href="#" className="hover:text-[rgb(var(--text))] transition-colors">About</a></li>
          <li><a href="#" className="hover:text-[rgb(var(--text))] transition-colors">Privacy</a></li>
          <li><a href="#" className="hover:text-[rgb(var(--text))] transition-colors">Terms</a></li>
          <li><a href="#" className="hover:text-[rgb(var(--text))] transition-colors">Contact</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-3" style={{ color: 'rgb(var(--text))' }}>Connect</h4>
        <div className="flex gap-3 mb-4">
          <a href="#" className="w-9 h-9 rounded-lg bg-[rgb(var(--surface))] border border-app flex items-center justify-center hover:bg-[rgb(var(--surface-2))] transition-colors">
            <Globe className="w-4 h-4 text-soft" />
          </a>
          <a href="#" className="w-9 h-9 rounded-lg bg-[rgb(var(--surface))] border border-app flex items-center justify-center hover:bg-[rgb(var(--surface-2))] transition-colors">
            <Send className="w-4 h-4 text-soft" />
          </a>
          <a href="#" className="w-9 h-9 rounded-lg bg-[rgb(var(--surface))] border border-app flex items-center justify-center hover:bg-[rgb(var(--surface-2))] transition-colors">
            <Share2 className="w-4 h-4 text-soft" />
          </a>
        </div>
        <div className="space-y-1.5 text-sm text-muted">
          <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> hello@airguide.app</div>
          <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +1 800 AIR-GUIDE</div>
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> San Francisco, CA</div>
        </div>
      </div>
    </div>
    <div className="border-t border-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
        <p>© 2026 AirGuide. All rights reserved.</p>
        <p>Built with care for healthier cities.</p>
      </div>
    </div>
  </footer>
);
