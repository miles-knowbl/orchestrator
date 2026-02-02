'use client';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isLive: boolean;
  speed: number;
  position: number; // 0-1
  totalEvents: number;
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onSpeedChange: (speed: number) => void;
  onGoLive: () => void;
}

const SPEEDS = [0.5, 1, 2, 4];

export default function PlaybackControls({
  isPlaying,
  isLive,
  speed,
  position,
  totalEvents,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onGoLive,
}: PlaybackControlsProps) {
  return (
    <div className="mt-6 bg-[#0d0d0d] rounded-lg p-4 border border-[#222]">
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center text-white transition-colors"
          disabled={isLive}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <polygon points="4,2 14,8 4,14" />
            </svg>
          )}
        </button>

        {/* Seek bar */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={isLive ? 100 : position * 100}
            onChange={(e) => onSeek(Number(e.target.value) / 100)}
            disabled={isLive}
            className="w-full h-2 bg-[#222] rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-emerald-500
              [&::-webkit-slider-thumb]:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Math.round(position * totalEvents)} events</span>
            <span>{totalEvents} total</span>
          </div>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              disabled={isLive}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                speed === s && !isLive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222] disabled:opacity-50'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Live button */}
        <button
          onClick={onGoLive}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isLive
              ? 'bg-emerald-600 text-white'
              : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
          }`}
        >
          <span className="flex items-center gap-2">
            {isLive && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
            LIVE
          </span>
        </button>
      </div>
    </div>
  );
}
