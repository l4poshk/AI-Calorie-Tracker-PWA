import { WifiOff, RotateCcw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#5C6B4F]/10 text-[#5C6B4F]">
        <WifiOff className="h-12 w-12" />
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#3D4A3C]">
        You are offline
      </h1>

      <p className="mb-8 max-w-md text-base text-[#5C6B4F]">
        Don&apos;t worry! AI Calorie Tracker works in offline mode. You can
        still view your previously cached monthly history and logs.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs justify-center">
        <a
          href="/"
          className="flex items-center justify-center gap-2 rounded-full bg-[#5C6B4F] px-6 py-3 text-sm font-medium text-[#FAF6F1] shadow-sm transition-colors hover:bg-[#4a563f] active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Try Reloading
        </a>
      </div>
    </main>
  );
}
