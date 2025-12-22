"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Trash2, Activity } from "lucide-react";

interface WebhookLog {
  id: string;
  receivedAt: string;
  data: any;
}

export default function WebhookPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/mnee-pay-webhook");
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs);
        console.log(json.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isLive) {
      fetchLogs();
      intervalId = setInterval(fetchLogs, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLive]);

  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-yellow-50 text-orange-900">
      <main className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-orange-800">
            Webhook Inspector
          </h1>
          <p className="text-orange-700/80">
            Send POST requests to:{" "}
            <code className="bg-amber-200 border border-amber-300 px-2 py-1 rounded text-sm font-mono text-orange-900">
              /api/mnee-pay-webhook
            </code>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center bg-amber-100 p-4 rounded-xl shadow-lg border border-amber-300 gap-4">
          <div className="flex items-center gap-3 bg-amber-200 px-4 py-2 rounded-lg border border-amber-300">
            <span className="relative flex h-3 w-3">
              {isLive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isLive
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-red-500"
                }`}
              ></span>
            </span>
            <span
              className={`text-sm font-medium ${
                isLive ? "text-emerald-500" : "text-orange-700/60"
              }`}
            >
              {isLive ? "Live Listening" : "Paused"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 border ${
                isLive
                  ? "bg-amber-200 border-amber-300 text-orange-900 hover:bg-amber-300 hover:text-orange-800"
                  : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-md hover:shadow-lg hover:shadow-emerald-900/20"
              }`}
            >
              {isLive ? (
                <>
                  <Pause className="w-4 h-4" /> Stop Live
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Go Live
                </>
              )}
            </button>

            <div className="w-px h-6 bg-amber-300/50 mx-2"></div>

            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-amber-300 bg-amber-100 rounded-xl">
              <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-orange-700" />
              </div>
              <p className="text-orange-700 font-medium">
                No webhook events received yet.
              </p>
              <p className="text-orange-800 text-sm mt-1">
                Waiting for incoming POST requests...
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-amber-100 rounded-xl shadow-lg border border-amber-300 overflow-hidden transition-all hover:border-amber-400"
              >
                <div className="bg-amber-200/50 px-6 py-3 border-b border-amber-300 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-orange-700/60">
                      ID: <span className="text-orange-900">{log.id}</span>
                    </span>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-amber-300/30 text-orange-900 border border-amber-300 rounded-full w-fit">
                    {new Date(log.receivedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-4 bg-amber-200/10 overflow-x-auto custom-scrollbar rounded-b-xl">
                  HERE JSON
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

// Simple Skeleton Loader Component
function LoadingSkeleton() {
  return (
    <div className="w-full h-32 bg-amber-200/30 rounded-xl border border-amber-300 p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-amber-300 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-amber-300/50 rounded w-3/4"></div>
        <div className="h-3 bg-amber-300/50 rounded w-1/2"></div>
      </div>
    </div>
  );
}