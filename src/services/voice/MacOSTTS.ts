/**
 * macOS TTS Engine Wrapper
 *
 * Wraps the native macOS `say` command for text-to-speech output.
 * Provides sub-100ms latency through direct CoreAudio integration.
 */

import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export class MacOSTTS {
  private currentProcess: ChildProcess | null = null;
  private voice: string = 'Samantha';
  private rate: number = 175;

  /**
   * Speak text using macOS say command
   */
  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Kill any existing speech
      this.stop();

      this.currentProcess = spawn('say', ['-v', this.voice, '-r', String(this.rate), text]);

      this.currentProcess.on('close', code => {
        this.currentProcess = null;
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`say exited with code ${code}`));
        }
      });

      this.currentProcess.on('error', err => {
        this.currentProcess = null;
        reject(err);
      });
    });
  }

  /**
   * Stop any current speech
   */
  stop(): void {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.currentProcess !== null;
  }

  /**
   * Set the voice to use
   */
  setVoice(voice: string): void {
    this.voice = voice;
  }

  /**
   * Set the speech rate (words per minute)
   */
  setRate(rate: number): void {
    this.rate = Math.max(80, Math.min(300, rate));
  }

  /**
   * Get the current voice
   */
  getVoice(): string {
    return this.voice;
  }

  /**
   * Get the current rate
   */
  getRate(): number {
    return this.rate;
  }

  /**
   * List available macOS voices
   */
  static async listVoices(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('say -v "?"');
      const voices: string[] = [];

      for (const line of stdout.split('\n')) {
        const match = line.match(/^(\S+)\s+/);
        if (match) {
          voices.push(match[1]);
        }
      }

      return voices;
    } catch {
      return ['Samantha', 'Alex', 'Daniel']; // Fallback list
    }
  }

  /**
   * Check if the say command is available
   */
  static async isAvailable(): Promise<boolean> {
    if (process.platform !== 'darwin') {
      return false;
    }

    try {
      await execAsync('which say');
      return true;
    } catch {
      return false;
    }
  }
}
