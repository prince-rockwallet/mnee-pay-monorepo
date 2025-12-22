"use client";

import { useState } from 'react';
import { Lock, ArrowLeft, Check, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import MneeCheckoutWrapper from '@/components/MneeCheckoutWrapper';
import { ButtonConfig } from '@/types/types';
import { getMneePayCheckoutBaseUrl } from '@/utils/utils';

export default function PaywallPage() {
  const [buttonId, setButtonId] = useState("");
  const [config, setConfig] = useState<ButtonConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const fetchConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buttonId) return;

    setLoading(true);
    setConfig(null);
    setIsUnlocked(false);

    try {
      const res = await fetch(`${getMneePayCheckoutBaseUrl()}/api/buttons/public/${buttonId}/config`);
      if (!res.ok) throw new Error("Button not found");
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error(error);
      alert("Could not load paywall button configuration. Please check the ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-yellow-50 text-neutral-900">
      <nav className="border-b border-amber-200 bg-amber-100/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-orange-700 hover:text-orange-900 transition-colors flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Hub
            </Link>
          </div>
        
          <div className="flex items-center gap-2">
            <form onSubmit={fetchConfig} className="flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Paywall Button ID" 
                className="bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 text-sm text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-64"
                value={buttonId}
                onChange={(e) => setButtonId(e.target.value)}
              />
              <button type="submit" disabled={loading} className="text-orange-700 hover:text-orange-900">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
              </button>
            </form>

            <div className="h-4 w-px bg-amber-300 mx-2"></div>

            <div className="flex items-center px-3 py-2 gap-2 text-sm font-medium">
              <div className={`w-2 h-2 rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-orange-400'}`} />
              {isUnlocked ? 'Premium Access' : 'Locked'}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {!config ? (
          <div className="text-center py-20 text-orange-700/60">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter a Button ID above to load the premium content.</p>
          </div>
        ) : (
          <>
            <header className="mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <span className="text-orange-500 font-mono text-sm tracking-wider uppercase">Premium Content</span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-orange-700 leading-tight">
                {config.name || "Exclusive Content"}
              </h1>
              <p className="text-xl text-orange-900/70">
                {config.description || "This content is locked behind a paywall."}
              </p>
            </header>

            <article className="prose prose-orange prose-lg max-w-none">
              <p className="text-orange-900/70">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>

              <div className="relative mt-12 rounded-2xl overflow-hidden border border-amber-300 bg-amber-100 shadow-sm">
                <div className={`p-8 transition-all duration-700 ${isUnlocked ? '' : 'blur-lg opacity-30 select-none'}`}>
                  <h3 className="text-orange-700 text-2xl font-bold mb-4">Deep Dive Analysis</h3>
                  <p className="text-orange-900/70 mb-4">
                    The core of our system uses a UTXO-based model. This allows parallel transaction processing. Unlike account-based models...
                  </p>
                  <p className="text-orange-900/70 mb-4">
                    We implemented a custom SPV wallet client in the browser. This ensures that users maintain custody of their funds while interacting with the merchant...
                  </p>
                  <div className="bg-amber-50 p-6 rounded-lg my-8 font-mono text-sm border border-amber-200">
                    <span className="text-orange-700/70">{'// Hidden implementation details...'}</span>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-linear-to-t from-amber-50 via-amber-50/90 to-amber-50/60">
                    <div className="bg-amber-100/90 backdrop-blur-xl p-8 rounded-2xl border border-amber-200 shadow-2xl max-w-sm w-full text-center space-y-6">
                      <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Lock className="w-8 h-8 text-orange-700" />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-orange-700">Unlock Full Access</h3>
                        <p className="text-orange-900/70 mt-2 text-sm">
                          One-time payment to reveal this content.
                        </p>
                      </div>

                      <div className="w-full">
                        <MneeCheckoutWrapper  
                          config={config}
                          onSuccess={() => setIsUnlocked(true)}
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
                  </div>
                )}
              </div>
            </article>

            {isUnlocked && (
              <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4 text-green-700 animate-in zoom-in">
                <Check className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Access Granted</p>
                  <p className="text-sm opacity-80">You have successfully unlocked this content.</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}