// Shared singleton AudioContext
// Unlocked on first user gesture (PIN keypress), then reused for all sounds.

let _ctx: AudioContext | null = null;
let _resumePromise: Promise<void> | null = null;

export function getAudioContext(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _ctx;
}

/**
 * Call inside a user-gesture handler (click / keydown).
 * Resumes the AudioContext so subsequent sounds play without restriction.
 */
export function unlockAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state !== 'suspended') return Promise.resolve();
  if (!_resumePromise) {
    _resumePromise = ctx.resume().finally(() => {
      _resumePromise = null;
    });
  }
  return _resumePromise;
}

/**
 * Returns a promise that resolves to a running AudioContext.
 * Always awaits resume so sounds are never blocked.
 */
export async function getRunningAudioContext(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}
