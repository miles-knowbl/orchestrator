import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orchestrator Docs',
  description: 'Real-time monitoring and control for AI-driven workflows',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a]">
        <div className="flex flex-col min-h-screen">
          <header className="border-b border-[#222] bg-[#111] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="orch-grad" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#15803d" />
                    </linearGradient>
                  </defs>
                  <path d="M13.6 3.1 A9 9 0 0 1 20.5 15.1" stroke="url(#orch-grad)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M18.9 17.8 A9 9 0 0 1 5.1 17.8" stroke="url(#orch-grad)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M3.5 15.1 A9 9 0 0 1 10.4 3.1" stroke="url(#orch-grad)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <h1 className="text-lg font-bold tracking-tight text-white">Orchestrator</h1>
              </div>
              <nav className="flex items-center gap-6">
                <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Loops</a>
                <a href="/skills" className="text-sm text-gray-400 hover:text-white transition-colors">Skills</a>
                <a href="/distribute" className="text-sm text-gray-400 hover:text-white transition-colors">Distribute</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
