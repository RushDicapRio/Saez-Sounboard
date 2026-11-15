import { useState, useEffect } from 'react';

export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  duration?: string;
  sourceType: 'youtube' | 'audio';
  url?: string;
  videoId?: string;
}

export interface PlayerState {
  activeTrack: PlayerTrack | null;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number; // 0 to 100
  isMuted: boolean;
  currentTime: number; // en secondes
  duration: number; // en secondes
}

type Listener = (state: PlayerState) => void;

/**
 * Convertit une durée textuelle (ex: "3:45", "01:24", "120") en secondes
 */
export function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 0;
  const str = String(durationStr).trim();
  const parts = str.split(':').map((p) => Number(p.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  const parsed = Number(str);
  return isNaN(parsed) ? 180 : parsed;
}

/**
 * Formate des secondes en mm:ss (ex: 84 -> "01:24")
 */
export function formatSecondsToTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

class SoundboardPlayerManager {
  private state: PlayerState = {
    activeTrack: null,
    isPlaying: false,
    isPaused: false,
    volume: 85,
    isMuted: false,
    currentTime: 0,
    duration: 0,
  };

  private listeners: Set<Listener> = new Set();
  private audioElement: HTMLAudioElement | null = null;
  private progressTimer: any = null;
  private headlessIframe: HTMLIFrameElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.volume = this.state.volume / 100;

      this.audioElement.onended = () => {
        this.stopTrack();
      };

      this.audioElement.ontimeupdate = () => {
        if (this.state.activeTrack?.sourceType === 'audio' && this.audioElement) {
          this.state.currentTime = this.audioElement.currentTime;
          if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
            this.state.duration = this.audioElement.duration;
          }
          this.notify();
        }
      };

      this.audioElement.onerror = (e) => {
        console.warn('Audio HTML5 playback error:', e);
      };
    }
  }

  public getState(): PlayerState {
    return { ...this.state };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Error notifying soundboard player listener:', err);
      }
    });
  }

  /**
   * Assure l'existence d'un iframe YouTube d'arrière-plan discret (headless / sans interface visuelle)
   */
  private getOrCreateHeadlessIframe(): HTMLIFrameElement {
    if (!this.headlessIframe && typeof document !== 'undefined') {
      let iframe = document.getElementById('saez-headless-yt-player') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'saez-headless-yt-player';
        iframe.style.position = 'fixed';
        iframe.style.bottom = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0.001';
        iframe.style.pointerEvents = 'none';
        iframe.style.border = 'none';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        document.body.appendChild(iframe);
      }
      this.headlessIframe = iframe;
    }
    return this.headlessIframe!;
  }

  private postToYouTube(func: string, args: any[] = []) {
    try {
      const iframe = this.getOrCreateHeadlessIframe();
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func,
            args,
          }),
          '*'
        );
      }
    } catch (e) {
      console.warn('postToYouTube notice:', e);
    }
  }

  private startProgressTimer() {
    this.stopProgressTimer();
    this.progressTimer = setInterval(() => {
      if (!this.state.isPlaying || this.state.isPaused) return;

      if (this.state.activeTrack?.sourceType === 'youtube') {
        const nextTime = this.state.currentTime + 0.25;
        if (this.state.duration > 0 && nextTime >= this.state.duration) {
          this.stopTrack();
        } else {
          this.state.currentTime = nextTime;
          this.notify();
        }
      }
    }, 250);
  }

  private stopProgressTimer() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  /**
   * Lance la lecture d'une musique
   */
  public playTrack(track: PlayerTrack): void {
    // Si c'est déjà cette musique en pause, on reprend
    if (
      this.state.activeTrack &&
      this.state.activeTrack.id === track.id &&
      this.state.isPaused
    ) {
      this.resumeTrack();
      return;
    }

    // Arrêter l'audio précédent
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
    }

    const totalSeconds = parseDurationToSeconds(track.duration) || 180;

    this.state.activeTrack = track;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.currentTime = 0;
    this.state.duration = totalSeconds;

    if (track.sourceType === 'youtube' && track.videoId) {
      const iframe = this.getOrCreateHeadlessIframe();
      iframe.src = `https://www.youtube-nocookie.com/embed/${track.videoId}?autoplay=1&enablejsapi=1`;
      this.startProgressTimer();
    } else if (track.sourceType === 'audio' && (track.url || (track as any).audioUrl)) {
      if (this.audioElement) {
        this.audioElement.src = track.url || (track as any).audioUrl;
        this.audioElement.volume = this.state.isMuted ? 0 : this.state.volume / 100;
        this.audioElement.currentTime = 0;
        this.audioElement.play().catch((err) => {
          console.warn('Erreur lecture audio HTML5:', err);
        });
      }
    }

    this.notify();
  }

  /**
   * Met en pause la musique actuelle
   */
  public pauseTrack(): void {
    if (!this.state.activeTrack || !this.state.isPlaying) return;

    if (this.state.activeTrack.sourceType === 'audio' && this.audioElement) {
      this.audioElement.pause();
    } else if (this.state.activeTrack.sourceType === 'youtube') {
      this.postToYouTube('pauseVideo');
      this.stopProgressTimer();
    }

    this.state.isPlaying = false;
    this.state.isPaused = true;
    this.notify();
  }

  /**
   * Reprend la musique mise en pause
   */
  public resumeTrack(): void {
    if (!this.state.activeTrack || !this.state.isPaused) return;

    if (this.state.activeTrack.sourceType === 'audio' && this.audioElement) {
      this.audioElement.play().catch((err) => {
        console.warn('Erreur reprise audio HTML5:', err);
      });
    } else if (this.state.activeTrack.sourceType === 'youtube') {
      this.postToYouTube('playVideo');
      this.startProgressTimer();
    }

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.notify();
  }

  /**
   * Alterne Lecture / Pause
   */
  public togglePlayPause(track?: PlayerTrack): void {
    if (!track) {
      if (this.state.isPlaying) {
        this.pauseTrack();
      } else if (this.state.isPaused) {
        this.resumeTrack();
      }
      return;
    }

    const isCurrent = this.state.activeTrack?.id === track.id || (track.videoId && this.state.activeTrack?.videoId === track.videoId);
    if (isCurrent) {
      if (this.state.isPlaying) {
        this.pauseTrack();
      } else {
        this.resumeTrack();
      }
    } else {
      this.playTrack(track);
    }
  }

  /**
   * Navigation temporelle dans le morceau (Seek)
   */
  public seek(seconds: number): void {
    const clamped = Math.max(0, Math.min(this.state.duration || 100, seconds));
    this.state.currentTime = clamped;

    if (this.state.activeTrack?.sourceType === 'audio' && this.audioElement) {
      this.audioElement.currentTime = clamped;
    } else if (this.state.activeTrack?.sourceType === 'youtube') {
      this.postToYouTube('seekTo', [clamped, true]);
    }

    this.notify();
  }

  /**
   * Arrête totalement la lecture en cours
   */
  public stopTrack(): void {
    this.stopProgressTimer();

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
    }

    if (this.state.activeTrack?.sourceType === 'youtube') {
      this.postToYouTube('stopVideo');
      if (this.headlessIframe) {
        this.headlessIframe.src = 'about:blank';
      }
    }

    this.state.activeTrack = null;
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentTime = 0;
    this.notify();
  }

  /**
   * Modifie le volume sonore (0 - 100)
   */
  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(100, volume));
    this.state.volume = clamped;
    if (this.audioElement) {
      this.audioElement.volume = this.state.isMuted ? 0 : clamped / 100;
    }
    if (this.state.activeTrack?.sourceType === 'youtube') {
      this.postToYouTube('setVolume', [this.state.isMuted ? 0 : clamped]);
    }
    this.notify();
  }

  /**
   * Active ou désactive le mode muet
   */
  public toggleMute(): void {
    this.state.isMuted = !this.state.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.state.isMuted ? 0 : this.state.volume / 100;
    }
    if (this.state.activeTrack?.sourceType === 'youtube') {
      this.postToYouTube(this.state.isMuted ? 'mute' : 'unMute');
    }
    this.notify();
  }
}

export const soundboardPlayer = new SoundboardPlayerManager();

/**
 * Hook React pour interagir avec le lecteur Soundboard
 */
export function useSoundboardPlayer() {
  const [playerState, setPlayerState] = useState<PlayerState>(() => soundboardPlayer.getState());

  useEffect(() => {
    const unsubscribe = soundboardPlayer.subscribe((newState) => {
      setPlayerState(newState);
    });
    return unsubscribe;
  }, []);

  return {
    ...playerState,
    playTrack: (track: PlayerTrack) => soundboardPlayer.playTrack(track),
    pauseTrack: () => soundboardPlayer.pauseTrack(),
    resumeTrack: () => soundboardPlayer.resumeTrack(),
    togglePlayPause: (track?: PlayerTrack) => soundboardPlayer.togglePlayPause(track),
    seek: (seconds: number) => soundboardPlayer.seek(seconds),
    stopTrack: () => soundboardPlayer.stopTrack(),
    setVolume: (vol: number) => soundboardPlayer.setVolume(vol),
    toggleMute: () => soundboardPlayer.toggleMute(),
  };
}
