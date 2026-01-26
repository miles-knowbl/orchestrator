import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orchestrator Dashboard',
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orch-500 to-orch-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <h1 className="text-lg font-semibold text-white">Orchestrator</h1>
              </div>
              <nav className="flex items-center gap-6">
                <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</a>
                <a href="/executions" className="text-sm text-gray-400 hover:text-white transition-colors">Executions</a>
                <a href="/skills" className="text-sm text-gray-400 hover:text-white transition-colors">Skills</a>
                <a href="/loops" className="text-sm text-gray-400 hover:text-white transition-colors">Loops</a>
                <a href="/inbox" className="text-sm text-gray-400 hover:text-white transition-colors">Inbox</a>
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
