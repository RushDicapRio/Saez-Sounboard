/**
 * Saez Soundboard Service - Moteur Audio Client PC & Tauri Natif
 * Permet de fusionner le microphone physique et les sons de la soundboard en continu (Mode Soundpad).
 * Plus JAMAIS besoin d'interchanger les entrées sur Discord !
 */
import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import initialLikedTracks from '../data/likedTracks.json';
import type {
  AudioDeviceOption,
  SoundboardItem,
  YoutubeTrackItem,
  Track,
  YouTubePlaylist,
  YouTubeUserProfile,
  YouTubeAuthConfig,
  BikeLifeTrack,
  BikeLifeGenre,
  LikedMusicTrack,
  YouTubeAuthStatus,
} from '../types/soundboard';
import { generateBikeLifeBeatWavUrl } from './bikeLifeAudio';

const STORAGE_CUSTOM_SOUNDS = 'saez_soundboard_custom_sounds';
const LEGACY_STORAGE_CUSTOM_SOUNDS = 'saez_custom_soundboard_sounds';
const STORAGE_SOUNDBOARD_VOL = 'saez_soundboard_master_vol';
const STORAGE_SELECTED_MIC = 'saez_soundboard_selected_mic';
const STORAGE_LIKED_TRACKS = 'saez_soundboard_liked_tracks';
const STORAGE_PLAYLISTS = 'saez_soundboard_playlists';
const STORAGE_BIKELIFE_CUSTOM = 'saez_soundboard_bikelife_custom_tracks';

export const BUILTIN_BIKELIFE_TRACKS: BikeLifeTrack[] = [
  {
    id: 'bl_phonk_1',
    title: 'Drift Phonk - Wheelie Madness',
    artist: 'Kuro Rider',
    genre: 'Phonk',
    url: '',
    duration: '2:45',
    volume: 100,
    bpm: 160,
    coverColor: '#ef4444',
  },
  {
    id: 'bl_drill_1',
    title: 'MT-07 Stunt Drill',
    artist: 'Paris 808 Squad',
    genre: 'Drill',
    url: '',
    duration: '2:30',
    volume: 100,
    bpm: 142,
    coverColor: '#00e5ff',
  },
  {
    id: 'bl_brazilian_1',
    title: 'Montagem Grau Favela',
    artist: 'DJ Automotivo Grau',
    genre: 'Brazilian Funk',
    url: '',
    duration: '2:15',
    volume: 100,
    bpm: 130,
    coverColor: '#10b981',
  },
  {
    id: 'bl_trap_1',
    title: 'Highway 300 Night Ride',
    artist: 'Speed Demon Trap',
    genre: 'Trap',
    url: '',
    duration: '3:05',
    volume: 100,
    bpm: 140,
    coverColor: '#a855f7',
  },
  {
    id: 'bl_bass_1',
    title: 'Throttle Overdrive Bass',
    artist: 'Supermoto Bass VIP',
    genre: 'Bass Music',
    url: '',
    duration: '2:50',
    volume: 100,
    bpm: 128,
    coverColor: '#f59e0b',
  },
  {
    id: 'bl_remix_1',
    title: 'Adrenaline Rush (Hard Electro Remix)',
    artist: 'HyperDrive Ride',
    genre: 'Remix',
    url: '',
    duration: '3:20',
    volume: 100,
    bpm: 148,
    coverColor: '#ec4899',
  },
  {
    id: 'bl_phonk_2',
    title: 'TMAX Ghost Phonk 160',
    artist: 'Ghost Squadron',
    genre: 'Phonk',
    url: '',
    duration: '2:38',
    volume: 100,
    bpm: 160,
    coverColor: '#dc2626',
  },
  {
    id: 'bl_drill_2',
    title: 'Midnight Cabrage Drill',
    artist: 'Stunt Squad FR',
    genre: 'Drill',
    url: '',
    duration: '2:55',
    volume: 100,
    bpm: 144,
    coverColor: '#3b82f6',
  },
  {
    id: 'bl_brazilian_2',
    title: 'Brazilian Phonk Grau da Leste',
    artist: 'MC Grau & DJ Sp',
    genre: 'Brazilian Funk',
    url: '',
    duration: '2:22',
    volume: 100,
    bpm: 132,
    coverColor: '#059669',
  },
  {
    id: 'bl_trap_2',
    title: '808 Wheelie Bikelife',
    artist: 'Trap Gang Moto',
    genre: 'Trap',
    url: '',
    duration: '3:10',
    volume: 100,
    bpm: 138,
    coverColor: '#9333ea',
  },
];

export const BUILTIN_SOUNDBOARD_SOUNDS: SoundboardItem[] = [
  {
    id: 'airhorn',
    name: 'Airhorn MLG',
    category: 'Mèmes & Fun',
    icon: '🎺',
    url: 'https://cdn.freesound.org/previews/368/368691_5121236-lq.mp3',
    color: '#ef4444',
    duration: '0:03',
    hotkey: 'Numpad 1',
  },
  {
    id: 'bruh',
    name: 'Bruh Sound',
    category: 'Mèmes & Fun',
    icon: '🗿',
    url: 'https://www.myinstants.com/media/sounds/movie_1.mp3',
    color: '#8b5cf6',
    duration: '0:02',
    hotkey: 'Numpad 2',
  },
  {
    id: 'metal-pipe',
    name: 'Metal Pipe Falling',
    category: 'Mèmes & Fun',
    icon: '🏗️',
    url: 'https://www.myinstants.com/media/sounds/metal-pipe-falling-sound-effect.mp3',
    color: '#94a3b8',
    duration: '0:03',
    hotkey: 'Numpad 3',
  },
  {
    id: 'vine-boom',
    name: 'Vine Boom Effect',
    category: 'Mèmes & Fun',
    icon: '💥',
    url: 'https://www.myinstants.com/media/sounds/vine-boom.mp3',
    color: '#f97316',
    duration: '0:02',
    hotkey: 'Numpad 4',
  },
  {
    id: 'fbi-open-up',
    name: 'FBI Open Up !',
    category: 'Mèmes & Fun',
    icon: '🚨',
    url: 'https://www.myinstants.com/media/sounds/fbi-open-up_m37dU4P.mp3',
    color: '#dc2626',
    duration: '0:03',
    hotkey: 'Numpad 5',
  },
  {
    id: 'anime-wow',
    name: 'Anime Wow !',
    category: 'Anime & Réactions',
    icon: '✨',
    url: 'https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3',
    color: '#ec4899',
    duration: '0:02',
    hotkey: 'Numpad 6',
  },
  {
    id: 'nani',
    name: 'Omae Wa Mou - NANI?!',
    category: 'Anime & Réactions',
    icon: '⚡',
    url: 'https://www.myinstants.com/media/sounds/nani-sound-effect.mp3',
    color: '#f59e0b',
    duration: '0:04',
    hotkey: 'Numpad 7',
  },
  {
    id: 'rickroll-short',
    name: 'Rick Roll Instant',
    category: 'Mèmes & Fun',
    icon: '🕺',
    url: 'https://www.myinstants.com/media/sounds/rick-roll.mp3',
    color: '#06b6d4',
    duration: '0:18',
    hotkey: 'Numpad 8',
  },
  {
    id: 'sad-violin',
    name: 'Sad Violin',
    category: 'Mèmes & Fun',
    icon: '🎻',
    url: 'https://www.myinstants.com/media/sounds/sad-violin.mp3',
    color: '#6366f1',
    duration: '0:10',
    hotkey: 'Numpad 9',
  },
  {
    id: 'drumroll',
    name: 'Roulement de Tambour',
    category: 'Effets Sonores',
    icon: '🥁',
    url: 'https://www.myinstants.com/media/sounds/drum-roll-sound-effect.mp3',
    color: '#eab308',
    duration: '0:04',
  },
  {
    id: 'roblox-oof',
    name: 'Roblox Oof Death',
    category: 'Gaming',
    icon: '💀',
    url: 'https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3',
    color: '#10b981',
    duration: '0:01',
  },
  {
    id: 'victory-fanfare',
    name: 'Final Fantasy Victory',
    category: 'Gaming',
    icon: '🏆',
    url: 'https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare.mp3',
    color: '#3b82f6',
    duration: '0:05',
  },
  {
    id: 'fail-trombone',
    name: 'Fail Wah Wah Wah',
    category: 'Mèmes & Fun',
    icon: '🤡',
    url: 'https://www.myinstants.com/media/sounds/sadtrombone.mp3',
    color: '#ea580c',
    duration: '0:04',
  },
  {
    id: 'applause',
    name: 'Applaudissements VIP',
    category: 'Effets Sonores',
    icon: '👏',
    url: 'https://cdn.freesound.org/previews/448/448080_9286466-lq.mp3',
    color: '#14b8a6',
    duration: '0:06',
  },
  {
    id: 'bwaam-inception',
    name: 'Inception BWAAM !',
    category: 'Effets Sonores',
    icon: '💥',
    url: 'https://www.myinstants.com/media/sounds/inception-button.mp3',
    color: '#d946ef',
    duration: '0:05',
  },
  {
    id: 'illuminati',
    name: 'X-Files Illuminati',
    category: 'Mèmes & Fun',
    icon: '👁️',
    url: 'https://www.myinstants.com/media/sounds/the-x-files-theme-song.mp3',
    color: '#10b981',
    duration: '0:12',
  },
  {
    id: 'windows-error',
    name: 'Windows XP Erreur',
    category: 'Gaming',
    icon: '💻',
    url: 'https://www.myinstants.com/media/sounds/windows-xp-error.mp3',
    color: '#3b82f6',
    duration: '0:01',
  },
  {
    id: 'coffin-dance',
    name: 'Coffin Dance (Astronomia)',
    category: 'Mèmes & Fun',
    icon: '⚰️',
    url: 'https://www.myinstants.com/media/sounds/coffin-dance.mp3',
    color: '#f43f5e',
    duration: '0:15',
  },
  {
    id: 'emotional-damage',
    name: 'Emotional Damage !',
    category: 'Mèmes & Fun',
    icon: '💔',
    url: 'https://www.myinstants.com/media/sounds/emotional-damage-meme.mp3',
    color: '#f43f5e',
    duration: '0:03',
  },
  {
    id: 'directed-by',
    name: 'Directed by Robert B.',
    category: 'Mèmes & Fun',
    icon: '🎬',
    url: 'https://www.myinstants.com/media/sounds/curb-your-enthusiasm-theme_4.mp3',
    color: '#a855f7',
    duration: '0:14',
  },
];

class MicrophoneSoundboardManager {
  private activeAudios: HTMLAudioElement[] = [];
  public volume: number = 100;

  // Fusion Micro Passthrough (Mode Soundpad)
  public isFusionActive: boolean = false;
  public cableOutputDevice: AudioDeviceOption | null = null;
  public availableMics: AudioDeviceOption[] = [];
  public selectedMicId: string = '';

  private micStream: MediaStream | null = null;
  private micForwardAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  public currentMicLevel: number = 0; // 0 to 100
  private levelAnimId: number | null = null;

  constructor() {
    this.volume = Number(localStorage.getItem(STORAGE_SOUNDBOARD_VOL)) || 100;
    this.selectedMicId = localStorage.getItem(STORAGE_SELECTED_MIC) || '';
  }

  public setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(150, v));
    try {
      localStorage.setItem(STORAGE_SOUNDBOARD_VOL, String(this.volume));
    } catch {}
    for (const a of this.activeAudios) {
      a.volume = Math.min(1, this.volume / 100);
    }
  }

  /**
   * Scanne les périphériques audio Windows : trouve CABLE Input et les microphones physiques
   */
  public async scanDevices(): Promise<{
    hasCable: boolean;
    cableDevice: AudioDeviceOption | null;
    mics: AudioDeviceOption[];
  }> {
    let hasCable = false;
    let cableDevice: AudioDeviceOption | null = null;
    const mics: AudioDeviceOption[] = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const temp = await navigator.mediaDevices.getUserMedia({ audio: true });
          temp.getTracks().forEach((t) => t.stop());
        } catch {}
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      // 1. Chercher la sortie CABLE Input (VB-Audio Virtual Cable)
      const outputs = devices.filter((d) => d.kind === 'audiooutput');
      for (const d of outputs) {
        const lbl = d.label || '';
        if (/cable|vb-audio|virtual/i.test(lbl)) {
          hasCable = true;
          cableDevice = {
            deviceId: d.deviceId,
            label: lbl || 'CABLE Input (VB-Audio Virtual Cable)',
            kind: d.kind,
            isVirtual: true,
          };
          break;
        }
      }

      // 2. Microphones d'entrée physiques
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      for (const d of inputs) {
        const lbl = d.label || `Microphone (${d.deviceId.slice(0, 5)})`;
        const isVirtual = /cable|virtual|voicemeeter/i.test(lbl);
        if (!isVirtual) {
          mics.push({
            deviceId: d.deviceId,
            label: lbl,
            kind: d.kind,
            isVirtual: false,
          });
        }
      }

      this.cableOutputDevice = cableDevice;
      this.availableMics = mics;

      if (!this.selectedMicId && mics.length > 0) {
        this.selectedMicId = mics[0].deviceId;
      }
    } catch (err) {
      console.warn('Erreur scanDevices:', err);
    }

    return { hasCable, cableDevice, mics };
  }

  /**
   * Active la fusion en continu : votre vrai micro est retransmis dans le câble en temps réel.
   * Vous parlez normalement ET vous jouez des sons en même temps.
   */
  public async startFusion(micDeviceId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (micDeviceId) {
        this.selectedMicId = micDeviceId;
        try {
          localStorage.setItem(STORAGE_SELECTED_MIC, micDeviceId);
        } catch {}
      }

      this.stopFusion();

      if (!this.cableOutputDevice) {
        await this.scanDevices();
      }

      if (!this.cableOutputDevice) {
        return {
          success: false,
          error: "Périphérique CABLE Input non détecté. Activez 'VB-Audio Virtual Cable' dans Windows.",
        };
      }

      const constraints: MediaStreamConstraints = {
        audio: this.selectedMicId
          ? {
              deviceId: { exact: this.selectedMicId },
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            }
          : true,
      };

      this.micStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Transmettre le flux du micro directement dans CABLE Input
      this.micForwardAudio = new Audio();
      this.micForwardAudio.srcObject = this.micStream;

      if (typeof (this.micForwardAudio as any).setSinkId === 'function') {
        await (this.micForwardAudio as any).setSinkId(this.cableOutputDevice.deviceId);
      }

      await this.micForwardAudio.play();

      // Analyser le volume du micro en direct pour afficher la jauge verte à l'écran
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtx();
        const src = this.audioCtx.createMediaStreamSource(this.micStream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        src.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!this.analyser || !this.isFusionActive) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          this.currentMicLevel = Math.min(100, Math.round((avg / 128) * 100));
          this.levelAnimId = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch {}

      this.isFusionActive = true;
      return { success: true };
    } catch (err: any) {
      console.error('Erreur startFusion:', err);
      this.stopFusion();
      return { success: false, error: err.message };
    }
  }

  /**
   * Désactive la fusion micro
   */
  public stopFusion(): void {
    this.isFusionActive = false;
    this.currentMicLevel = 0;

    if (this.levelAnimId) {
      cancelAnimationFrame(this.levelAnimId);
      this.levelAnimId = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }

    if (this.micForwardAudio) {
      try {
        this.micForwardAudio.pause();
        this.micForwardAudio.srcObject = null;
      } catch {}
      this.micForwardAudio = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {}
      this.audioCtx = null;
      this.analyser = null;
    }
  }

  /**
   * Joue un son :
   * 1. Dans le casque pour l'utilisateur
   * 2. Directement dans CABLE Input pour Discord (si la fusion est active)
   */
  public async playSound(soundUrl: string, onEnded?: () => void): Promise<{ success: boolean; error?: string }> {
    try {
      let finalUrl = soundUrl.trim();

      // Résolution si flux YouTube
      if (
        finalUrl.includes('youtube.com') ||
        finalUrl.includes('youtu.be') ||
        (!finalUrl.startsWith('http://') &&
          !finalUrl.startsWith('https://') &&
          !finalUrl.startsWith('blob:') &&
          !finalUrl.startsWith('data:') &&
          !finalUrl.startsWith('asset:'))
      ) {
        const resolved = await resolveYoutubeAudioUrl(finalUrl);
        if (resolved) {
          finalUrl = resolved;
        } else {
          return { success: false, error: "Impossible d'extraire le flux audio YouTube pour cette piste." };
        }
      }

      // 1. Sortie Casque local
      const localAudio = new Audio();
      localAudio.src = finalUrl;
      localAudio.volume = Math.min(1, this.volume / 100);
      this.activeAudios.push(localAudio);

      localAudio.onended = () => {
        this.activeAudios = this.activeAudios.filter((a) => a !== localAudio);
        if (onEnded) onEnded();
      };

      localAudio.onerror = (e) => {
        console.warn('Erreur lecture audio local:', e);
        this.activeAudios = this.activeAudios.filter((a) => a !== localAudio);
        if (onEnded) onEnded();
      };

      localAudio.load();
      await localAudio.play();

      // 2. Injection simultanée dans CABLE Input
      if (this.isFusionActive && this.cableOutputDevice) {
        const cableAudio = new Audio();
        cableAudio.src = finalUrl;
        cableAudio.volume = Math.min(1, this.volume / 100);

        if (typeof (cableAudio as any).setSinkId === 'function') {
          try {
            await (cableAudio as any).setSinkId(this.cableOutputDevice.deviceId);
          } catch (e: any) {
            console.warn('Could not setSinkId on cableAudio:', e.message);
          }
        }

        this.activeAudios.push(cableAudio);
        cableAudio.onended = () => {
          this.activeAudios = this.activeAudios.filter((a) => a !== cableAudio);
        };
        cableAudio.onerror = (e) => {
          console.warn('Erreur cableAudio:', e);
          this.activeAudios = this.activeAudios.filter((a) => a !== cableAudio);
        };
        cableAudio.load();
        cableAudio.play().catch((e) => console.debug('Cable audio play notice:', e.message));
      }

      return { success: true };
    } catch (err: any) {
      console.error('Erreur lecture soundboard:', err);
      return { success: false, error: err.message };
    }
  }

  // ── BIKE LIFE TRACK PLAYBACK ──
  public currentBikeLifeAudio: HTMLAudioElement | null = null;
  public currentBikeLifeCableAudio: HTMLAudioElement | null = null;
  public currentBikeLifeTrackId: string | null = null;
  public isBikeLifePaused: boolean = false;
  private trackVolumes: Map<string, number> = new Map();

  public getTrackVolume(trackId: string): number {
    return this.trackVolumes.get(trackId) ?? 100;
  }

  public setTrackVolume(trackId: string, vol: number): void {
    const cleanVol = Math.max(0, Math.min(100, vol));
    this.trackVolumes.set(trackId, cleanVol);
    if (this.currentBikeLifeTrackId === trackId && this.currentBikeLifeAudio) {
      const computed = (cleanVol / 100) * (this.volume / 100);
      this.currentBikeLifeAudio.volume = Math.min(1, Math.max(0, computed));
      if (this.currentBikeLifeCableAudio) {
        this.currentBikeLifeCableAudio.volume = Math.min(1, Math.max(0, computed));
      }
    }
  }

  public async playBikeLifeTrack(
    track: BikeLifeTrack,
    onEnded?: () => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Reprise si la même piste était en pause
      if (
        this.currentBikeLifeTrackId === track.id &&
        this.currentBikeLifeAudio &&
        this.isBikeLifePaused
      ) {
        await this.currentBikeLifeAudio.play();
        if (this.currentBikeLifeCableAudio) {
          this.currentBikeLifeCableAudio.play().catch(() => {});
        }
        this.isBikeLifePaused = false;
        return { success: true };
      }

      // 2. Arrêt de l'éventuelle piste en cours
      this.stopBikeLifeTrack();

      // 3. Obtention de l'URL audio (URL distante/locale ou génération procédurale instantanée)
      let audioUrl = track.url?.trim() || '';
      if (!audioUrl) {
        audioUrl = await generateBikeLifeBeatWavUrl(track.genre);
      }

      const trackVol = this.getTrackVolume(track.id);
      const computedVol = Math.min(1, Math.max(0, (trackVol / 100) * (this.volume / 100)));

      // 4. Lecture casque local
      const localAudio = new Audio();
      localAudio.src = audioUrl;
      localAudio.loop = true;
      localAudio.volume = computedVol;

      this.currentBikeLifeAudio = localAudio;
      this.currentBikeLifeTrackId = track.id;
      this.isBikeLifePaused = false;
      this.activeAudios.push(localAudio);

      localAudio.onended = () => {
        this.currentBikeLifeTrackId = null;
        this.isBikeLifePaused = false;
        this.activeAudios = this.activeAudios.filter((a) => a !== localAudio);
        if (onEnded) onEnded();
      };

      localAudio.onerror = (e) => {
        console.warn('Notice lecture Bike Life:', e);
      };

      await localAudio.play();

      // 5. CABLE Input pour Discord
      if (this.isFusionActive && this.cableOutputDevice) {
        const cableAudio = new Audio();
        cableAudio.src = audioUrl;
        cableAudio.loop = true;
        cableAudio.volume = computedVol;

        if (typeof (cableAudio as any).setSinkId === 'function') {
          try {
            await (cableAudio as any).setSinkId(this.cableOutputDevice.deviceId);
          } catch (e: any) {
            console.warn('Could not setSinkId for Bike Life:', e.message);
          }
        }

        this.currentBikeLifeCableAudio = cableAudio;
        this.activeAudios.push(cableAudio);
        cableAudio.play().catch((e) => console.debug('Cable notice:', e.message));
      }

      return { success: true };
    } catch (err: any) {
      console.error('Erreur playBikeLifeTrack:', err);
      return { success: false, error: err.message };
    }
  }

  public pauseBikeLifeTrack(): void {
    if (this.currentBikeLifeAudio && !this.isBikeLifePaused) {
      this.currentBikeLifeAudio.pause();
      if (this.currentBikeLifeCableAudio) {
        this.currentBikeLifeCableAudio.pause();
      }
      this.isBikeLifePaused = true;
    }
  }

  public stopBikeLifeTrack(): void {
    if (this.currentBikeLifeAudio) {
      try {
        this.currentBikeLifeAudio.pause();
        this.currentBikeLifeAudio.currentTime = 0;
      } catch {}
      this.activeAudios = this.activeAudios.filter((a) => a !== this.currentBikeLifeAudio);
      this.currentBikeLifeAudio = null;
    }
    if (this.currentBikeLifeCableAudio) {
      try {
        this.currentBikeLifeCableAudio.pause();
        this.currentBikeLifeCableAudio.currentTime = 0;
      } catch {}
      this.activeAudios = this.activeAudios.filter((a) => a !== this.currentBikeLifeCableAudio);
      this.currentBikeLifeCableAudio = null;
    }
    this.currentBikeLifeTrackId = null;
    this.isBikeLifePaused = false;
  }

  /**
   * Stoppe immédiatement tous les sons en cours de diffusion
   */
  public stopAll(): void {
    this.stopBikeLifeTrack();
    for (const a of this.activeAudios) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
    }
    this.activeAudios = [];
  }

  public isPlaying(): boolean {
    return this.activeAudios.length > 0;
  }
}

export const soundboardEngine = new MicrophoneSoundboardManager();

/**
 * Gestion des sons personnalisés en LocalStorage
 */
export function getCustomSounds(): SoundboardItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_SOUNDS) || localStorage.getItem(LEGACY_STORAGE_CUSTOM_SOUNDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomSound(sound: Omit<SoundboardItem, 'id' | 'isCustom'>): SoundboardItem {
  const current = getCustomSounds();
  const newItem: SoundboardItem = {
    ...sound,
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    isCustom: true,
  };
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_CUSTOM_SOUNDS, JSON.stringify(updated));
  } catch {}
  return newItem;
}

export function updateCustomSound(id: string, sound: Partial<SoundboardItem>): boolean {
  const current = getCustomSounds();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...sound };
  try {
    localStorage.setItem(STORAGE_CUSTOM_SOUNDS, JSON.stringify(current));
  } catch {}
  return true;
}

export function deleteCustomSound(id: string): void {
  const current = getCustomSounds();
  const updated = current.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_CUSTOM_SOUNDS, JSON.stringify(updated));
  } catch {}
}

export function exportSoundsToJson(): string {
  const sounds = getCustomSounds();
  return JSON.stringify(sounds, null, 2);
}

export function importSoundsFromJson(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'Format invalide: liste attendue.' };
    }
    const current = getCustomSounds();
    const existingIds = new Set(current.map((s) => s.id));
    let count = 0;

    for (const item of parsed) {
      if (item && item.name && item.url) {
        const id = item.id && !existingIds.has(item.id) ? item.id : `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        current.push({
          id,
          name: String(item.name),
          category: item.category || '⭐ Personnalisés',
          icon: item.icon || '🔊',
          url: String(item.url),
          color: item.color || '#3b82f6',
          hotkey: item.hotkey,
          duration: item.duration,
          isCustom: true,
        });
        existingIds.add(id);
        count++;
      }
    }
    localStorage.setItem(STORAGE_CUSTOM_SOUNDS, JSON.stringify(current));
    return { success: true, count };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * Recherche YouTube directe via Tauri natif (Rust)
 */
export async function searchYoutubeSound(query: string): Promise<YoutubeTrackItem[]> {
  if (!query.trim()) return [];

  try {
    const raw = await invoke<any[]>('search_music_tracks', { query: query.trim() });
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.slice(0, 15).map((t) => {
        const vid = t.video_id || t.videoId || '';
        return {
          id: vid,
          title: t.title || 'Titre inconnu',
          artist: t.artist || 'Chaîne YouTube',
          duration: t.duration || '--:--',
          url: `https://www.youtube.com/watch?v=${vid}`,
          thumbnail: t.thumbnail || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : ''),
        };
      });
    }
  } catch (err) {
    console.debug('Tauri search_music_tracks notice:', err);
  }

  return [];
}

/**
 * Extraction du flux audio YouTube direct via Tauri natif (Rust)
 */
export async function resolveYoutubeAudioUrl(queryOrUrl: string): Promise<string | null> {
  if (!queryOrUrl.trim()) return null;

  try {
    let videoId = queryOrUrl.trim();
    const vMatch = queryOrUrl.match(/(?:v=|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (vMatch) {
      videoId = vMatch[1];
    }
    const rawUrl = await invoke<string>('resolve_music_stream', { video_id: videoId, videoId });
    if (rawUrl) {
      if (!rawUrl.startsWith('http')) {
        return convertFileSrc(rawUrl);
      }
      return rawUrl;
    }
  } catch (err) {
    console.debug('Tauri resolve_music_stream notice:', err);
  }

  return null;
}

const YOUTUBE_COOKIES_KEY = 'saez_yt_cookies';

export function getUserYouTubeCookies(): string {
  try {
    return (
      localStorage.getItem(YOUTUBE_COOKIES_KEY) ||
      localStorage.getItem('anistream_yt_cookies') ||
      ''
    );
  } catch {
    return '';
  }
}

export function saveUserYouTubeCookies(cookies: string): void {
  try {
    localStorage.setItem(YOUTUBE_COOKIES_KEY, cookies.trim());
    localStorage.setItem('anistream_yt_cookies', cookies.trim());
  } catch {}
}

/**
 * Titres likés & Playlists
 */
export function getLikedTracks(): Track[] {
  try {
    const raw = localStorage.getItem(STORAGE_LIKED_TRACKS) || localStorage.getItem('anistream_liked_tracks');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  const tracks: Track[] = (initialLikedTracks as any[]).map((t) => ({
    video_id: t.video_id,
    title: t.title,
    artist: t.artist,
    duration: t.duration || '',
    thumbnail: `https://i.ytimg.com/vi/${t.video_id}/hqdefault.jpg`,
  }));

  try {
    localStorage.setItem(STORAGE_LIKED_TRACKS, JSON.stringify(tracks));
  } catch {}
  return tracks;
}

export function saveLikedTracks(tracks: Track[]): void {
  try {
    localStorage.setItem(STORAGE_LIKED_TRACKS, JSON.stringify(tracks));
  } catch {}
}

export function getUserPlaylists(): YouTubePlaylist[] {
  try {
    const raw = localStorage.getItem(STORAGE_PLAYLISTS) || localStorage.getItem('anistream_user_playlists');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserPlaylists(playlists: YouTubePlaylist[]): void {
  try {
    localStorage.setItem(STORAGE_PLAYLISTS, JSON.stringify(playlists));
  } catch {}
}

export async function importYouTubePlaylist(
  url: string,
  title?: string
): Promise<{ success: boolean; playlist?: YouTubePlaylist; error?: string }> {
  try {
    const cookies = getUserYouTubeCookies();
    const tracks = await invoke<any[]>('fetch_youtube_music_playlist', {
      playlist_url: url,
      playlistUrl: url,
      cookies_text: cookies || null,
      cookiesText: cookies || null,
      limit: 100,
    });

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return { success: false, error: 'Aucun morceau trouvé dans la playlist.' };
    }

    const playlistTitle = title || `Playlist (${tracks.length} titres)`;
    const newPlaylist: YouTubePlaylist = {
      id: `pl_${Date.now()}`,
      title: playlistTitle,
      url,
      tracks: tracks.map((t) => ({
        video_id: t.video_id || '',
        title: t.title || '',
        artist: t.artist || '',
        duration: t.duration,
        thumbnail: t.thumbnail,
      })),
      track_count: tracks.length,
      thumbnail: tracks[0]?.thumbnail,
      created_at: new Date().toISOString(),
    };

    const current = getUserPlaylists();
    const updated = [newPlaylist, ...current];
    saveUserPlaylists(updated);

    return { success: true, playlist: newPlaylist };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur d'import de la playlist" };
  }
}

export async function syncUserPlaylistsFromCookies(
  cookies?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  const finalCookies = cookies !== undefined ? cookies : getUserYouTubeCookies();
  try {
    const raw = await invoke<any[]>('fetch_user_youtube_playlists', {
      cookies_text: finalCookies || null,
      cookiesText: finalCookies || null,
    });

    if (Array.isArray(raw) && raw.length > 0) {
      const current = getUserPlaylists();
      const existingUrls = new Set(current.map((p) => p.url));
      let count = 0;

      for (const item of raw) {
        if (!existingUrls.has(item.url)) {
          current.push({
            id: item.id || `pl_${Date.now()}_${count}`,
            title: item.title || 'Playlist YouTube',
            url: item.url,
            thumbnail: item.thumbnail,
            track_count: item.track_count || 0,
            tracks: [],
          });
          count++;
        }
      }

      saveUserPlaylists(current);
      return { success: true, count };
    }

    return { success: true, count: 0 };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

const STORAGE_LIKED_MUSICS = 'saez_soundboard_liked_musics_cache';

export async function getYouTubeAuthStatus(): Promise<YouTubeAuthStatus> {
  try {
    return await invoke<YouTubeAuthStatus>('get_youtube_status');
  } catch (err: any) {
    return {
      is_authenticated: false,
      has_api_access: false,
      message: err?.message || 'Erreur lors de la vérification du statut YouTube',
    };
  }
}

export async function fetchUserYouTubePlaylists(cookies?: string): Promise<YouTubePlaylist[]> {
  const finalCookies = cookies !== undefined ? cookies : getUserYouTubeCookies();
  try {
    const raw = await invoke<any[]>('fetch_user_youtube_playlists', {
      cookies_text: finalCookies || null,
      cookiesText: finalCookies || null,
    });

    const playlists: YouTubePlaylist[] = (raw || []).map((item, idx) => ({
      id: item.id || `pl_${idx}`,
      title: item.title || 'Playlist YouTube',
      url: item.url,
      thumbnail: item.thumbnail,
      track_count: item.track_count || 0,
      tracks: [],
      is_private: !!item.is_private,
    }));

    if (playlists.length > 0) {
      saveUserPlaylists(playlists);
    }
    return playlists;
  } catch {
    return getUserPlaylists();
  }
}

export async function fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
  const cookies = getUserYouTubeCookies();
  try {
    const raw = await invoke<any[]>('fetch_playlist_tracks', {
      playlist_id: playlistId.trim(),
      playlistId: playlistId.trim(),
      cookies_text: cookies || null,
      cookiesText: cookies || null,
    });

    return (raw || []).map((t) => ({
      video_id: t.video_id,
      title: t.title,
      artist: t.artist || 'Artiste',
      duration: t.duration || '',
      thumbnail: t.thumbnail || '',
    }));
  } catch {
    return [];
  }
}

export async function fetchUserLikedMusics(cookies?: string): Promise<LikedMusicTrack[]> {
  const finalCookies = cookies !== undefined ? cookies : getUserYouTubeCookies();
  try {
    const raw = await invoke<LikedMusicTrack[]>('fetch_user_liked_musics', {
      cookies_text: finalCookies || null,
      cookiesText: finalCookies || null,
    });

    if (Array.isArray(raw) && raw.length > 0) {
      const current = getLikedMusicsFromStorage();
      const existingIds = new Set(current.map((m) => m.id));
      const newItems: LikedMusicTrack[] = [];

      for (const item of raw) {
        if (!existingIds.has(item.id)) {
          newItems.push({
            ...item,
            is_verified_music: true,
            needs_verification: false,
          });
          existingIds.add(item.id);
        }
      }

      const merged = [...newItems, ...current];
      saveLikedMusicsToStorage(merged);
      return merged;
    }
  } catch (err) {
    console.debug('fetch_user_liked_musics notice:', err);
  }

  return getLikedMusicsFromStorage();
}

export function getLikedMusicsFromStorage(): LikedMusicTrack[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_LIKED_MUSICS) ||
      localStorage.getItem(STORAGE_LIKED_TRACKS) ||
      localStorage.getItem('anistream_liked_tracks');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t: any) => ({
          id: t.video_id || t.id,
          title: t.title || 'Titre inconnu',
          artist: t.artist || 'Artiste inconnu',
          duration: t.duration || '',
          thumbnail: t.thumbnail || `https://i.ytimg.com/vi/${t.video_id || t.id}/hqdefault.jpg`,
          url: t.url || `https://www.youtube.com/watch?v=${t.video_id || t.id}`,
          is_verified_music: true,
          needs_verification: false,
          reason: 'Titres Likés',
        }));
      }
    }
  } catch {}

  // Fallback direct sur la bibliothèque réelle de Saez original (1 207 titres)
  const defaultTracks: LikedMusicTrack[] = (initialLikedTracks as any[]).map((t: any) => ({
    id: t.video_id,
    title: t.title,
    artist: t.artist,
    duration: t.duration || '',
    thumbnail: `https://i.ytimg.com/vi/${t.video_id}/hqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${t.video_id}`,
    is_verified_music: true,
    needs_verification: false,
    reason: 'Bibliothèque Saez',
  }));

  try {
    localStorage.setItem(STORAGE_LIKED_MUSICS, JSON.stringify(defaultTracks));
  } catch {}

  return defaultTracks;
}

export function saveLikedMusicsToStorage(musics: LikedMusicTrack[]): void {
  try {
    localStorage.setItem(STORAGE_LIKED_MUSICS, JSON.stringify(musics));
  } catch {}
}

// ─── AUTHENTIFICATION OFFICIELLE YOUTUBE OAUTH 2.0 PKCE ──────────────────────

export async function startYouTubeOAuth(clientId?: string): Promise<YouTubeUserProfile> {
  return await invoke<YouTubeUserProfile>('start_youtube_oauth', {
    clientId: clientId || null,
  });
}

export async function getYouTubeUserProfile(): Promise<YouTubeUserProfile | null> {
  try {
    return await invoke<YouTubeUserProfile | null>('get_youtube_user_profile');
  } catch (err) {
    console.warn('Erreur lecture profil YouTube:', err);
    return null;
  }
}

export async function logoutYouTube(): Promise<void> {
  await invoke('logout_youtube');
}

export async function getYouTubeClientConfig(): Promise<YouTubeAuthConfig> {
  return await invoke<YouTubeAuthConfig>('get_youtube_client_config');
}

export async function saveYouTubeClientConfig(clientId: string): Promise<void> {
  await invoke('save_youtube_client_config', {
    clientId: clientId.trim(),
  });
}

// ─── GESTION DES MUSIQUES BIKE LIFE ──────────────────────────────────────────

export function getCustomBikeLifeTracks(): BikeLifeTrack[] {
  try {
    const raw = localStorage.getItem(STORAGE_BIKELIFE_CUSTOM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveCustomBikeLifeTrack(track: BikeLifeTrack): BikeLifeTrack {
  const current = getCustomBikeLifeTracks();
  const existingIdx = current.findIndex((t) => t.id === track.id);
  if (existingIdx >= 0) {
    current[existingIdx] = track;
  } else {
    current.unshift(track);
  }
  try {
    localStorage.setItem(STORAGE_BIKELIFE_CUSTOM, JSON.stringify(current));
  } catch {}
  return track;
}

export function deleteCustomBikeLifeTrack(id: string): void {
  const current = getCustomBikeLifeTracks().filter((t) => t.id !== id);
  try {
    localStorage.setItem(STORAGE_BIKELIFE_CUSTOM, JSON.stringify(current));
  } catch {}
}

export function getAllBikeLifeTracks(): BikeLifeTrack[] {
  const custom = getCustomBikeLifeTracks();
  return [...custom, ...BUILTIN_BIKELIFE_TRACKS];
}
