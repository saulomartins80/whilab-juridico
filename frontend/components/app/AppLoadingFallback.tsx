export function AppLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="app-shell-surface flex h-14 w-14 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600 dark:border-slate-700 dark:border-t-teal-400" />
      </div>
    </div>
  );
}

export default AppLoadingFallback;
