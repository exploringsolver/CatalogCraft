import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/70">
      <div className="lux-container grid gap-10 py-12 md:grid-cols-[1.3fr_0.8fr_0.8fr]">
        <div>
          <p className="lux-chip mb-4">CatalogCraft</p>
          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
            A premium catalog operating system for modern commerce teams.
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Digitize product data, structure it for scale, and present it through
            a polished storefront that feels investor-ready from the first click.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            Explore
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/catalogs" className="hover:text-white">Products</Link>
            <Link to="/about-us" className="hover:text-white">About</Link>
            <Link to="/services" className="hover:text-white">Services</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            Support
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <Link to="/support" className="hover:text-white">Support</Link>
            <Link to="/help" className="hover:text-white">Help Center</Link>
            <Link to="/login" className="hover:text-white">Log In</Link>
            <Link to="/signup" className="hover:text-white">Book Demo</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="lux-container flex flex-col gap-3 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CatalogCraft. Crafted for premium commerce experiences.</p>
          <p>Dark luxury interface · Bento layout · Product-first storytelling</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
