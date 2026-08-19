import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatCurrency, getSpaceImageUrl } from "../../utils/formatters";
import { Store, ShieldCheck, FileText, ArrowRight, Phone, Mail, MapPin, Eye, UserPlus, Lock, Ticket } from "lucide-react";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";

import logoImg from "../../assets/logo.jpg";

// Inject keyframes for the word-swap animation once
const useWordSwapStyles = () => {
  useEffect(() => {
    if (document.getElementById("rentmart-word-swap-styles")) return;
    const style = document.createElement("style");
    style.id = "rentmart-word-swap-styles";
    style.textContent = `
      @keyframes wordFadeSlideIn {
        0% {
          opacity: 0;
          transform: translateY(18px);
          filter: blur(4px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
      }
      @keyframes wordFadeSlideOut {
        0% {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
        100% {
          opacity: 0;
          transform: translateY(-18px);
          filter: blur(4px);
        }
      }
      .word-swap-enter {
        animation: wordFadeSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .word-swap-exit {
        animation: wordFadeSlideOut 0.35s cubic-bezier(0.55, 0, 1, 0.45) forwards;
        position: absolute;
        left: 0;
        top: 0;
      }
    `;
    document.head.appendChild(style);
  }, []);
};

const HERO_IMG = "https://images.unsplash.com/photo-1556360853-b581cf3c8eb2?auto=format&fit=crop&w=2000&q=80";
const STRIP_IMG = "https://images.unsplash.com/photo-1604124900062-cf98463691ee?auto=format&fit=crop&w=1200&q=80";

// Injects the market's type system once, without touching index.html
const useMarketFonts = () => {
  useEffect(() => {
    if (document.getElementById("rentmart-fonts")) return;
    const link = document.createElement("link");
    link.id = "rentmart-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap";
    document.head.appendChild(link);
  }, []);
};

// The recurring "awning canvas" stripe band that marks every section change
const AwningStripe = ({ flip = false }) => (
  <div
    aria-hidden="true"
    className={"h-4 w-full" + (flip ? " rotate-180" : "")}
    style={{
      backgroundImage:
        "repeating-linear-gradient(45deg, #C1440E 0, #C1440E 22px, #F6EFDE 22px, #F6EFDE 44px, #E8A33D 44px, #E8A33D 66px, #F6EFDE 66px, #F6EFDE 88px)",
    }}
  />
);

// A market-stall ticket card: dashed tear edge + punch-hole notches
const TicketCard = ({ children, className = "" }) => (
  <div className={"relative bg-[#FBF6EA] rounded-2xl border-2 border-dashed border-[#C1440E]/30 " + className}>
    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0F3D37]" />
    <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0F3D37]" />
    {children}
  </div>
);

const Landing = () => {
  useMarketFonts();
  useWordSwapStyles();
  const [spaces, setSpaces] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0 });
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [prevWord, setPrevWord] = useState(null);
  const words = ["Commercial Spaces", "Digital Billing", "Vendor Management", "Market Services"];

  useEffect(() => {
    fetchSpaces();
    const interval = setInterval(() => {
      setTypewriterIndex(prev => {
        setPrevWord(words[prev]);
        return (prev + 1) % words.length;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const fetchSpaces = async () => {
    try {
      const res = await api.get("/spaces?limit=8");
      setSpaces(res.data.spaces || []);
      setStats(res.data.stats || { total: 0, available: 0, rented: 0 });
    } catch (error) {
      console.error("Error loading spaces:", error);
    }
  };

  const isAvailable = (status) => status === 'available';

  return (
    <div className="min-h-screen bg-[#F6EFDE] text-[#241C15]" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#F6EFDE]/95 backdrop-blur-xl border-b-2 border-[#241C15]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logoImg} alt="RentMart Logo" className="w-11 h-11 rounded-full object-cover shadow-lg border-2 border-[#C1440E]" />
            <div>
              <span className="text-xl tracking-tight text-[#241C15]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>RENTMART</span>
              <span className="block text-[10px] tracking-widest text-[#0F3D37] font-bold uppercase">Commercial Spaces Services</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#241C15]/70">
            <a href="#features" className="hover:text-[#C1440E] transition">Features</a>
            <a href="#about" className="hover:text-[#C1440E] transition">About</a>
            <a href="#spaces" className="hover:text-[#C1440E] transition">Browse Spaces</a>
            <a href="#contact" className="hover:text-[#C1440E] transition">Contact</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-[#0F3D37]/5 hover:bg-[#0F3D37]/10 text-[#0F3D37] border-2 border-[#0F3D37]/30 font-bold text-sm transition flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-[#C1440E] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 hover:bg-[#a8390c] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
            >
              <span>Login Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - market photo backdrop */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
          role="img"
          aria-label="Vendors and shoppers at a busy public market"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F3D37]/95 via-[#0F3D37]/90 to-[#0F3D37]/95" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#E8A33D]/15 border-2 border-[#E8A33D]/40 text-xs font-bold text-[#E8A33D] uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse"></span>
              <span>Official RentMart Commercial Spaces Portal</span>
            </div>

            <h1 className="text-4xl sm:text-6xl text-[#FBF6EA] leading-[1.05]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
              Empowering Municipal
              <br />
              Commerce with
              <span
                className="block relative overflow-hidden"
                style={{ height: '1.2em' }}
              >
                {/* Invisible spacer — reserves width of the longest word so container never resizes */}
                <span className="invisible block" aria-hidden="true">
                  Vendor Management
                </span>
                {/* Entering word — absolutely positioned, no layout impact */}
                <span
                  key={words[typewriterIndex]}
                  className="word-swap-enter absolute left-0 top-0 text-[#E8A33D]"
                >
                  {words[typewriterIndex]}
                </span>
                {/* Exiting word — absolutely positioned with fade-out */}
                {prevWord && prevWord !== words[typewriterIndex] && (
                  <span
                    key={prevWord + '-exit'}
                    className="word-swap-exit text-[#E8A33D]"
                  >
                    {prevWord}
                  </span>
                )}
              </span>
            </h1>

            <p className="text-lg text-[#FBF6EA]/75 font-normal leading-relaxed max-w-lg">
              Streamline space inventory, automated monthly billings, vendor payment auditing, and lease management for Duero Public Market vendors and staff.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl bg-[#C1440E] text-[#FBF6EA] font-bold text-base shadow-xl shadow-[#C1440E]/30 hover:bg-[#a8390c] hover:scale-[1.02] transition flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Renter Account</span>
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-[#E8A33D] text-[#241C15] font-bold text-base shadow-xl shadow-[#E8A33D]/20 hover:bg-[#dc9530] hover:scale-[1.02] transition"
              >
                Access System
              </Link>
              <a
                href="#spaces"
                className="px-8 py-4 rounded-xl bg-transparent text-[#FBF6EA] font-bold text-base hover:bg-white/10 border-2 border-[#FBF6EA]/30 transition"
              >
                Explore Market Spaces
              </a>
            </div>

            {/* Live Stats — printed like a market bulletin ticket */}
            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { label: "Total Spaces", value: stats.total || 8 },
                { label: "Available Units", value: stats.available || 6, accent: "#E8A33D" },
                { label: "Active Tenants", value: stats.rented || 2, accent: "#5DCAA5" },
              ].map((s) => (
                <div key={s.label} className="px-4 py-2 rounded-lg border-2 border-dashed border-[#FBF6EA]/25 bg-white/5">
                  <p className="text-2xl" style={{ fontFamily: "'IBM Plex Mono', monospace", color: s.accent || "#FBF6EA" }}>{s.value}</p>
                  <p className="text-[11px] text-[#FBF6EA]/60 font-medium uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero badge card */}
          <div className="flex justify-center relative">
            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-[#FBF6EA] rounded-[2rem] p-8 border-4 border-[#E8A33D] shadow-2xl flex flex-col items-center justify-center space-y-6 text-center rotate-2">
              <img src={logoImg} alt="RentMart System Logo" className="w-24 h-24 rounded-full object-cover shadow-2xl border-2 border-[#C1440E]" />
              <div>
                <h3 className="text-xl text-[#241C15]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>RentMart System</h3>
                <p className="text-xs text-[#241C15]/60 font-medium mt-1">Commercial Spaces Management</p>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-[#0F3D37]/10 border-2 border-[#0F3D37]/30 text-[#0F3D37] text-xs font-bold uppercase tracking-wide">
                Market Digital CSS Active
              </div>
            </div>
          </div>
        </div>
      </section>

      <AwningStripe />

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-[#F6EFDE]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl text-[#241C15]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Designed for Seamless Market Operations</h2>
            <p className="text-[#241C15]/60 text-sm">Everything you need to manage commercial stall rentals, transparent billing, and municipal collection audits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Store, title: "Space Inventory", desc: "Real-time status tracking for wet market stalls, dry goods sections, food court booths, and service shops.", accent: "#C1440E" },
              { icon: FileText, title: "Automated Billing", desc: "Automated yearly rate breakdown into 12 monthly installments with downpayment deductions and receipt tracking.", accent: "#0F3D37" },
              { icon: ShieldCheck, title: "Renter Self-Service", desc: "Vendors can log in to view active stall details, outstanding balances, payment due dates, and transaction history.", accent: "#E8A33D" },
            ].map((f) => (
              <TicketCard key={f.title} className="p-8 space-y-4 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: f.accent + "1A", color: f.accent }}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#241C15]">{f.title}</h3>
                <p className="text-sm text-[#241C15]/60 leading-relaxed">{f.desc}</p>
              </TicketCard>
            ))}
          </div>
        </div>
      </section>

      <AwningStripe flip />

      {/* Spaces Listing Section */}
      <section id="spaces" className="py-24 px-6 bg-[#0F3D37]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl text-[#FBF6EA]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Available Market Spaces</h2>
              <p className="text-[#FBF6EA]/60 text-sm mt-1">Browse commercial spaces in Duero Public Market ready for lease.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {spaces.map((space) => (
              <TicketCard key={space.id} className="overflow-hidden flex flex-col justify-between">
                {/* Space Image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={getSpaceImageUrl(space.image, space.space_number)}
                    alt={space.space_number}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={space.status} />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#241C15]/85 px-3 py-1 rounded-md text-xs font-black text-[#FBF6EA] flex items-center gap-1">
                    <Ticket className="w-3 h-3" />
                    {space.space_number}
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[#241C15]">{space.location}</h4>
                    <p className="text-xs text-[#241C15]/60 line-clamp-2 leading-relaxed">{space.description}</p>
                  </div>

                  <div className="pt-3 border-t-2 border-dashed border-[#C1440E]/20 flex justify-between items-center text-xs">
                    <span className="text-[#241C15]/60">Size: <strong className="text-[#241C15]">{space.size_sqm} sqm</strong></span>
                    <span className="text-[#C1440E] font-bold text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatCurrency(space.monthly_rate)}/yr</span>
                  </div>

                  <div className="pt-2 flex flex-col space-y-2">
                    <button
                      onClick={() => setSelectedSpace(space)}
                      className="w-full py-2.5 rounded-lg bg-[#241C15]/5 hover:bg-[#0F3D37] hover:text-[#FBF6EA] text-[#241C15] font-bold text-xs transition flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>

                    {isAvailable(space.status) ? (
                      <Link
                        to="/login"
                        className="w-full py-2.5 rounded-lg bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-[#C1440E]/20"
                      >
                        <Store className="w-4 h-4" />
                        <span>Rent Now</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-lg bg-[#241C15]/10 text-[#241C15]/40 font-bold text-xs cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Unavailable</span>
                      </button>
                    )}
                  </div>
                </div>
              </TicketCard>
            ))}
          </div>
        </div>
      </section>

      {/* About / market texture strip */}
      <section id="about" className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${STRIP_IMG})` }} role="img" aria-label="Fresh produce stall at the market" />
        <div className="absolute inset-0 bg-[#241C15]/70 flex items-center">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-[#FBF6EA] text-xl sm:text-2xl max-w-xl" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
              Built for the stalls, not just the spreadsheets.
            </p>
          </div>
        </div>
      </section>

      <AwningStripe />

      {/* Footer */}
      <footer id="contact" className="py-12 border-t-4 border-[#C1440E] bg-[#241C15] text-[#FBF6EA]/60 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img src={logoImg} alt="RentMart Logo" className="w-8 h-8 rounded-full object-cover border-2 border-[#E8A33D]" />
            <div>
              <span className="font-bold text-[#FBF6EA] block">RentMart Commercial Spaces Services</span>
              <div className="flex flex-wrap gap-4 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#E8A33D]" /> Duero, Bohol, Philippines</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#E8A33D]" /> support@rentmart.com</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#E8A33D]" /> Market Admin Office</span>
              </div>
            </div>
          </div>
          <span className="text-[#FBF6EA]/40">Copyright 2026 RentMart. All rights reserved.</span>
        </div>
      </footer>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedSpace}
        onClose={() => setSelectedSpace(null)}
        title={"Space Details - " + (selectedSpace ? selectedSpace.space_number : "")}
      >
        {selectedSpace && (
          <div className="space-y-6 text-[#241C15]">
            {/* Modal Image */}
            <div className="w-full h-56 rounded-2xl overflow-hidden bg-[#F6EFDE] border-2 border-dashed border-[#C1440E]/30">
              <img
                src={getSpaceImageUrl(selectedSpace.image, selectedSpace.space_number)}
                alt={selectedSpace.space_number}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#241C15]/50">Status</span>
              <StatusBadge status={selectedSpace.status} />
            </div>
            <div>
              <label className="text-xs font-bold text-[#241C15]/40 uppercase">Location</label>
              <p className="text-base font-bold text-[#241C15]">{selectedSpace.location}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-[#F6EFDE] p-4 rounded-2xl border-2 border-dashed border-[#C1440E]/20">
              <div>
                <label className="text-xs font-bold text-[#241C15]/40 uppercase">Size (sqm)</label>
                <p className="text-lg font-extrabold text-[#241C15]">{selectedSpace.size_sqm} sqm</p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#241C15]/40 uppercase">Rate</label>
                <p className="text-lg font-bold text-[#C1440E]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatCurrency(selectedSpace.monthly_rate)}/year</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[#241C15]/40 uppercase">Description</label>
              <p className="text-sm text-[#241C15]/70 mt-1 leading-relaxed">{selectedSpace.description}</p>
            </div>

            <div className="pt-4 border-t-2 border-dashed border-[#C1440E]/20">
              {isAvailable(selectedSpace.status) ? (
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl bg-[#C1440E] text-[#FBF6EA] font-bold text-center block text-sm shadow-lg shadow-[#C1440E]/30 hover:bg-[#a8390c]"
                >
                  Log In to Request Rental
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-[#241C15]/10 text-[#241C15]/40 font-bold text-center block text-sm cursor-not-allowed"
                >
                  This Space is Currently {selectedSpace.status.charAt(0).toUpperCase() + selectedSpace.status.slice(1)}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Landing;