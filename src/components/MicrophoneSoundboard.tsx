import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Radio,
  Square,
  Sliders,
  CheckCircle,
  Music,
  Heart,
  ListMusic,
  ArrowLeft,
  RefreshCw,
  Search,
  Plus,
  Play,
  Pause,
  RotateCcw,
  X,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  useSoundboardPlayer,
  formatSecondsToTime,
  parseDurationToSeconds,
} from '../services/soundboardPlayer';
import {
  soundboardEngine,
  searchYoutubeSound,
  resolveYoutubeAudioUrl,
  getLikedTracks,
  getUserPlaylists,
  importYouTubePlaylist,
  syncUserPlaylistsFromCookies,
  fetchUserYouTubePlaylists,
  fetchPlaylistTracks,
  fetchUserLikedMusics,
  getLikedMusicsFromStorage,
  getYouTubeAuthStatus,
} from '../services/soundboardService';
import type {
  YoutubeTrackItem,
  AudioDeviceOption,
  Track,
  YouTubePlaylist,
  YouTubeUserProfile,
  LikedMusicTrack,
  YouTubeAuthStatus,
} from '../types/soundboard';
import SoundboardMusicSection from './SoundboardMusicSection';

interface MicrophoneSoundboardProps {
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  connectedYouTube?: YouTubeUserProfile | null;
}

export default function MicrophoneSoundboard({ showToast, connectedYouTube }: MicrophoneSoundboardProps) {
  // Master Soundboard Volume
  const [masterVol, setMasterVol] = useState<number>(soundboardEngine.volume);
  const [hasCable, setHasCable] = useState<boolean>(false);
  const [cableDevice, setCableDevice] = useState<AudioDeviceOption | null>(null);

  // Nom du morceau / son en cours de diffusion
  const [currentlyPlayingName, setCurrentlyPlayingName] = useState<string | null>(null);
  const [activeCategoryPlayingName, setActiveCategoryPlayingName] = useState<string | null>(null);
  const [isPlayingAny, setIsPlayingAny] = useState<boolean>(false);

  // ── MOTEUR YOUTUBE & PLAYLISTS ──
  const [ytQuery, setYtQuery] = useState<string>('');
  const [ytResults, setYtResults] = useState<YoutubeTrackItem[]>([]);
  const [isSearchingYt, setIsSearchingYt] = useState<boolean>(false);
  const [activeYtTrackId, setActiveYtTrackId] = useState<string | null>(null);
  const [ytSubTab, setYtSubTab] = useState<'search' | 'playlists' | 'liked'>('playlists');

  // Playlists YouTube & YouTube Music
  const [userPlaylists, setUserPlaylists] = useState<YouTubePlaylist[]>(() => getUserPlaylists());
  const [activeSoundboardPlaylist, setActiveSoundboardPlaylist] = useState<YouTubePlaylist | null>(null);
  const [isSyncingSoundboardPlaylists, setIsSyncingSoundboardPlaylists] = useState<boolean>(false);
  const [isLoadingPlaylistTracks, setIsLoadingPlaylistTracks] = useState<boolean>(false);
  const [sbPlaylistUrl, setSbPlaylistUrl] = useState<string>('');
  const [sbPlaylistTitle, setSbPlaylistTitle] = useState<string>('');
  const [showAddPlaylistSoundboard, setShowAddPlaylistSoundboard] = useState<boolean>(false);
  const [playlistSearchFilter, setPlaylistSearchFilter] = useState<string>('');

  // Musiques Likées YouTube (Filtrage musical strict)
  const [likedMusics, setLikedMusics] = useState<LikedMusicTrack[]>(() => getLikedMusicsFromStorage());
  const [isSyncingLikedMusics, setIsSyncingLikedMusics] = useState<boolean>(false);
  const [likedMusicsError, setLikedMusicsError] = useState<string | null>(null);
  const [likedFilter, setLikedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [likedSearch, setLikedSearch] = useState<string>('');

  // Lecteur audio discret intégré & Statut Auth
  const {
    activeTrack,
    isPlaying: isPlayerPlaying,
    isPaused: isPlayerPaused,
    currentTime,
    duration,
    seek,
    playTrack,
    pauseTrack,
    resumeTrack,
    stopTrack,
  } = useSoundboardPlayer();
  const [authStatus, setAuthStatus] = useState<YouTubeAuthStatus | null>(null);

  const handleToggleListenTrack = (track: {
    id: string;
    title: string;
    artist: string;
    thumbnail?: string;
    duration?: string;
    videoId?: string;
    url?: string;
  }) => {
    const trackVideoId = track.videoId || track.id;
    const isThisActive = activeTrack?.id === track.id || (trackVideoId && activeTrack?.videoId === trackVideoId);
    if (isThisActive && isPlayerPlaying) {
      pauseTrack();
    } else if (isThisActive && isPlayerPaused) {
      resumeTrack();
    } else {
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail,
        duration: track.duration,
        sourceType: 'youtube',
        videoId: trackVideoId,
        url: track.url || `https://www.youtube.com/watch?v=${trackVideoId}`,
      });
    }
  };

  const handleStopListenTrack = () => {
    stopTrack();
  };

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (showToast) showToast(msg, type);
  };

  // Initialisation automatique du moteur audio (Routage VB-CABLE vers Discord)
  useEffect(() => {
    let isMounted = true;

    async function initAudio() {
      const { hasCable: cableFound, cableDevice: cDev } = await soundboardEngine.scanDevices();
      if (isMounted) {
        setHasCable(cableFound);
        setCableDevice(cDev);
        if (cableFound) {
          await soundboardEngine.startFusion();
        }
        setUserPlaylists(getUserPlaylists());
      }
    }

    initAudio();

    return () => {
      isMounted = false;
    };
  }, []);

  // Détection de la lecture active
  useEffect(() => {
    const timer = setInterval(() => {
      const playing = soundboardEngine.isPlaying() || !!activeCategoryPlayingName || !!activeYtTrackId;
      setIsPlayingAny(playing);
      if (!playing) {
        setCurrentlyPlayingName(null);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [activeCategoryPlayingName, activeYtTrackId]);

  // Réglage du volume Master
  const handleVolumeChange = (newVol: number) => {
    setMasterVol(newVol);
    soundboardEngine.setVolume(newVol);
  };

  // Bouton STOP TOUT
  const handleStopAll = () => {
    soundboardEngine.stopAll();
    setActiveYtTrackId(null);
    setCurrentlyPlayingName(null);
    setActiveCategoryPlayingName(null);
    setIsPlayingAny(false);
    notify('Tous les sons et musiques ont été coupés.', 'info');
  };

  // ── GESTION RECHERCHE & DIFFUSION YOUTUBE ──
  const handleYtSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytQuery.trim()) return;

    setIsSearchingYt(true);
    try {
      const res = await searchYoutubeSound(ytQuery);
      setYtResults(res);
      if (res.length === 0) {
        notify('Aucun résultat trouvé sur YouTube.', 'info');
      }
    } catch {
      notify('Erreur lors de la recherche YouTube.', 'error');
    } finally {
      setIsSearchingYt(false);
    }
  };

  const handlePlayYtTrack = async (item: YoutubeTrackItem) => {
    soundboardEngine.stopBikeLifeTrack();
    setActiveCategoryPlayingName(null);
    setActiveYtTrackId(item.id);
    setCurrentlyPlayingName(`${item.title} (YouTube)`);

    notify(`Préparation du flux audio : ${item.title}...`, 'info');

    const res = await soundboardEngine.playSound(item.url, () => {
      setActiveYtTrackId(null);
      setCurrentlyPlayingName(null);
    });

    if (!res.success) {
      notify(res.error || 'Erreur lors de la diffusion YouTube.', 'error');
      setActiveYtTrackId(null);
      setCurrentlyPlayingName(null);
    } else {
      notify(`En cours de diffusion : ${item.title}`, 'success');
    }
  };

  const handleStopYtTrack = () => {
    soundboardEngine.stopAll();
    setActiveYtTrackId(null);
    setCurrentlyPlayingName(null);
  };

  // Importation de playlist YouTube
  const handleAddPlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbPlaylistUrl.trim()) return;

    setIsSyncingSoundboardPlaylists(true);
    try {
      notify('Analyse et extraction de la playlist YouTube en cours...', 'info');
      const res = await importYouTubePlaylist(sbPlaylistUrl.trim(), sbPlaylistTitle.trim() || undefined);
      if (res.success && res.playlist) {
        setUserPlaylists(getUserPlaylists());
        setSbPlaylistUrl('');
        setSbPlaylistTitle('');
        setShowAddPlaylistSoundboard(false);
        notify(`Playlist « ${res.playlist.title} » (${res.playlist.track_count || res.playlist.tracks.length} titres) importée !`, 'success');
      } else {
        notify(res.error || 'Impossible de charger cette playlist YouTube.', 'error');
      }
    } catch {
      notify("Erreur lors de l'import.", 'error');
    } finally {
      setIsSyncingSoundboardPlaylists(false);
    }
  };

  // Vérification de statut auth au montage
  useEffect(() => {
    let isMounted = true;
    getYouTubeAuthStatus()
      .then((st) => {
        if (isMounted) setAuthStatus(st);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [connectedYouTube]);

  // Synchronisation des Playlists (Officielles et accessibles)
  const handleSyncPlaylists = async () => {
    setIsSyncingSoundboardPlaylists(true);
    try {
      notify('Interrogation des playlists YouTube en cours...', 'info');
      const pls = await fetchUserYouTubePlaylists();
      if (pls && pls.length > 0) {
        setUserPlaylists(pls);
        notify(`${pls.length} playlist(s) synchronisée(s) avec succès !`, 'success');
      } else {
        const stored = getUserPlaylists();
        setUserPlaylists(stored);
        notify(`${stored.length} playlist(s) disponibles dans votre bibliothèque.`, 'info');
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      notify(`Synchronisation playlists : ${msg}`, 'info');
      setUserPlaylists(getUserPlaylists());
    } finally {
      setIsSyncingSoundboardPlaylists(false);
    }
  };

  // Ouverture d'une playlist et chargement dynamique de ses morceaux
  const handleOpenPlaylist = async (pl: YouTubePlaylist) => {
    setActiveSoundboardPlaylist(pl);
    if (!pl.tracks || pl.tracks.length === 0) {
      setIsLoadingPlaylistTracks(true);
      try {
        const tracks = await fetchPlaylistTracks(pl.id || pl.url);
        const updated = { ...pl, tracks };
        setActiveSoundboardPlaylist(updated);
        setUserPlaylists((prev) =>
          prev.map((item) => (item.id === pl.id ? updated : item))
        );
      } catch (err: any) {
        notify(err?.message || 'Impossible de charger les morceaux de cette playlist.', 'info');
      } finally {
        setIsLoadingPlaylistTracks(false);
      }
    }
  };

  // Synchronisation des Musiques Likées (Filtre musical obligatoire)
  const handleSyncLikedMusics = async () => {
    setIsSyncingLikedMusics(true);
    setLikedMusicsError(null);
    try {
      notify('Synchronisation de vos musiques likées...', 'info');
      const musics = await fetchUserLikedMusics();
      setLikedMusics(musics);
      const verified = musics.filter((m) => m.is_verified_music).length;
      if (musics.length > 0) {
        notify(`${musics.length} musique(s) disponibles (${verified} confirmées).`, 'success');
      } else {
        notify('Aucune musique likée trouvée.', 'info');
      }
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Erreur lors de la synchronisation.';
      setLikedMusicsError(msg);
      notify(msg, 'error');
    } finally {
      setIsSyncingLikedMusics(false);
    }
  };

  const handlePlayPlaylistTrack = async (track: Track) => {
    const fakeItem: YoutubeTrackItem = {
      id: track.video_id,
      title: track.title,
      artist: track.artist,
      duration: track.duration || '',
      url: `https://www.youtube.com/watch?v=${track.video_id}`,
      thumbnail: track.thumbnail || '',
    };
    await handlePlayYtTrack(fakeItem);
  };

  const displayedPlayingText =
    activeCategoryPlayingName
      ? activeCategoryPlayingName
      : currentlyPlayingName
      ? currentlyPlayingName
      : isPlayingAny
      ? 'Diffusion active'
      : 'Aucun son en cours • Sélectionnez une musique ci-dessous pour lancer la lecture !';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* ── 1. BARRE D'ÉTAT & CONTRÔLE AUDIO ÉLÉGANTE (ROUTAGE DISCORD + MASTER VOLUME + STOP TOUT) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          borderRadius: 20,
          padding: '18px 24px',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {/* Statut de diffusion active */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: isPlayingAny ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPlayingAny ? '0 0 20px rgba(239, 68, 68, 0.45)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            {isPlayingAny ? (
              <Radio size={22} color="#ffffff" className="animate-pulse" />
            ) : (
              <Volume2 size={22} color="#64748b" />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                Diffusion en direct
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: hasCable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 229, 255, 0.15)',
                  border: hasCable ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(0, 229, 255, 0.35)',
                  color: hasCable ? '#34d399' : '#38bdf8',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                <CheckCircle size={10} />
                {hasCable ? 'CABLE Input Discord Actif' : 'Sortie Audio Casque'}
              </span>
            </div>
            <div
              style={{
                fontSize: '1.02rem',
                fontWeight: 800,
                color: isPlayingAny ? '#00e5ff' : '#f8fafc',
                maxWidth: '480px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayedPlayingText}
            </div>
          </div>
        </div>

        {/* Contrôle Master Volume & Stop Tout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          {/* Slider Volume Master */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#00e5ff', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sliders size={14} /> {masterVol}%
            </span>
            <input
              type="range"
              min="0"
              max="150"
              value={masterVol}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              style={{ width: 110, accentColor: '#00e5ff', cursor: 'pointer', height: 5 }}
            />
            <button
              onClick={() => handleVolumeChange(100)}
              title="Réinitialiser à 100%"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '4px 8px',
                color: '#cbd5e1',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Bouton STOP TOUT */}
          <button
            onClick={handleStopAll}
            disabled={!isPlayingAny}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              borderRadius: 14,
              background: isPlayingAny ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(255, 255, 255, 0.04)',
              border: isPlayingAny ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              color: isPlayingAny ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: isPlayingAny ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: isPlayingAny ? '0 0 20px rgba(239, 68, 68, 0.45)' : 'none',
            }}
          >
            <Square size={16} />
            <span>STOP TOUT</span>
          </button>
        </div>
      </div>

      {/* ── 2. SECTIONS MUSICALES : DRILL, PHONK, BRAZILIAN FUNK, TRAP & MES MUSIQUES ── */}
      <SoundboardMusicSection
        showToast={notify}
        onPlayingChange={(trackTitle) => setActiveCategoryPlayingName(trackTitle)}
      />

      {/* ── 3. MOTEUR RECHERCHE & DIFFUSION YOUTUBE ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 100%)',
          borderRadius: 22,
          padding: 24,
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.35)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Diffusion YouTube Directe (Dans votre micro &amp; casque)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                Recherchez n'importe quel son, musique ou vidéo sur YouTube pour l'écouter et l'envoyer dans votre micro Discord en temps réel.
              </p>
            </div>
          </div>

          {/* Onglets YouTube */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(0, 0, 0, 0.35)', padding: 4, borderRadius: 12 }}>
            <button
              onClick={() => setYtSubTab('search')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 10,
                background: ytSubTab === 'search' ? '#ef4444' : 'transparent',
                border: 'none',
                color: ytSubTab === 'search' ? '#fff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Search size={14} />
              <span>Recherche YouTube</span>
            </button>
            <button
              onClick={() => setYtSubTab('playlists')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 10,
                background: ytSubTab === 'playlists' ? '#ef4444' : 'transparent',
                border: 'none',
                color: ytSubTab === 'playlists' ? '#fff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ListMusic size={14} />
              <span>Mes Playlists ({userPlaylists.length})</span>
            </button>
            <button
              onClick={() => setYtSubTab('liked')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 10,
                background: ytSubTab === 'liked' ? '#ef4444' : 'transparent',
                border: 'none',
                color: ytSubTab === 'liked' ? '#fff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Heart size={14} />
              <span>Mes Musiques Likées ({likedMusics.length})</span>
            </button>
          </div>
        </div>

        {/* Sous-onglet 1 : Recherche YouTube */}
        {ytSubTab === 'search' && (
          <div>
            <form onSubmit={handleYtSearch} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Tapez un mot-clé ou collez un lien YouTube..."
                  value={ytQuery}
                  onChange={(e) => setYtQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 12,
                    background: '#090d16',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSearchingYt}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: isSearchingYt ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 16px rgba(239, 68, 68, 0.35)',
                }}
              >
                {isSearchingYt ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>

            {/* Résultats de recherche YouTube */}
            {ytResults.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 12,
                  maxHeight: 400,
                  overflowY: 'auto',
                  paddingRight: 6,
                }}
              >
                {ytResults.map((item) => {
                  const isThisActive = activeTrack?.id === item.id || activeTrack?.videoId === item.id;
                  const isPlayingThis = isThisActive && isPlayerPlaying;
                  const isPausedThis = isThisActive && isPlayerPaused;
                  const isDiffusing = activeYtTrackId === item.id;
                  const trackTotalSeconds = duration || parseDurationToSeconds(item.duration) || 180;

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: 12,
                        borderRadius: 14,
                        background: isPlayingThis
                          ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                          : isPausedThis
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                          : isDiffusing
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(0, 0, 0, 0.3)',
                        border: isPlayingThis
                          ? '1px solid #00e5ff'
                          : isPausedThis
                          ? '1px solid #f59e0b'
                          : isDiffusing
                          ? '1px solid #ef4444'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        boxShadow: isPlayingThis ? '0 0 16px rgba(0, 229, 255, 0.25)' : undefined,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={item.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                          alt={item.title}
                          style={{ width: 54, height: 42, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={item.title}
                          >
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            {item.artist} {item.duration ? `• ${item.duration}` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* Bouton Direct Lecture / Pause */}
                          <button
                            onClick={() =>
                              handleToggleListenTrack({
                                id: item.id,
                                title: item.title,
                                artist: item.artist,
                                thumbnail: item.thumbnail,
                                duration: item.duration,
                                videoId: item.id,
                                url: item.url,
                              })
                            }
                            title={isPlayingThis ? 'Mettre en pause' : isPausedThis ? 'Reprendre la lecture' : 'Écouter'}
                            className={isPlayingThis ? 'btn-sound-pause' : isPausedThis ? 'btn-sound-resume' : 'btn-sound-play'}
                          >
                            {isPlayingThis ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                            <span>{isPlayingThis ? 'Pause' : isPausedThis ? 'Reprendre' : 'Écouter'}</span>
                          </button>

                          {/* Bouton Direct Arrêt si actif */}
                          {isThisActive && (
                            <button
                              onClick={handleStopListenTrack}
                              title="Arrêter la lecture"
                              className="btn-sound-stop"
                            >
                              <Square size={12} fill="currentColor" />
                              <span>Stop</span>
                            </button>
                          )}

                          {/* Bouton Diffuser micro */}
                          <button
                            onClick={() => (isDiffusing ? handleStopYtTrack() : handlePlayYtTrack(item))}
                            title="Diffuser dans le micro Discord"
                            className="btn-sound-micro"
                          >
                            <Radio size={12} />
                            <span>Micro</span>
                          </button>
                        </div>
                      </div>

                      {/* ── BARRE DE PROGRESSION MUSICALE INTÉGRÉE ── */}
                      {isThisActive && (
                        <div
                          style={{
                            padding: '6px 8px',
                            borderRadius: 8,
                            background: 'rgba(0, 0, 0, 0.45)',
                            border: isPlayingThis ? '1px solid rgba(0, 229, 255, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ color: isPlayingThis ? '#00e5ff' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                              {isPlayingThis ? '▶' : '⏸'} {formatSecondsToTime(currentTime)}
                            </span>
                            <span style={{ color: '#94a3b8' }}>
                              {formatSecondsToTime(trackTotalSeconds)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={trackTotalSeconds}
                            step={0.5}
                            value={currentTime}
                            onChange={(e) => seek(Number(e.target.value))}
                            className="music-seek-bar"
                            title="Naviguer dans la musique"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sous-onglet 2 : Playlists YouTube */}
        {ytSubTab === 'playlists' && (
          <div>
            {activeSoundboardPlaylist ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <button
                    onClick={() => setActiveSoundboardPlaylist(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={15} />
                    <span>Retour aux playlists</span>
                  </button>

                  <a
                    href={`https://www.youtube.com/playlist?list=${activeSoundboardPlaylist.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Ouvrir sur YouTube</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    borderRadius: 12,
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: 16,
                  }}
                >
                  <img
                    src={activeSoundboardPlaylist.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=160'}
                    alt={activeSoundboardPlaylist.title}
                    style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
                      {activeSoundboardPlaylist.title}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: 12 }}>
                      <span>{activeSoundboardPlaylist.tracks?.length || activeSoundboardPlaylist.track_count || 0} morceau(x)</span>
                      {activeSoundboardPlaylist.is_private && (
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>🔒 Playlist privée</span>
                      )}
                    </div>
                  </div>
                </div>

                {isLoadingPlaylistTracks ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Récupération des morceaux de la playlist en cours...</span>
                  </div>
                ) : !activeSoundboardPlaylist.tracks || activeSoundboardPlaylist.tracks.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 30,
                      borderRadius: 12,
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      fontSize: '0.85rem',
                    }}
                  >
                    Aucun morceau trouvé dans cette playlist ou accès privé restreint.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                    {activeSoundboardPlaylist.tracks.map((t) => {
                      const isThisActive = activeTrack?.id === t.video_id || activeTrack?.videoId === t.video_id;
                      const isPlayingThis = isThisActive && isPlayerPlaying;
                      const isPausedThis = isThisActive && isPlayerPaused;
                      const trackTotalSeconds = duration || parseDurationToSeconds(t.duration) || 180;

                      return (
                        <div
                          key={t.video_id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            padding: '10px 14px',
                            borderRadius: 12,
                            background: isPlayingThis
                              ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                              : isPausedThis
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                              : 'rgba(0, 0, 0, 0.25)',
                            border: isPlayingThis
                              ? '1px solid #00e5ff'
                              : isPausedThis
                              ? '1px solid #f59e0b'
                              : '1px solid rgba(255, 255, 255, 0.05)',
                            boxShadow: isPlayingThis ? '0 0 16px rgba(0, 229, 255, 0.25)' : undefined,
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <img
                              src={t.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                              alt={t.title}
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.title}>
                                {t.title}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                                {t.artist} {t.duration ? `• ${t.duration}` : ''}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {/* Bouton Direct Lecture / Pause */}
                              <button
                                onClick={() =>
                                  handleToggleListenTrack({
                                    id: t.video_id,
                                    title: t.title,
                                    artist: t.artist,
                                    thumbnail: t.thumbnail,
                                    duration: t.duration,
                                    videoId: t.video_id,
                                  })
                                }
                                title={isPlayingThis ? 'Mettre en pause' : isPausedThis ? 'Reprendre la lecture' : 'Écouter'}
                                className={isPlayingThis ? 'btn-sound-pause' : isPausedThis ? 'btn-sound-resume' : 'btn-sound-play'}
                              >
                                {isPlayingThis ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                                <span>{isPlayingThis ? 'Pause' : isPausedThis ? 'Reprendre' : 'Écouter'}</span>
                              </button>

                              {/* Bouton Arrêt si actif */}
                              {isThisActive && (
                                <button
                                  onClick={handleStopListenTrack}
                                  title="Arrêter la lecture"
                                  className="btn-sound-stop"
                                >
                                  <Square size={12} fill="currentColor" />
                                  <span>Stop</span>
                                </button>
                              )}

                              {/* Bouton Diffuser micro */}
                              <button
                                onClick={() => handlePlayPlaylistTrack(t)}
                                title="Diffuser dans le micro / soundboard"
                                className="btn-sound-micro"
                              >
                                <Radio size={12} />
                                <span>Micro</span>
                              </button>
                            </div>
                          </div>

                          {/* ── BARRE DE PROGRESSION MUSICALE INTÉGRÉE ── */}
                          {isThisActive && (
                            <div
                              style={{
                                padding: '6px 8px',
                                borderRadius: 8,
                                background: 'rgba(0, 0, 0, 0.45)',
                                border: isPlayingThis ? '1px solid rgba(0, 229, 255, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  marginBottom: 4,
                                }}
                              >
                                <span style={{ color: isPlayingThis ? '#00e5ff' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {isPlayingThis ? '▶' : '⏸'} {formatSecondsToTime(currentTime)}
                                </span>
                                <span style={{ color: '#94a3b8' }}>
                                  {formatSecondsToTime(trackTotalSeconds)}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={trackTotalSeconds}
                                step={0.5}
                                value={currentTime}
                                onChange={(e) => seek(Number(e.target.value))}
                                className="music-seek-bar"
                                title="Naviguer dans la musique"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff' }}>Mes Playlists YouTube</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {userPlaylists.length}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                      Playlists de votre chaîne et listes importées
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleSyncPlaylists}
                      disabled={isSyncingSoundboardPlaylists}
                      title="Interroger l'API YouTube pour récupérer vos playlists réelles"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 8,
                        background: 'rgba(0, 229, 255, 0.15)',
                        border: '1px solid rgba(0, 229, 255, 0.35)',
                        color: '#00e5ff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <RefreshCw size={13} className={isSyncingSoundboardPlaylists ? 'animate-spin' : ''} />
                      <span>{isSyncingSoundboardPlaylists ? 'Synchronisation...' : 'Synchroniser'}</span>
                    </button>

                    <button
                      onClick={() => setShowAddPlaylistSoundboard(!showAddPlaylistSoundboard)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 8,
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#34d399',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                      <span>Importer URL</span>
                    </button>
                  </div>
                </div>

                {showAddPlaylistSoundboard && (
                  <form onSubmit={handleAddPlaylistSubmit} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <input
                      type="url"
                      required
                      placeholder="Collez l'URL de la playlist YouTube..."
                      value={sbPlaylistUrl}
                      onChange={(e) => setSbPlaylistUrl(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: '#0a0f1d',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.82rem',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSyncingSoundboardPlaylists}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Ajouter
                    </button>
                  </form>
                )}

                {userPlaylists.length === 0 ? (
                  <div
                    style={{
                      padding: 24,
                      borderRadius: 12,
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      textAlign: 'center',
                    }}
                  >
                    <ListMusic size={32} color="#64748b" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 6 }}>
                      Aucune playlist disponible pour le moment
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: 480, margin: '0 auto 14px auto', lineHeight: 1.5 }}>
                      Cliquez sur <strong>« Synchroniser »</strong> pour interroger l'API officielle YouTube, ou sur <strong>« Importer URL »</strong> pour ajouter une playlist publique ou non répertoriée.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {userPlaylists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => handleOpenPlaylist(pl)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          borderRadius: 12,
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <img
                          src={pl.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                          alt={pl.title}
                          style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {pl.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span>{pl.track_count || pl.tracks?.length || 0} morceaux</span>
                            {pl.is_private && <span style={{ color: '#f59e0b' }}>• Privée</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sous-onglet 3 : Mes Musiques Likées (Filtre Musique Strict) */}
        {ytSubTab === 'liked' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff' }}>Mes Musiques Likées</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {likedMusics.length} titres
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                  Seules les vraies musiques sont conservées (Catégorie Musique, VEVO, labels). Les vlogs, tutoriels et jeux vidéo sont filtrés.
                </div>
              </div>

              <button
                onClick={handleSyncLikedMusics}
                disabled={isSyncingLikedMusics}
                title="Analyser et récupérer les musiques de vos likes YouTube"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} className={isSyncingLikedMusics ? 'animate-spin' : ''} />
                <span>{isSyncingLikedMusics ? 'Filtrage en cours...' : 'Synchroniser mes likes'}</span>
              </button>
            </div>

            {/* Message d'erreur réseau si survenu */}
            {likedMusicsError && (
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  marginBottom: 14,
                  fontSize: '0.78rem',
                  color: '#fca5a5',
                  lineHeight: 1.45,
                }}
              >
                <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <span style={{ fontWeight: 700 }}>Erreur de synchronisation :</span> {likedMusicsError}
                </div>
              </div>
            )}

            {/* Barre de recherche dans les likes */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search
                  size={15}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder={`Rechercher parmi vos ${likedMusics.length} musiques likées...`}
                  value={likedSearch}
                  onChange={(e) => setLikedSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
              </div>
              {likedSearch && (
                <button
                  onClick={() => setLikedSearch('')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#94a3b8',
                    padding: '6px 10px',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                  }}
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Filtres de validation */}
            {likedMusics.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button
                  onClick={() => setLikedFilter('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: likedFilter === 'all' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                    background: likedFilter === 'all' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                    color: likedFilter === 'all' ? '#fff' : '#94a3b8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Toutes ({likedMusics.length})
                </button>
                <button
                  onClick={() => setLikedFilter('verified')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: likedFilter === 'verified' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                    background: likedFilter === 'verified' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    color: likedFilter === 'verified' ? '#34d399' : '#94a3b8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✓ Musiques confirmées ({likedMusics.filter((m) => m.is_verified_music).length})
                </button>
                <button
                  onClick={() => setLikedFilter('unverified')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: likedFilter === 'unverified' ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                    background: likedFilter === 'unverified' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                    color: likedFilter === 'unverified' ? '#fbbf24' : '#94a3b8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ⚠️ À vérifier ({likedMusics.filter((m) => m.needs_verification).length})
                </button>
              </div>
            )}

            {/* Liste des musiques likées filtrées */}
            {likedMusics.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                }}
              >
                <Heart size={32} color="#64748b" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 6 }}>
                  Aucune musique likée synchronisée
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
                  Cliquez sur <strong>« Synchroniser mes likes »</strong> pour interroger YouTube Music. L'algorithme exclura automatiquement tous les contenus non musicaux pour n'intégrer que vos véritables musiques.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                {likedMusics
                  .filter((m) => {
                    if (likedFilter === 'verified') return m.is_verified_music;
                    if (likedFilter === 'unverified') return m.needs_verification;
                    return true;
                  })
                  .filter((m) => {
                    if (!likedSearch.trim()) return true;
                    const q = likedSearch.toLowerCase();
                    return m.title.toLowerCase().includes(q) || m.artist.toLowerCase().includes(q);
                  })
                  .map((m) => {
                    const isThisActive = activeTrack?.id === m.id || activeTrack?.videoId === m.id;
                    const isPlayingThis = isThisActive && isPlayerPlaying;
                    const isPausedThis = isThisActive && isPlayerPaused;
                    const trackTotalSeconds = duration || parseDurationToSeconds(m.duration) || 180;

                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          padding: '10px 14px',
                          borderRadius: 12,
                          background: isPlayingThis
                            ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                            : isPausedThis
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                            : 'rgba(0, 0, 0, 0.25)',
                          border: isPlayingThis
                            ? '1px solid #00e5ff'
                            : isPausedThis
                            ? '1px solid #f59e0b'
                            : '1px solid rgba(255, 255, 255, 0.05)',
                          boxShadow: isPlayingThis ? '0 0 16px rgba(0, 229, 255, 0.25)' : undefined,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <img
                            src={m.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                            alt={m.title}
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  color: '#fff',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={m.title}
                              >
                                {m.title}
                              </span>
                              {m.is_verified_music ? (
                                <span
                                  style={{
                                    flexShrink: 0,
                                    fontSize: '0.68rem',
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    color: '#34d399',
                                    fontWeight: 700,
                                  }}
                                >
                                  ✓ Musique
                                </span>
                              ) : (
                                <span
                                  style={{
                                    flexShrink: 0,
                                    fontSize: '0.68rem',
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    color: '#fbbf24',
                                    fontWeight: 700,
                                  }}
                                >
                                  ⚠️ À vérifier
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                              {m.artist} {m.duration ? `• ${m.duration}` : ''}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Bouton Direct Lecture / Pause */}
                            <button
                              onClick={() =>
                                handleToggleListenTrack({
                                  id: m.id,
                                  title: m.title,
                                  artist: m.artist,
                                  thumbnail: m.thumbnail,
                                  duration: m.duration,
                                  videoId: m.id,
                                  url: m.url,
                                })
                              }
                              title={isPlayingThis ? 'Mettre en pause' : isPausedThis ? 'Reprendre la lecture' : 'Écouter'}
                              className={isPlayingThis ? 'btn-sound-pause' : isPausedThis ? 'btn-sound-resume' : 'btn-sound-play'}
                            >
                              {isPlayingThis ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                              <span>{isPlayingThis ? 'Pause' : isPausedThis ? 'Reprendre' : 'Écouter'}</span>
                            </button>

                            {/* Bouton Arrêt si actif */}
                            {isThisActive && (
                              <button
                                onClick={handleStopListenTrack}
                                title="Arrêter la lecture"
                                className="btn-sound-stop"
                              >
                                <Square size={12} fill="currentColor" />
                                <span>Stop</span>
                              </button>
                            )}

                            {/* Bouton Diffuser */}
                            <button
                              onClick={() =>
                                handlePlayYtTrack({
                                  id: m.id,
                                  title: m.title,
                                  artist: m.artist,
                                  duration: m.duration || '',
                                  url: m.url || `https://www.youtube.com/watch?v=${m.id}`,
                                  thumbnail: m.thumbnail || '',
                                })
                              }
                              title="Diffuser dans le micro / soundboard"
                              className="btn-sound-micro"
                            >
                              <Radio size={12} />
                              <span>Micro</span>
                            </button>
                          </div>
                        </div>

                        {/* ── BARRE DE PROGRESSION MUSICALE INTÉGRÉE ── */}
                        {isThisActive && (
                          <div
                            style={{
                              padding: '6px 8px',
                              borderRadius: 8,
                              background: 'rgba(0, 0, 0, 0.45)',
                              border: isPlayingThis ? '1px solid rgba(0, 229, 255, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                marginBottom: 4,
                              }}
                            >
                              <span style={{ color: isPlayingThis ? '#00e5ff' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {isPlayingThis ? '▶' : '⏸'} {formatSecondsToTime(currentTime)}
                              </span>
                              <span style={{ color: '#94a3b8' }}>
                                {formatSecondsToTime(trackTotalSeconds)}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={trackTotalSeconds}
                              step={0.5}
                              value={currentTime}
                              onChange={(e) => seek(Number(e.target.value))}
                              className="music-seek-bar"
                              title="Naviguer dans la musique"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
