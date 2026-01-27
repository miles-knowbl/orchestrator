'use client';

import { useEffect, useRef } from 'react';
import type { LogEntry } from './types';

export function LogViewer({ logs, autoScroll }: { logs: LogEntry[]; autoScroll: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-gray-300';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'phase': return '\u{1F4CD}';
      case 'skill': return '\u{26A1}';
      case 'gate': return '\u{1F6AA}';
      case 'system': return '\u{1F527}';
      default: return '\u{2022}';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden"
    >
      <div className="p-3 border-b border-[#222] bg-[#111] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Execution Logs</h3>
        <span className="text-xs text-gray-500">{logs.length} entries</span>
      </div>
      <div className="h-[400px] overflow-y-auto p-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No log entries yet
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-1 hover:bg-[#161616] px-2 rounded animate-slide-in"
              >
                <span className="text-gray-600 shrink-0">{formatTime(log.timestamp)}</span>
                <span className="shrink-0">{getCategoryIcon(log.category)}</span>
                <span className={`${getLevelColor(log.level)}`}>
                  {log.message}
                  {log.phase && <span className="text-gray-500 ml-2">[{log.phase}]</span>}
                  {log.skillId && <span className="text-purple-400 ml-2">@{log.skillId}</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
