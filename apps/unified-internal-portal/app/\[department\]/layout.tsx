import React from 'react';
import { getTheme } from '../../../../packages/ui-core/src/themes/theme-engine';

export default async function DepartmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { department: string };
}) {
  const { department } = params;
  const theme = getTheme(department);

  return (
    <div
      className={`min-h-screen ${theme.visualEffects === 'sci-fi' ? 'bg-black text-green-500 font-mono' : 'bg-background'}`}
      style={{
        '--primary': theme.primary,
        '--accent': theme.accent,
      } as React.CSSProperties}
    >
      <header className="border-b px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-white/80">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl uppercase tracking-widest text-[var(--primary)]">
            {department.replace('_', ' ')}
          </span>
          <div className="h-4 w-[1px] bg-slate-300" />
          <span className="text-sm opacity-70">Internal ERP System</span>
        </div>
        <nav className="flex gap-4">
          <button className="px-4 py-2 rounded-full border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors text-sm font-medium">
            Command Center (⌘K)
          </button>
        </nav>
      </header>
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}
