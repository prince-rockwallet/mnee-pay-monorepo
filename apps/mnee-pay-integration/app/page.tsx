"use client";

import Link from 'next/link';
import { ArrowRight, Radio, Activity, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-amber-50 via-orange-50 to-yellow-50 text-neutral-900 min-h-screen">
      <div className="text-center space-y-8 max-w-3xl mx-auto mb-16">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200 text-amber-800 text-sm font-medium border border-amber-300">
            <Activity className="w-4 h-4" />
            <span>Live Testbench Environment</span>
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-orange-700">
          MNEE PAY Integration
        </h1>
        
        <p className="text-xl text-orange-900/70 max-w-2xl mx-auto">
          Test your generated buttons and visualize webhook events in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        <DashboardCard 
           href="/checkout-test" 
           title="Universal Checkout" 
           icon={<Zap className="w-6 h-6 text-white"/>}
           iconBg="bg-orange-500"
           desc="Test any Button ID. The SDK automatically detects if it is a Donation, Paywall, or E-commerce flow."
        />

        <DashboardCard 
           href="/webhook" 
           title="Webhook Inspector" 
           icon={<Radio className="w-6 h-6 text-white"/>}
           iconBg="bg-amber-400"
           desc="Visualize real-time POST events and JSON payloads from your integrations."
        />

      </div>

      <div className="mt-20 pt-8 border-t border-amber-300 text-center">
        <p className="text-sm text-orange-900/70">
          Powered by <span className="font-semibold text-orange-700">@mnee-pay/checkout</span> SDK
        </p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DashboardCard({ href, title, icon, iconBg, desc }: any) {
  return (
    <Link 
      href={href} 
      className="group relative flex flex-col p-8 bg-amber-100 rounded-xl shadow-md border border-amber-300 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 ease-in-out h-full"
    >
      <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-md ${iconBg}`}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-orange-700 group-hover:text-orange-900 transition-colors">
        {title}
      </h3>
      
      <p className="mt-3 text-base text-orange-900/70 leading-relaxed grow">
        {desc}
      </p>
      
      <div className="mt-8 flex items-center text-sm font-semibold text-orange-800 group-hover:text-orange-900">
        Launch Demo <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
