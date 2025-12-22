"use client";

import { useState } from "react";
import { Heart, CheckCircle2, ArrowLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import MneeCheckoutWrapper from "@/components/MneeCheckoutWrapper";
import { getMneePayCheckoutBaseUrl } from "@/utils/utils";
import { ButtonConfig } from "@/types/types";

export default function DonationPage() {
  const [buttonId, setButtonId] = useState("");
  const [config, setConfig] = useState<ButtonConfig | null>(null);
  const [donated, setDonated] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buttonId) return;

    setLoading(true);
    setConfig(null);
    setDonated(false);

    try {
      const res = await fetch(`${getMneePayCheckoutBaseUrl()}/api/buttons/public/${buttonId}/config`);
      if (!res.ok) throw new Error("Button not found");

      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error(error);
      alert("Could not load donation button configuration. Please check the ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center p-6 relative overflow-hidden text-orange-900">
      <Link 
        href="/" 
        className="absolute top-8 left-8 text-orange-700 hover:text-orange-900 transition-colors flex items-center gap-2 z-10 bg-amber-100 px-3 py-1 rounded shadow"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="max-w-lg w-full relative z-10 space-y-8">
        
        {/* Input Form */}
        <div className="bg-amber-100 p-6 rounded-2xl border border-amber-300 shadow-sm">
          <form onSubmit={fetchConfig} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Donation Button ID" 
              className="flex-1 bg-amber-50 border border-amber-300 rounded-lg px-4 py-2 text-sm text-orange-900 placeholder-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={buttonId}
              onChange={(e) => setButtonId(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-amber-300 hover:bg-orange-400 text-orange-900 px-4 py-2 rounded-lg text-sm border font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Donation Card */}
        {config && (
          donated ? (
            <div className="bg-amber-100 p-12 rounded-3xl shadow-lg border border-amber-300 text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-amber-200 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-orange-800 mb-2">Thank You!</h2>
                <p className="text-orange-900/80">
                  Your support for <strong>{config.name}</strong> has been received.
                </p>
              </div>
              <button
                onClick={() => setDonated(false)}
                className="mt-4 text-sm text-orange-700 hover:text-orange-900 font-medium"
              >
                Make another donation
              </button>
            </div>
          ) : (
            <div className="bg-amber-100 p-8 rounded-3xl shadow-lg border border-amber-300 space-y-8 animate-in slide-in-from-bottom-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-amber-200 rounded-2xl flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-200" />
                </div>
                <h1 className="text-3xl font-bold text-orange-800">{config.name}</h1>
                <p className="text-orange-900/80 leading-relaxed">
                  {config.description || "Support this project with a secure crypto donation."}
                </p>
              </div>

              <div className="pt-4 border-t border-amber-300 text-center">
                <MneeCheckoutWrapper 
                  config={config}
                  onSuccess={() => setDonated(true)}
                  styling={{
                    buttonSize: config.buttonSize || 'full',
                    borderRadius: config.borderRadius || 'rounded',
                    primaryColor: config.primaryColor || '#6366f1', // Indigo accent
                    accentColor: config.accentColor,
                    buttonColor: config.buttonColor,
                    buttonTextColor: config.buttonTextColor,
                    customCSS: config.customCSS,
                    fontFamily: config.fontFamily
                  }}
                  buttonId={buttonId}
                  showConfetti={config.showConfetti}
                  theme={config.theme}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}