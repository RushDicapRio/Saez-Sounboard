import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  ExternalLink,
  Plus,
  Trash2,
  Search,
  Upload,
  X,
  Music,
  CheckCircle,
  Radio,
} from 'lucide-react';
import { soundboardEngine } from '../services/soundboardService';
import {
  useSoundboardPlayer,
  formatSecondsToTime,
  parseDurationToSeconds,
} from '../services/soundboardPlayer';

export interface YouTubeMusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'Drill' | 'Phonk' | 'Brazilian Funk' | 'Trap' | 'Perso';
  videoId?: string;
  url: string;
  thumbnail: string;
  duration: string;
  isCustom?: boolean;
}

const STORAGE_USER_MUSIC = 'saez_soundboard_user_imported_tracks';

export const REAL_YOUTUBE_TRACKS: YouTubeMusicTrack[] = [
  // ── DRILL ──
  {
    id: 'drill_1',
    title: 'Doja',
    artist: 'Central Cee',
    category: 'Drill',
    videoId: '_VuJA-VQRcY',
    url: 'https://www.youtube.com/watch?v=_VuJA-VQRcY',
    thumbnail: 'https://img.youtube.com/vi/_VuJA-VQRcY/mqdefault.jpg',
    duration: '1:45',
  },
  {
    id: 'drill_2',
    title: 'Dior',
    artist: 'Pop Smoke',
    category: 'Drill',
    videoId: 'oorVWW9ywG0',
    url: 'https://www.youtube.com/watch?v=oorVWW9ywG0',
    thumbnail: 'https://img.youtube.com/vi/oorVWW9ywG0/mqdefault.jpg',
    duration: '3:38',
  },
  {
    id: 'drill_3',
    title: 'DIE',
    artist: 'Gazo',
    category: 'Drill',
    videoId: '6SasSMzZeao',
    url: 'https://www.youtube.com/watch?v=6SasSMzZeao',
    thumbnail: 'https://img.youtube.com/vi/6SasSMzZeao/mqdefault.jpg',
    duration: '4:00',
  },
  {
    id: 'drill_4',
    title: 'Freeze Raël',
    artist: 'Freeze Corleone',
    category: 'Drill',
    videoId: '_Zey1wgfA-c',
    url: 'https://www.youtube.com/watch?v=_Zey1wgfA-c',
    thumbnail: 'https://img.youtube.com/vi/_Zey1wgfA-c/mqdefault.jpg',
    duration: '4:23',
  },

  // ── PHONK ──
  {
    id: 'phonk_1',
    title: 'Murder In My Mind',
    artist: 'Kordhell',
    category: 'Phonk',
    videoId: 'Rj4RfirEoQQ',
    url: 'https://www.youtube.com/watch?v=Rj4RfirEoQQ',
    thumbnail: 'https://img.youtube.com/vi/Rj4RfirEoQQ/mqdefault.jpg',
    duration: '2:25',
  },
  {
    id: 'phonk_2',
    title: 'Close Eyes',
    artist: 'DVRST',
    category: 'Phonk',
    videoId: 'v2_R-T1ZlIs',
    url: 'https://www.youtube.com/watch?v=v2_R-T1ZlIs',
    thumbnail: 'https://img.youtube.com/vi/v2_R-T1ZlIs/mqdefault.jpg',
    duration: '2:12',
  },
  {
    id: 'phonk_3',
    title: 'Sahara',
    artist: 'Hensonn',
    category: 'Phonk',
    videoId: 'pIZ0QRWK0zg',
    url: 'https://www.youtube.com/watch?v=pIZ0QRWK0zg',
    thumbnail: 'https://img.youtube.com/vi/pIZ0QRWK0zg/mqdefault.jpg',
    duration: '2:51',
  },
  {
    id: 'phonk_4',
    title: 'Keraunos',
    artist: 'PlayaPhonk',
    category: 'Phonk',
    videoId: 't_L_1-Y67F0',
    url: 'https://www.youtube.com/watch?v=t_L_1-Y67F0',
    thumbnail: 'https://img.youtube.com/vi/t_L_1-Y67F0/mqdefault.jpg',
    duration: '2:29',
  },

  // ── BRAZILIAN FUNK ──
  {
    id: 'funk_1',
    title: 'Automotivo Bibi Fogosa',
    artist: 'Bibi Babydoll & DJ Brunin XM',
    category: 'Brazilian Funk',
    videoId: 'm1GHyE6982o',
    url: 'https://www.youtube.com/watch?v=m1GHyE6982o',
    thumbnail: 'https://img.youtube.com/vi/m1GHyE6982o/mqdefault.jpg',
    duration: '2:10',
  },
  {
    id: 'funk_2',
    title: 'MONTAGEM - PR FUNK',
    artist: 'S3BZS ft. MC GW',
    category: 'Brazilian Funk',
    videoId: 'ROXwi7XuY_w',
    url: 'https://www.youtube.com/watch?v=ROXwi7XuY_w',
    thumbnail: 'https://img.youtube.com/vi/ROXwi7XuY_w/mqdefault.jpg',
    duration: '2:05',
  },
  {
    id: 'funk_3',
    title: 'Tipo Gin',
    artist: 'MC Kevin o Chris',
    category: 'Brazilian Funk',
    videoId: 'A6p4QWzCgV6',
    url: 'https://www.youtube.com/watch?v=A6p4QWzCgV6',
    thumbnail: 'https://img.youtube.com/vi/A6p4QWzCgV6/mqdefault.jpg',
    duration: '2:35',
  },
  {
    id: 'funk_4',
    title: 'Montagem Diamante Rosa',
    artist: 'DJ Arana & MC Ster',
    category: 'Brazilian Funk',
    videoId: 'eH6n4YtT_yI',
    url: 'https://www.youtube.com/watch?v=eH6n4YtT_yI',
    thumbnail: 'https://img.youtube.com/vi/eH6n4YtT_yI/mqdefault.jpg',
    duration: '2:18',
  },

  // ── TRAP ──
  {
    id: 'trap_1',
    title: 'FE!N',
    artist: 'Travis Scott ft. Playboi Carti',
    category: 'Trap',
    videoId: 'B9synWjqBn8',
    url: 'https://www.youtube.com/watch?v=B9synWjqBn8',
    thumbnail: 'https://img.youtube.com/vi/B9synWjqBn8/mqdefault.jpg',
    duration: '3:12',
  },
  {
    id: 'trap_2',
    title: 'redrum',
    artist: '21 Savage',
    category: 'Trap',
    videoId: 'U4mADkt6o-M',
    url: 'https://www.youtube.com/watch?v=U4mADkt6o-M',
    thumbnail: 'https://img.youtube.com/vi/U4mADkt6o-M/mqdefault.jpg',
    duration: '4:40',
  },
  {
    id: 'trap_3',
    title: 'fukumean',
    artist: 'Gunna',
    category: 'Trap',
    videoId: 'V6ZsXKE8QmQ',
    url: 'https://www.youtube.com/watch?v=V6ZsXKE8QmQ',
    thumbnail: 'https://img.youtube.com/vi/V6ZsXKE8QmQ/mqdefault.jpg',
    duration: '2:06',
  },
  {
    id: 'trap_4',
    title: 'Autobahn',
    artist: 'SCH',
    category: 'Trap',
    videoId: '3k_mQ-7mX6k',
    url: 'https://www.youtube.com/watch?v=3k_mQ-7mX6k',
    thumbnail: 'https://img.youtube.com/vi/3k_mQ-7mX6k/mqdefault.jpg',
    duration: '3:27',
  },
];

interface SoundboardMusicSectionProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onPlayingChange?: (title: string | null) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Drill: '#00e5ff',
  Phonk: '#ef4444',
  'Brazilian Funk': '#10b981',
  Trap: '#a855f7',
  Perso: '#f59e0b',
};

export default function SoundboardMusicSection({ showToast, onPlayingChange }: SoundboardMusicSectionProps) {
  const [tracks, setTracks] = useState<YouTubeMusicTrack[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lecteur Soundboard Intégré avec Progression Temporelle
  const {
    activeTrack,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    seek,
    playTrack,
    pauseTrack,
    resumeTrack,
    stopTrack,
  } = useSoundboardPlayer();

  // Modal « Importer votre musique »
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newArtist, setNewArtist] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Drill' | 'Phonk' | 'Brazilian Funk' | 'Trap' | 'Perso'>('Drill');
  const [newAudioUrl, setNewAudioUrl] = useState<string>('');
  const [newFileName, setNewFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les morceaux
  const loadTracks = () => {
    let custom: YouTubeMusicTrack[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_USER_MUSIC);
      if (raw) {
        custom = JSON.parse(raw);
      }
    } catch {}
    setTracks([...custom, ...REAL_YOUTUBE_TRACKS]);
  };

  useEffect(() => {
    loadTracks();
  }, []);

  // Lecture / Pause du lecteur Soundboard discret
  const handleTogglePlay = (track: YouTubeMusicTrack) => {
    const isThisActive = activeTrack?.id === track.id || (track.videoId && activeTrack?.videoId === track.videoId);
    if (isThisActive && isPlaying) {
      pauseTrack();
      onPlayingChange?.(null);
    } else if (isThisActive && isPaused) {
      resumeTrack();
      onPlayingChange?.(track.title);
    } else {
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail,
        duration: track.duration,
        sourceType: track.videoId ? 'youtube' : 'audio',
        videoId: track.videoId,
        url: track.url || (track as any).audioUrl,
      });
      onPlayingChange?.(track.title);
    }
  };

  const handleStop = () => {
    stopTrack();
    onPlayingChange?.(null);
    soundboardEngine.stopAll();
  };

  // Diffuser dans le micro Discord via la Soundboard
  const handleBroadcastDiscord = async (track: YouTubeMusicTrack) => {
    showToast(`Diffusion dans votre micro Discord : ${track.title}...`, 'info');
    onPlayingChange?.(track.title);

    const res = await soundboardEngine.playSound(track.url, () => {
      onPlayingChange?.(null);
    });

    if (res.success) {
      showToast(`En cours de diffusion dans le micro : ${track.title}`, 'success');
    } else {
      showToast(res.error || 'Erreur lors de la diffusion.', 'error');
      onPlayingChange?.(null);
    }
  };

  // Ouvrir la vidéo originale sur YouTube
  const handleOpenOriginal = (track: YouTubeMusicTrack) => {
    window.open(track.url, '_blank');
  };

  // Sélection de fichier audio pour « Importer votre musique »
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewFileName(file.name);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    if (!newArtist) {
      setNewArtist('Artiste');
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewAudioUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Sauvegarde musique importée
  const handleSaveImportedMusic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Veuillez renseigner un titre.', 'error');
      return;
    }
    if (!newAudioUrl.trim()) {
      showToast('Veuillez sélectionner un fichier audio.', 'error');
      return;
    }

    const newTrack: YouTubeMusicTrack = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Ma Musique',
      category: newCategory,
      url: newAudioUrl,
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240',
      duration: 'Fichier local',
      isCustom: true,
    };

    try {
      const raw = localStorage.getItem(STORAGE_USER_MUSIC);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newTrack);
      localStorage.setItem(STORAGE_USER_MUSIC, JSON.stringify(list));
      loadTracks();
      setShowImportModal(false);
      setNewTitle('');
      setNewArtist('');
      setNewAudioUrl('');
      setNewFileName('');
      showToast(`Musique « ${newTrack.title} » importée avec succès !`, 'success');
    } catch {
      showToast("Erreur lors de l'enregistrement.", 'error');
    }
  };

  // Suppression d'une musique importée
  const handleDeleteCustomTrack = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer la musique « ${title} » de votre bibliothèque ?`)) {
      try {
        const raw = localStorage.getItem(STORAGE_USER_MUSIC);
        if (raw) {
          const list = JSON.parse(raw).filter((t: YouTubeMusicTrack) => t.id !== id);
          localStorage.setItem(STORAGE_USER_MUSIC, JSON.stringify(list));
          loadTracks();
          showToast('Musique supprimée.', 'info');
        }
      } catch {}
    }
  };

  const categories = [
    { id: 'all', label: 'Toutes les catégories' },
    { id: 'Drill', label: 'Drill' },
    { id: 'Phonk', label: 'Phonk' },
    { id: 'Brazilian Funk', label: 'Brazilian Funk' },
    { id: 'Trap', label: 'Trap' },
    { id: 'Perso', label: '⭐ Mes Musiques' },
  ];

  const filteredTracks = tracks.filter((t) => {
    const matchesCat =
      activeCategory === 'all' ||
      (activeCategory === 'Perso' ? t.isCustom : t.category === activeCategory);
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
        borderRadius: 22,
        padding: 26,
        border: '1px solid rgba(0, 229, 255, 0.25)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* ── EN-TÊTE ET BOUTON D'IMPORTATION EXACT ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #00e5ff 0%, #3b82f6 50%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
            }}
          >
            <Music size={26} color="#090d16" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '0.4px' }}>
              Bibliothèque Musicale Soundboard
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
              Véritables morceaux YouTube (Drill, Phonk, Brazilian Funk, Trap) avec lecteur intégré et diffusion Discord.
            </p>
          </div>
        </div>

        {/* Bouton avec l'intitulé EXACT demandé */}
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 22px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #00e5ff 0%, #0284c7 100%)',
            border: 'none',
            color: '#090d16',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(0, 229, 255, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={16} />
          <span>Importer votre musique</span>
        </button>
      </div>

      {/* ── BARRE DE CATÉGORIES & RECHERCHE ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const color = CATEGORY_COLORS[cat.id] || '#00e5ff';
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(59, 130, 246, 0.25))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isActive ? `1px solid ${color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search
            size={15}
            color="#94a3b8"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Filtrer les morceaux..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 12,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              fontSize: '0.85rem',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* ── GRILLE DES VRAIS MORCEAUX PAR CATÉGORIE ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {filteredTracks.map((track) => {
          const isThisActive = activeTrack?.id === track.id || (!!track.videoId && activeTrack?.videoId === track.videoId);
          const isPlayingThis = isThisActive && isPlaying;
          const isPausedThis = isThisActive && isPaused;
          const catColor = CATEGORY_COLORS[track.category] || '#00e5ff';

          return (
            <div
              key={track.id}
              style={{
                background: isPlayingThis
                  ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                  : isPausedThis
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                  : 'rgba(15, 23, 42, 0.75)',
                border: isPlayingThis
                  ? '2px solid #00e5ff'
                  : isPausedThis
                  ? '2px solid #f59e0b'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 18,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                boxShadow: isPlayingThis
                  ? '0 0 25px rgba(0, 229, 255, 0.4)'
                  : isPausedThis
                  ? '0 0 20px rgba(245, 158, 11, 0.3)'
                  : '0 4px 16px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Image & Badge Catégorie */}
              <div style={{ position: 'relative', width: '100%', height: 135, borderRadius: 12, overflow: 'hidden' }}>
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    padding: '3px 8px',
                    borderRadius: 8,
                    background: 'rgba(9, 13, 22, 0.85)',
                    border: `1px solid ${catColor}`,
                    color: catColor,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  {track.category}
                </span>

                {/* Badge Actif */}
                {isPlayingThis && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: track.isCustom ? 40 : 8,
                      padding: '3px 8px',
                      borderRadius: 8,
                      background: 'rgba(0, 229, 255, 0.9)',
                      color: '#090d16',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      boxShadow: '0 0 10px rgba(0, 229, 255, 0.6)',
                    }}
                  >
                    ▶ EN LECTURE
                  </span>
                )}

                {isPausedThis && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: track.isCustom ? 40 : 8,
                      padding: '3px 8px',
                      borderRadius: 8,
                      background: 'rgba(245, 158, 11, 0.9)',
                      color: '#090d16',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                    }}
                  >
                    ⏸ EN PAUSE
                  </span>
                )}

                <span
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#f8fafc',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {track.duration}
                </span>

                {track.isCustom && (
                  <button
                    onClick={(e) => handleDeleteCustomTrack(track.id, track.title, e)}
                    title="Supprimer de votre bibliothèque"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: 'rgba(239, 68, 68, 0.85)',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Titre & Artiste */}
              <div>
                <h4
                  style={{
                    margin: '0 0 2px 0',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={track.title}
                >
                  {track.title}
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#00e5ff', fontWeight: 600 }}>
                  {track.artist}
                </div>
              </div>

              {/* ── BARRE DE PROGRESSION MUSICALE INTÉGRÉE AU SON ── */}
              {isThisActive && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: isPlayingThis ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                    boxShadow: isPlayingThis ? '0 0 12px rgba(0, 229, 255, 0.2)' : undefined,
                    margin: '4px 0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ color: isPlayingThis ? '#00e5ff' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isPlayingThis ? '▶' : '⏸'} {formatSecondsToTime(currentTime)}
                    </span>
                    <span style={{ color: '#94a3b8' }}>
                      {formatSecondsToTime(duration || parseDurationToSeconds(track.duration) || 180)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={duration || parseDurationToSeconds(track.duration) || 180}
                    step={0.5}
                    value={currentTime}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="music-seek-bar"
                    title="Naviguer dans la musique"
                  />
                </div>
              )}

              {/* Boutons d'Action Harmonieux & Modernes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
                {/* Bouton Direct Lecture / Pause */}
                <button
                  onClick={() => handleTogglePlay(track)}
                  title={isPlayingThis ? 'Mettre en pause' : isPausedThis ? 'Reprendre la lecture' : 'Lancer la lecture audio'}
                  className={isPlayingThis ? 'btn-sound-pause' : isPausedThis ? 'btn-sound-resume' : 'btn-sound-play'}
                  style={{ flex: 1 }}
                >
                  {isPlayingThis ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                  <span>{isPlayingThis ? 'Pause' : isPausedThis ? 'Reprendre' : 'Lecture'}</span>
                </button>

                {/* Bouton Direct Arrêt */}
                <button
                  onClick={handleStop}
                  title="Arrêter la lecture"
                  className="btn-sound-stop"
                >
                  <Square size={12} fill="currentColor" />
                  <span>Stop</span>
                </button>

                {/* Diffuser dans le micro Discord */}
                <button
                  onClick={() => handleBroadcastDiscord(track)}
                  title="Diffuser directement dans votre micro Discord"
                  className="btn-sound-micro"
                >
                  <Radio size={13} />
                  <span>Micro</span>
                </button>

                {/* Ouvrir sur YouTube */}
                {track.videoId && (
                  <button
                    onClick={() => handleOpenOriginal(track)}
                    title="Ouvrir la vidéo originale sur YouTube"
                    style={{
                      padding: '7px 9px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTracks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.88rem' }}>
          Aucun morceau trouvé dans cette catégorie.
        </div>
      )}

      {/* ── MODAL « IMPORTER VOTRE MUSIQUE » ── */}
      {showImportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowImportModal(false)}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #090d16 0%, #111827 100%)',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              borderRadius: 22,
              padding: 26,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 229, 255, 0.25)',
              position: 'relative',
              animation: 'fadeInUp 0.25s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImportModal(false)}
              title="Fermer"
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #00e5ff, #0284c7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={22} color="#090d16" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                  Importer votre musique
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#00e5ff', fontWeight: 600 }}>
                  Compatible MP3, WAV, OGG, M4A, FLAC
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveImportedMusic}>
              {/* Sélecteur de fichier audio */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                  Fichier audio :
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(0, 229, 255, 0.35)',
                    borderRadius: 14,
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(0, 229, 255, 0.04)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Upload size={22} color="#00e5ff" style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 700 }}>
                    {newFileName ? newFileName : 'Cliquez pour sélectionner un fichier'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                    Enregistré localement dans la Soundboard
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Titre */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                  Titre :
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mon Morceau Favori"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#0a0f1d',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Artiste */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                  Artiste :
                </label>
                <input
                  type="text"
                  placeholder="ex: Nom de l'artiste"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#0a0f1d',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Catégorie */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                  Catégorie musicale :
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#0a0f1d',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                >
                  <option value="Drill">Drill</option>
                  <option value="Phonk">Phonk</option>
                  <option value="Brazilian Funk">Brazilian Funk</option>
                  <option value="Trap">Trap</option>
                  <option value="Perso">Autre / Perso</option>
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={!newAudioUrl}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    borderRadius: 12,
                    background: newAudioUrl
                      ? 'linear-gradient(135deg, #00e5ff 0%, #0284c7 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#090d16',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: newAudioUrl ? 'pointer' : 'not-allowed',
                    boxShadow: newAudioUrl ? '0 0 20px rgba(0, 229, 255, 0.4)' : 'none',
                  }}
                >
                  <CheckCircle size={16} />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

