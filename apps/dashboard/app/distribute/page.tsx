'use client';

import { useEffect, useState } from 'react';
import { Package, Download, Copy, Check, Terminal, Clock, GitCommit, Tag } from 'lucide-react';

const GITHUB_REPO = 'miles-knowbl/orchestrator';

interface ReleaseData {
  name: string;
  tag_name: string;
  body: string;
  created_at: string;
  assets: {
    name: string;
    browser_download_url: string;
    size: number;
  }[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-[#333] transition-colors text-gray-500 hover:text-white"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-orch-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CodeBlock({ command, label }: { command: string; label?: string }) {
  return (
    <div>
      {label && <p className="text-xs text-gray-500 mb-1.5">{label}</p>}
      <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-3">
        <code className="text-sm text-orch-400 font-mono">{command}</code>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DistributePage() {
  const [release, setRelease] = useState<ReleaseData | null>(null);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/latest`
        );
        if (!res.ok) throw new Error('Failed to fetch release data');
        const data: ReleaseData = await res.json();
        setRelease(data);

        // Fetch checksum file (separate try/catch — CORS redirect may fail)
        try {
          const checksumAsset = data.assets.find(a => a.name === 'checksums.txt');
          if (checksumAsset) {
            const checksumRes = await fetch(checksumAsset.browser_download_url);
            if (checksumRes.ok) {
              const text = await checksumRes.text();
              setChecksum(text.split('  ')[0]);
            }
          }
        } catch {
          // Checksum fetch may fail due to CORS on GitHub redirect — non-critical
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchRelease();
  }, []);

  // Parse version and commit from release body
  const version = release?.body?.match(/Version:\*{0,2}\s*([\d.]+)/)?.[1] || '0.0.0';
  const commit = release?.body?.match(/Commit:\*{0,2}\s*([a-f0-9]+)/)?.[1] || '';
  const tarball = release?.assets.find(a => a.name.endsWith('.tar.gz'));

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">Failed to load release data</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-orch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-6 h-6 text-orch-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Distribution</h1>
          <p className="text-sm text-gray-500">Download and install the Orchestrator</p>
        </div>
      </div>

      {/* Getting Started — Full Guide */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-5 h-5 text-orch-400" />
          <h2 className="text-lg font-semibold text-white">Getting Started</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">From zero to running an engineering loop</p>

        <div className="space-y-6">
          {/* Prerequisites */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Prerequisites</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#222] text-gray-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-sm text-gray-300">Install Node.js 18+</p>
                  <p className="text-xs text-gray-500">Download from <a href="https://nodejs.org" className="text-orch-400 hover:underline" target="_blank" rel="noopener noreferrer">nodejs.org</a> (includes npm)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#222] text-gray-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-sm text-gray-300">Install git</p>
                  <p className="text-xs text-gray-500">Mac: <code className="text-gray-400">xcode-select --install</code> &middot; Others: <a href="https://git-scm.com" className="text-orch-400 hover:underline" target="_blank" rel="noopener noreferrer">git-scm.com</a></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#222] text-gray-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-sm text-gray-300">Install Claude Code</p>
                  <p className="text-xs text-gray-500 mb-1.5">Open <span className="text-gray-400">Terminal.app</span> &middot; any directory</p>
                  <CodeBlock command="npm install -g @anthropic-ai/claude-code" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#222]" />

          {/* Install & Run */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Install & Run</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orch-500/10 text-orch-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div className="w-full">
                  <p className="text-sm text-gray-300 mb-2">Run the installer</p>
                  <p className="text-xs text-gray-500 mb-1.5"><span className="text-gray-400">Tab 1</span> &middot; home directory <code className="text-gray-400">cd ~</code></p>
                  <CodeBlock command={`curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/main/install.sh | bash`} />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orch-500/10 text-orch-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div className="w-full">
                  <p className="text-sm text-gray-300 mb-2">Start the server</p>
                  <p className="text-xs text-gray-500 mb-1.5"><span className="text-gray-400">Tab 1</span> &middot; still in <code className="text-gray-400">~</code> &mdash; leave this tab running</p>
                  <CodeBlock command="cd orchestrator && npm start" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orch-500/10 text-orch-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">6</span>
                <div className="w-full">
                  <p className="text-sm text-gray-300 mb-2">Verify it works</p>
                  <p className="text-xs text-gray-500 mb-1.5"><span className="text-gray-400">Tab 2</span> (<kbd className="text-gray-400">&#8984;T</kbd>) &middot; any directory</p>
                  <CodeBlock command="curl http://localhost:3002/health" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#222]" />

          {/* Connect & Use */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Connect & Use</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orch-500/10 text-orch-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">7</span>
                <div className="w-full">
                  <p className="text-sm text-gray-300 mb-2">Register the MCP server</p>
                  <p className="text-xs text-gray-500 mb-1.5"><span className="text-gray-400">Tab 2</span> &middot; any directory</p>
                  <CodeBlock command="claude mcp add --transport http orchestrator http://localhost:3002/mcp" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orch-500/10 text-orch-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">8</span>
                <div className="w-full">
                  <p className="text-sm text-gray-300 mb-2">Start Claude Code and run a loop</p>
                  <p className="text-xs text-gray-500 mb-1.5"><span className="text-gray-400">Tab 2</span> &middot; <code className="text-gray-400">cd ~/my-project</code></p>
                  <CodeBlock command="claude" />
                  <div className="mt-3 bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 mb-2">Slash commands (installed automatically):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-sm">
                      <div><code className="text-orch-400">/engineering-loop</code> <span className="text-gray-500">— build anything</span></div>
                      <div><code className="text-orch-400">/bugfix-loop</code> <span className="text-gray-500">— fix bugs</span></div>
                      <div><code className="text-orch-400">/distribution-loop</code> <span className="text-gray-500">— distribute to all targets</span></div>
                      <div><code className="text-orch-400">/proposal-loop</code> <span className="text-gray-500">— write proposals</span></div>
                      <div><code className="text-orch-400">/transpose-loop</code> <span className="text-gray-500">— transpose architecture</span></div>
                      <div><code className="text-orch-400">/infra-loop</code> <span className="text-gray-500">— infrastructure</span></div>
                      <div><code className="text-orch-400">/audit-loop</code> <span className="text-gray-500">— system audits</span></div>
                      <div><code className="text-orch-400">/deck-loop</code> <span className="text-gray-500">— slide decks</span></div>
                      <div><code className="text-orch-400">/meta-loop</code> <span className="text-gray-500">— create new loops</span></div>
                      <div><code className="text-orch-400">/learning-loop</code> <span className="text-gray-500">— improve skills</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#222]">
          <p className="text-xs text-gray-500">
            Server: <code className="text-gray-400">http://localhost:3002</code> &middot;
            Health: <code className="text-gray-400">http://localhost:3002/health</code> &middot;
            MCP: <code className="text-gray-400">http://localhost:3002/mcp</code>
          </p>
        </div>
      </div>

      {/* Alternative Install Methods */}
      <div className="mt-10 mb-2">
        <h2 className="text-lg font-semibold text-gray-400">Alternative Install Methods</h2>
        <p className="text-sm text-gray-600 mt-1">Already familiar? Grab the tarball directly.</p>
      </div>

      {/* Latest Release */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{release.name}</h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-orch-500/10 text-orch-400 font-medium">
            Rolling Release
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm">v{version}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formatDate(release.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <GitCommit className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-mono">{commit.slice(0, 12)}</span>
          </div>
        </div>

        {tarball && (
          <a
            href={tarball.browser_download_url}
            className="flex items-center justify-between bg-orch-600 hover:bg-orch-500 text-white rounded-lg px-4 py-3 transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">{tarball.name}</span>
            </div>
            <span className="text-sm text-orch-200">{formatBytes(tarball.size)}</span>
          </a>
        )}

        {checksum && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">SHA-256 checksum</p>
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-3">
              <code className="text-xs text-gray-400 font-mono truncate mr-2">{checksum}</code>
              <CopyButton text={checksum} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
