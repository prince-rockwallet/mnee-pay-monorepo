"use client";

import { useState } from "react";
import { ArrowLeft, Search, Zap } from "lucide-react";
import Link from "next/link";
import MneeCheckoutWrapper from "@/components/MneeCheckoutWrapper";

export default function UniversalCheckoutPage() {
  const [inputValue, setInputValue] = useState("");
  const [activeButtonId, setActiveButtonId] = useState("");

  const handleLoadButton = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setActiveButtonId(inputValue);
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
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-orange-800">Checkout Tester</h1>
          <p className="text-orange-900/70">Enter any Button ID to load the specific flow (Donation, Paywall, or Cart).</p>
        </div>

        <div className="bg-amber-100 p-6 rounded-2xl border border-amber-300 shadow-sm">
          <form onSubmit={handleLoadButton} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Paste Button ID here..." 
              className="flex-1 bg-amber-50 border border-amber-300 rounded-lg px-4 py-2 text-sm text-orange-900 placeholder-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-amber-300 hover:bg-orange-400 text-orange-900 px-4 py-2 rounded-lg text-sm border font-medium transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Load
            </button>
          </form>
        </div>

        {activeButtonId && (
          <div className="bg-amber-100 p-8 rounded-3xl shadow-lg border border-amber-300 space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-center gap-2 text-orange-800/60 text-xs uppercase tracking-wider font-semibold mb-4">
               <Zap className="w-4 h-4" /> 
               Loaded Configuration
            </div>

            <div className="flex justify-center">
              <MneeCheckoutWrapper 
                buttonId={activeButtonId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}