import React, { useState } from 'react';
import {
  X,
  Headphones,
  Cpu,
  Radio,
  Sliders,
  Keyboard,
  Music,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  Volume2,
  ExternalLink,
  ShieldCheck,
  Disc3,
} from 'lucide-react';

interface ConfigGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideStep {
  id: number;
  title: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  content: React.ReactNode;
}

export default function ConfigGuideModal({ isOpen, onClose }: ConfigGuideModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const steps: GuideStep[] = [
    {
      id: 1,
      title: 'Périphériques Audio & Sortie Casque',
      badge: 'Étape 1',
      icon: <Headphones size={20} color="#00e5ff" />,
      summary: 'Entendre vos sons en temps réel dans votre casque avec zéro latence.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Pour profiter pleinement de Saez Soundboard, vos sons et musiques doivent être diffusés à la fois dans vos oreilles (retour casque) et vers vos interlocuteurs.
          </p>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#00e5ff', fontSize: '0.86rem' }}>
              <CheckCircle2 size={16} />
              <span>Réglage recommandé :</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6 }}>
              <li>Dans Windows (Paramètres &gt; Son), laissez votre casque audio habituel comme <strong>Périphérique de sortie par défaut</strong>.</li>
              <li>Saez Soundboard utilise automatiquement cette sortie pour le retour immédiat dans vos oreilles.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Microphone & Câble Virtuel (VB-CABLE)',
      badge: 'Étape 2',
      icon: <Cpu size={20} color="#34d399" />,
      summary: 'La fusion magique entre votre voix et vos sons soundboard.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Pour diffuser des sons directement dans vos applications de chat vocal (Discord, TeamSpeak, jeux...), Windows a besoin d'un câble audio virtuel gratuit comme <strong>VB-CABLE</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.84rem', marginBottom: 4 }}>
                1. Détection automatique :
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Saez Soundboard détecte automatiquement <strong>CABLE Input (VB-Audio Virtual Cable)</strong> dès son ouverture et active le routage instantané.
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.84rem', marginBottom: 4 }}>
                2. Si vous n'avez pas encore VB-CABLE :
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Téléchargez-le gratuitement sur le site officiel <em>vb-audio.com/Cable</em>, installez-le et redémarrez simplement Saez Soundboard.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Configuration Rapide sur Discord',
      badge: 'Étape 3',
      icon: <Radio size={20} color="#a855f7" />,
      summary: 'Faire entendre la soundboard à vos amis dans vos salons vocaux.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Suivez ces 3 étapes simples dans vos paramètres Discord :
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.78rem' }}>1</span>
              <div style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
                Ouvrez Discord &gt; <strong>Paramètres utilisateur</strong> &gt; <strong>Voix &amp; Vidéo</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.78rem' }}>2</span>
              <div style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
                Dans <strong>Périphérique d'entrée</strong>, sélectionnez <strong>CABLE Output (VB-Audio Virtual Cable)</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.78rem' }}>3</span>
              <div style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
                Dans <strong>Périphérique de sortie</strong>, gardez votre casque habituel pour tout entendre.
              </div>
            </div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600 }}>
            💡 <strong>Astuce Discord :</strong> Désactivez la réduction de bruit "Krisp" dans Discord pour que vos musiques et basses ne soient pas coupées par l'algorithme vocal de Discord !
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Gestion des Volumes & Équilibrage',
      badge: 'Étape 4',
      icon: <Sliders size={20} color="#00e5ff" />,
      summary: 'Équilibrer la puissance de vos sons sans saturer le micro.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Un bon son ne doit ni être trop faible ni faire saturer le microphone de vos amis :
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
              <div style={{ fontWeight: 800, color: '#00e5ff', fontSize: '0.84rem', marginBottom: 4 }}>
                Master Volume (En haut)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Règle le niveau général de sortie. La valeur idéale recommandée se situe entre <strong>75% et 100%</strong>.
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.84rem', marginBottom: 4 }}>
                Bouton "STOP TOUT"
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Coupe instantanément tous les flux audio en un seul clic d'urgence en cas de son trop fort.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Raccourcis Clavier & Déclenchement Rapide',
      badge: 'Étape 5',
      icon: <Keyboard size={20} color="#f59e0b" />,
      summary: 'Lancer vos sons préférés directement en jeu ou en stream.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Pour chaque son personnalisé de votre soundboard, vous pouvez assigner une touche de votre clavier (ex: pavé numérique, touches F1-F12) :
          </p>

          <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6 }}>
            <li>Cliquez sur l'icône de raccourci sur n'importe quel son personnalisé.</li>
            <li>Appuyez sur la touche souhaitée pour l'enregistrer instantanément.</li>
            <li>Le son se déclenchera dès que vous appuyez sur cette touche, même si vous êtes en plein jeu ou dans une autre application !</li>
          </ul>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Musiques, Playlists & Moteur YouTube',
      badge: 'Étape 6',
      icon: <Music size={20} color="#ef4444" />,
      summary: 'Profiter de millions de musiques, du moteur de recherche et de vos playlists.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Saez Soundboard intègre une bibliothèque musicale complète et fonctionnelle :
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Disc3 size={18} color="#00e5ff" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <strong>Catégories prédéfinies :</strong> Drill, Phonk, Brazilian Funk, Trap et vos morceaux importés en local (.mp3, .wav).
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Radio size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <strong>Contrôle direct sur la carte :</strong> Boutons Lecture, Pause, Reprendre, Arrêt et barre de progression fluide directement intégrée sur le son.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Sparkles size={18} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <strong>Bouton « Micro » :</strong> Diffuse le morceau en direct dans votre micro Discord tout en gardant l'écoute dans votre casque.
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const activeStepData = steps.find((s) => s.id === currentStep) || steps[0];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(4, 7, 14, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          background: 'linear-gradient(155deg, #0d1527 0%, #131d33 60%, #1a2744 100%)',
          borderRadius: 22,
          border: '1px solid rgba(0, 229, 255, 0.35)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 229, 255, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInUp 0.25s ease-out',
        }}
      >
        {/* En-tête */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(139, 92, 246, 0.2))',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpCircle size={20} color="#00e5ff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                Guide de Configuration
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Toutes les étapes pour configurer vos sons, micro et Discord facilement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Fermer le guide"
            style={{
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
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stepper Navigation (Onglets étapes) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '12px 20px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            overflowX: 'auto',
          }}
        >
          {steps.map((s) => {
            const isCurrent = s.id === currentStep;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 18,
                  background: isCurrent ? 'linear-gradient(135deg, #00e5ff, #0284c7)' : 'rgba(255, 255, 255, 0.05)',
                  border: isCurrent ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isCurrent ? '#090d16' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                <span>{s.id}.</span>
                <span>{s.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu de l'étape active */}
        <div style={{ padding: '22px 26px', flex: 1, overflowY: 'auto', maxHeight: '55vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: 6,
                background: 'rgba(0, 229, 255, 0.15)',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                color: '#00e5ff',
                textTransform: 'uppercase',
              }}
            >
              {activeStepData.badge}
            </span>
            <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#ffffff' }}>
              {activeStepData.title}
            </h3>
          </div>

          <p style={{ margin: '0 0 16px 0', fontSize: '0.84rem', color: '#00e5ff', fontWeight: 600 }}>
            {activeStepData.summary}
          </p>

          {activeStepData.content}
        </div>

        {/* Pied de page avec pagination Suivant / Précédent */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 10,
              background: currentStep === 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: currentStep === 1 ? '#475569' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ChevronLeft size={16} />
            <span>Précédent</span>
          </button>

          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
            Étape {currentStep} sur {steps.length}
          </span>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00e5ff, #0284c7)',
                border: 'none',
                color: '#090d16',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 0 14px rgba(0, 229, 255, 0.35)',
                transition: 'all 0.2s',
              }}
            >
              <span>Suivant</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Terminer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

