"use client";

export default function HeroArama() {
  function ac() {
    window.dispatchEvent(new CustomEvent("togg:open-search"));
  }

  return (
    <button
      onClick={ac}
      className="group flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/15 bg-white/6 px-5 py-4 text-left backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
    >
      <svg
        className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-slate-400 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <span className="flex-1 text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
        Şarj, OTA güncellemesi, ikaz lambası, bakım...
      </span>
      <kbd className="hidden rounded-lg border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-medium text-slate-600 sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
