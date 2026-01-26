'use client';

import { useEffect, useState } from 'react';
import { Package, Download, Copy, Check, Container, Terminal, Clock, GitCommit, Tag } from 'lucide-react';

const GITHUB_REPO = 'miles-knowbl/orchestrator';
const DOCKER_IMAGE = `ghcr.io/${GITHUB_REPO}`;

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
  const version = release?.body?.match(/Version: ([\d.]+)/)?.[1] || '0.0.0';
  const commit = release?.body?.match(/Commit: ([a-f0-9]+)/)?.[1] || '';
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
        <div className="w-10 h-10 rounded-lg bg-orch-600 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Distribution</h1>
          <p className="text-sm text-gray-500">Download and install the Orchestrator</p>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{release.name}</h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-orch-500/10 text-orch-400 font-medium">
            Rolling Release
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* One-Command Install */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Install</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          One command — requires Node.js 18+, npm, and git
        </p>
        <CodeBlock command={`curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/main/install.sh | bash`} />
        <p className="text-xs text-gray-500 mt-3">
          Clones the repo, installs dependencies, builds, and creates <code className="text-gray-400">.env</code>. Then run <code className="text-gray-400">cd orchestrator && npm start</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download Tarball */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Tarball</h2>
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

        {/* Docker */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Container className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Docker</h2>
          </div>

          <CodeBlock
            label="Pull the latest image"
            command={`docker pull ${DOCKER_IMAGE}:latest`}
          />

          <div className="mt-4">
            <CodeBlock
              label="Run the server"
              command={`docker run -p 3002:3002 ${DOCKER_IMAGE}:latest`}
            />
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 mt-6">
        <div className="flex items-center gap-2 mb-6">
          <Terminal className="w-5 h-5 text-orch-400" />
          <h2 className="text-lg font-semibold text-white">Quick Start</h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-orch-500/10 text-orch-400 text-xs font-bold flex items-center justify-center">1</span>
              <p className="text-sm text-gray-300">Clone the repository</p>
            </div>
            <CodeBlock command={`git clone https://github.com/${GITHUB_REPO}.git && cd orchestrator`} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-orch-500/10 text-orch-400 text-xs font-bold flex items-center justify-center">2</span>
              <p className="text-sm text-gray-300">Install dependencies and build</p>
            </div>
            <CodeBlock command="npm install && npm run build" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-orch-500/10 text-orch-400 text-xs font-bold flex items-center justify-center">3</span>
              <p className="text-sm text-gray-300">Start the server</p>
            </div>
            <CodeBlock command="npm start" />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#222]">
          <p className="text-xs text-gray-500">
            Server runs on <code className="text-gray-400">http://localhost:3002</code> &middot;
            Dashboard at <code className="text-gray-400">http://localhost:3003</code> &middot;
            MCP endpoint at <code className="text-gray-400">http://localhost:3002/mcp</code>
          </p>
        </div>
      </div>
    </div>
  );
}
