import { useState } from 'react';
import MicrophoneSoundboard from './components/MicrophoneSoundboard';
import YouTubeProfileWidget from './components/YouTubeProfileWidget';
import ConfigGuideModal from './components/ConfigGuideModal';
import type { YouTubeUserProfile } from './types/soundboard';
import { Sparkles, Volume2, HelpCircle } from 'lucide-react';
import './styles/global.css';

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [connectedYouTube, setConnectedYouTube] = useState<YouTubeUserProfile | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: 9999,
            padding: '14px 22px',
            borderRadius: 14,
            background:
              toastType === 'success'
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : toastType === 'error'
                ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                : 'linear-gradient(135deg, #0284c7, #0ea5e9)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main style={{ flex: 1, padding: '28px 36px 48px 36px', color: '#f8fafc', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(139, 92, 246, 0.2))',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  color: '#00e5ff',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                }}
              >
                <Volume2 size={16} />
                SAEZ SOUNDBOARD
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(139, 92, 246, 0.2))',
                  border: '1px solid rgba(0, 229, 255, 0.35)',
                  color: '#00e5ff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                }}
              >
                <Sparkles size={13} />
                VRAI SOUNDBOARD PC (MICROPHONE)
              </span>
            </div>

            <h1
              style={{
                fontSize: '2.1rem',
                fontWeight: 900,
                margin: '10px 0 6px 0',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #00e5ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Soundboard Micro &amp; Moteur YouTube Discord
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.98rem' }}>
              Diffusez vos sons et musiques YouTube directement dans votre micro Discord en temps réel avec retour audio casque.
            </p>
          </div>

          {/* Guide de configuration & Profil YouTube */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsGuideOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 22,
                background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(99, 102, 241, 0.22) 100%)',
                border: '1px solid rgba(0, 229, 255, 0.45)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                color: '#00e5ff',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 229, 255, 0.28) 0%, rgba(99, 102, 241, 0.38) 100%)';
                e.currentTarget.style.boxShadow = '0 0 18px rgba(0, 229, 255, 0.45)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(99, 102, 241, 0.22) 100%)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <HelpCircle size={16} />
              <span>Guide de configuration</span>
            </button>

            <YouTubeProfileWidget showToast={showToast} onProfileChange={setConnectedYouTube} />
          </div>
        </div>

        {/* Main Soundboard Panel */}
        <MicrophoneSoundboard showToast={showToast} connectedYouTube={connectedYouTube} />
      </main>

      {/* Guide de configuration interactif */}
      <ConfigGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

