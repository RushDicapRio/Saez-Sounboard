import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  LogOut,
  ChevronDown,
  Clipboard,
  Headphones,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import type { YouTubeUserProfile } from '../types/soundboard';
import {
  getYouTubeUserProfile,
  logoutYouTube,
  getUserYouTubeCookies,
  saveUserYouTubeCookies,
  syncUserPlaylistsFromCookies,
  fetchUserLikedMusics,
} from '../services/soundboardService';

// Icône YouTube SVG officielle
const YouTubeIcon = ({ size = 20, color = '#ff0000' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block', flexShrink: 0 }}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface YouTubeProfileWidgetProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onProfileChange?: (profile: YouTubeUserProfile | null) => void;
}

export default function YouTubeProfileWidget({ showToast, onProfileChange }: YouTubeProfileWidgetProps) {
  const [profile, setProfile] = useState<YouTubeUserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [cookieText, setCookieText] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Charger le profil actif lors du montage
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const savedProfile = await getYouTubeUserProfile();
        if (isMounted && savedProfile) {
          setProfile(savedProfile);
          onProfileChange?.(savedProfile);
          return;
        }

        const storedProfileRaw = localStorage.getItem('saez_soundboard_yt_profile');
        if (storedProfileRaw) {
          try {
            const parsed = JSON.parse(storedProfileRaw);
            if (isMounted && parsed) {
              setProfile(parsed);
              onProfileChange?.(parsed);
              return;
            }
          } catch {}
        }

        const existingCookies = getUserYouTubeCookies();
        if (existingCookies && existingCookies.length > 10) {
          const cookieProfile: YouTubeUserProfile = {
            channel_id: 'yt_user',
            title: 'Compte YouTube',
            custom_url: '@YouTube',
            avatar_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100',
            subscriber_count: '0',
            video_count: '0',
            connected_at: new Date().toISOString(),
          };
          if (isMounted) {
            setProfile(cookieProfile);
            onProfileChange?.(cookieProfile);
          }
        }
      } catch (err) {
        console.warn('Initialisation profil YouTube:', err);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fermer le dropdown en cas de clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Fermeture par la touche Échap
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Ouvrir la pop-up de connexion
  const handleOpenModal = () => {
    setCookieText('');
    setIsModalOpen(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 120);
  };

  // Fermer la pop-up
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCookieText('');
  };

  // Bouton "Coller" : lit directement le presse-papiers système
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        setCookieText(text);
        showToast('Texte collé.', 'info');
      } else {
        showToast('Le presse-papiers est vide.', 'info');
      }
    } catch {
      showToast('Presse-papiers inaccessible. Utilisez Ctrl+V.', 'info');
    }
  };

  // Bouton "Valider"
  const handleValidate = async () => {
    const raw = cookieText.trim();

    if (!raw) {
      showToast('Veuillez coller du texte avant de valider.', 'info');
      return;
    }

    saveUserYouTubeCookies(raw);

    const profileData: YouTubeUserProfile = {
      channel_id: 'yt_user',
      title: 'Compte YouTube',
      custom_url: '@YouTube',
      avatar_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100',
      subscriber_count: '0',
      video_count: '0',
      connected_at: new Date().toISOString(),
    };
    try {
      localStorage.setItem('saez_soundboard_yt_profile', JSON.stringify(profileData));
    } catch {}

    setProfile(profileData);
    onProfileChange?.(profileData);
    setCookieText('');
    handleCloseModal();
    showToast('Compte YouTube connecté avec succès ! Synchronisation...', 'success');

    // Lancer la synchronisation immédiate des playlists et musiques likées
    try {
      await syncUserPlaylistsFromCookies(raw);
      await fetchUserLikedMusics(raw);
    } catch (err: any) {
      console.debug('Sync background notice:', err);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    try {
      saveUserYouTubeCookies('');
      try {
        localStorage.removeItem('saez_soundboard_yt_profile');
      } catch {}
      await logoutYouTube();
      setProfile(null);
      onProfileChange?.(null);
      setDropdownOpen(false);
      showToast('Déconnexion effectuée.', 'info');
    } catch (err: any) {
      showToast(`Erreur lors de la déconnexion: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* ── BOUTON / BADGE DANS LA BARRE SUPÉRIEURE ── */}
      {profile ? (
        // État connecté avec Avatar Moderne & Propre
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 14px 5px 6px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(13, 21, 39, 0.95) 0%, rgba(20, 31, 56, 0.95) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.45)',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45), 0 0 14px rgba(0, 229, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#f8fafc',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00e5ff';
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(0, 229, 255, 0.35)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.45)';
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.45), 0 0 14px rgba(0, 229, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title={`Compte YouTube connecté : ${profile.title}`}
        >
          {/* Avatar Circulaire Parfait avec Bordure Cyan */}
          <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.title}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #00e5ff',
                  boxShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 50%, #a855f7 100%)',
                  border: '2px solid rgba(0, 229, 255, 0.7)',
                  boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Headphones size={17} color="#ffffff" />
              </div>
            )}

            {/* Indicateur discret de connexion verte */}
            <span
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #080c14',
                boxShadow: '0 0 8px #10b981',
              }}
              title="Session YouTube active"
            />
          </div>

          <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                maxWidth: '140px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#ffffff',
              }}
            >
              {profile.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>
                ● Connecté
              </span>
            </div>
          </div>

          <ChevronDown
            size={14}
            color="#94a3b8"
            style={{
              transition: 'transform 0.2s ease',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              marginLeft: 2,
            }}
          />
        </button>
      ) : (
        // État non connecté -> Bouton "Connecter YouTube"
        <button
          onClick={handleOpenModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '9px 18px',
            borderRadius: 22,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 4px 18px rgba(239, 68, 68, 0.35)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(239, 68, 68, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(239, 68, 68, 0.35)';
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <YouTubeIcon size={14} color="#ffffff" />
          </div>
          <span>Connecter YouTube</span>
        </button>
      )}

      {/* ── MENU DU COMPTE CONNECTÉ HARMONIEUX ── */}
      {dropdownOpen && profile && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 300,
            background: 'linear-gradient(155deg, #0d1527 0%, #15223a 100%)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            borderRadius: 18,
            boxShadow: '0 16px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 229, 255, 0.15)',
            padding: 16,
            zIndex: 1000,
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid #00e5ff', flexShrink: 0 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0284c7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Headphones size={20} color="#fff" />
                </div>
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile.title}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#00e5ff', fontWeight: 600 }}>
                {profile.custom_url || 'Chaîne YouTube synchronisée'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.68rem', color: '#34d399', fontWeight: 700 }}>
                <CheckCircle2 size={11} />
                <span>Session Google valide</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <button
              onClick={async () => {
                setDropdownOpen(false);
                showToast('Synchronisation de vos playlists...', 'info');
                await syncUserPlaylistsFromCookies();
                await fetchUserLikedMusics();
                showToast('Playlists et musiques actualisées !', 'success');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                color: '#00e5ff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)')}
            >
              <RefreshCw size={14} />
              <span>Synchroniser mes musiques</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
            >
              <LogOut size={14} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}

      {/* ── POP-UP ÉPURÉE ET PROPRE : SAISIE YOUTUBE ── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 16, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: 'linear-gradient(155deg, #0d1527 0%, #172339 60%, #1e293b 100%)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 20,
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 25px rgba(239, 68, 68, 0.15)',
              padding: '22px 24px',
              animation: 'fadeInUp 0.2s ease-out',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* En-tête */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.35) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <YouTubeIcon size={18} color="#ff0000" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Connexion YouTube
                </h3>
              </div>

              {/* Bouton Fermer */}
              <button
                onClick={handleCloseModal}
                style={{
                  width: 30,
                  height: 30,
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
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Zone de texte multiligne */}
            <textarea
              ref={textareaRef}
              value={cookieText}
              onChange={(e) => setCookieText(e.target.value)}
              rows={8}
              placeholder="Collez ici le texte..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(8, 12, 22, 0.85)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                color: '#f8fafc',
                fontSize: '0.82rem',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                lineHeight: 1.45,
                resize: 'vertical',
                minHeight: '160px',
                outline: 'none',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6)',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.25)')}
            />

            {/* Barre de boutons : Coller, Annuler, Valider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
              {/* Bouton Coller à gauche */}
              <button
                type="button"
                onClick={handlePaste}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 10,
                  background: 'rgba(0, 229, 255, 0.15)',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  color: '#00e5ff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 229, 255, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)')}
              >
                <Clipboard size={14} />
                <span>Coller</span>
              </button>

              {/* Boutons Annuler et Valider à droite */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleValidate}
                  style={{
                    padding: '9px 22px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.35)';
                  }}
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
