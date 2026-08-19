import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatCurrency, getSpaceImageUrl } from "../../utils/formatters";
import { Store, ShieldCheck, FileText, ArrowRight, Phone, Mail, MapPin, Eye, UserPlus, Lock } from "lucide-react";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";

import logoImg from "../../assets/logo.jpg";

const Landing = () => {
  const [spaces, setSpaces] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0 });
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const words = ["Commercial Spaces", "Digital Billing", "Vendor Management", "Market Services"];

  useEffect(() => {
    fetchSpaces();
    const interval = setInterval(() => {
      setTypewriterIndex(prev => (prev + 1) % words.length);
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logoImg} alt="RentMart Logo" className="w-11 h-11 rounded-full object-cover shadow-lg border border-emerald-500/30 ring-2 ring-emerald-500/20" />
            <div>
              <span className="text-xl font-black tracking-tight text-white">RENTMART</span>
              <span className="block text-[10px] tracking-widest text-primary-400 font-bold uppercase">Commercial Spaces Services</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#spaces" className="hover:text-white transition">Browse Spaces</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-sm transition flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
            >
              <span>Login Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-primary-400">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
              <span>Official RentMart Commercial Spaces Portal</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              Empowering Municipal Commerce with Modern{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-sky-300 to-primary-600">
                {words[typewriterIndex]}
              </span>
            </h1>

            <p className="text-lg text-slate-400 font-normal leading-relaxed">
              Streamline space inventory, automated monthly billings, vendor payment auditing, and lease management for Duero Public Market vendors and staff.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 hover:scale-[1.02] transition flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Renter Account</span>
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-primary-600 text-white font-bold text-base shadow-xl shadow-primary-600/30 hover:bg-primary-500 hover:scale-[1.02] transition"
              >
                Access System
              </Link>
              <a
                href="#spaces"
                className="px-8 py-4 rounded-2xl bg-slate-800 text-slate-200 font-bold text-base hover:bg-slate-700 border border-slate-700 transition"
              >
                Explore Market Spaces
              </a>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              <div>
                <p className="text-2xl font-black text-white">{stats.total || 8}</p>
                <p className="text-xs text-slate-400 font-medium">Total Spaces</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">{stats.available || 6}</p>
                <p className="text-xs text-slate-400 font-medium">Available Units</p>
              </div>
              <div>
                <p className="text-2xl font-black text-sky-400">{stats.rented || 2}</p>
                <p className="text-xs text-slate-400 font-medium">Active Tenants</p>
              </div>
            </div>
          </div>

          {/* Hero Graphic */}
          <div className="flex justify-center relative">
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-primary-600/20 to-sky-400/20 absolute blur-3xl -z-10 animate-pulse"></div>
            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-[3rem] p-8 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center space-y-6 text-center animate-float">
              <img src={logoImg} alt="RentMart System Logo" className="w-24 h-24 rounded-full object-cover shadow-2xl border-2 border-emerald-500/40 ring-4 ring-emerald-500/20" />
              <div>
                <h3 className="text-xl font-extrabold text-white">RentMart System</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Commercial Spaces Management</p>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                Market Digital CSS Active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Designed for Seamless Market Operations</h2>
            <p className="text-slate-400 text-sm">Everything you need to manage commercial stall rentals, transparent billing, and municipal collection audits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-primary-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Space Inventory</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Real-time status tracking for wet market stalls, dry goods sections, food court booths, and service shops.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-primary-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Automated Billing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Automated yearly rate breakdown into 12 monthly installments with downpayment deductions and receipt tracking.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-primary-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Renter Self-Service</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Vendors can log in to view active stall details, outstanding balances, payment due dates, and transaction history.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces Listing Section */}
      <section id="spaces" className="py-24 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white">Available Market Spaces</h2>
              <p className="text-slate-400 text-sm mt-1">Browse commercial spaces in Duero Public Market ready for lease.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spaces.map((space) => (
              <div
                key={space.id}
                className="bg-slate-800/80 rounded-3xl overflow-hidden border border-slate-700/60 hover:border-primary-500/60 transition group flex flex-col justify-between"
              >
                {/* Space Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={getSpaceImageUrl(space.image, space.space_number)}
                    alt={space.space_number}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={space.status} />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-white">
                    {space.space_number}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-200">{space.location}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{space.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Size: <strong className="text-slate-200">{space.size_sqm} sqm</strong></span>
                    <span className="text-primary-400 font-extrabold text-sm">{formatCurrency(space.monthly_rate)} / yr</span>
                  </div>

                  <div className="pt-2 flex flex-col space-y-2">
                    <button
                      onClick={() => setSelectedSpace(space)}
                      className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-primary-600 text-white font-bold text-xs transition flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>

                    {isAvailable(space.status) ? (
                      <Link
                        to="/login"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20"
                      >
                        <Store className="w-4 h-4" />
                        <span>Rent Now</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-700/50 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Unavailable</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img src={logoImg} alt="RentMart Logo" className="w-8 h-8 rounded-full object-cover border border-emerald-500/30 ring-1 ring-emerald-500/20" />
            <div>
              <span className="font-bold text-slate-200 block">RentMart Commercial Spaces Services</span>
              <div className="flex flex-wrap gap-4 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> Duero, Bohol, Philippines</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-emerald-400" /> support@rentmart.com</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400" /> Market Admin Office</span>
              </div>
            </div>
          </div>
          <span className="text-slate-500">Copyright 2026 RentMart. All rights reserved.</span>
        </div>
      </footer>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedSpace}
        onClose={() => setSelectedSpace(null)}
        title={"Space Details - " + (selectedSpace ? selectedSpace.space_number : "")}
      >
        {selectedSpace && (
          <div className="space-y-6 text-slate-800">
            {/* Modal Image */}
            <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={getSpaceImageUrl(selectedSpace.image, selectedSpace.space_number)}
                alt={selectedSpace.space_number}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Status</span>
              <StatusBadge status={selectedSpace.status} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
              <p className="text-base font-bold text-slate-900">{selectedSpace.location}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Size (sqm)</label>
                <p className="text-lg font-extrabold text-slate-900">{selectedSpace.size_sqm} sqm</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Rate</label>
                <p className="text-lg font-extrabold text-primary-600">{formatCurrency(selectedSpace.monthly_rate)} / year</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{selectedSpace.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {isAvailable(selectedSpace.status) ? (
                <Link
                  to="/login"
                  className="w-full py-3 rounded-2xl bg-primary-600 text-white font-bold text-center block text-sm shadow-lg shadow-primary-500/30 hover:bg-primary-500"
                >
                  Log In to Request Rental
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-2xl bg-slate-200 text-slate-500 font-bold text-center block text-sm cursor-not-allowed"
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