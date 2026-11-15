# 🎵 Saez Soundboard (Windows Standalone)

Logiciel de Soundboard PC indépendant propulsé par **Tauri 2** et **Rust**.

---

## 🚀 Fonctionnalités Clés

- **Mode Soundpad & Fusion Micro en Temps Réel** : Transmettez vos sons et votre voix simultanément dans votre micro Discord (via VB-Audio Virtual Cable ou sortie directe). Vos interlocuteurs vous entendent parler et entendent les sons joués en même temps, sans jamais couper la conversation ni changer les entrées.
- **Retour Audio Casque Local** : Écoutez instantanément vos sons dans votre casque avec contrôle indépendant du volume de sortie (jusqu'à 150%).
- **Raccourcis Clavier Dédiés (Hotkeys)** : Raccourcis Numpad 1 à 9 actifs par défaut et modifiables pour chaque son.
- **Grille de Sons Prédéfinis & Personnalisés** :
  - 20 mèmes et effets sonores intégrés (MLG Airhorn, Bruh, Metal Pipe, Vine Boom, FBI Open Up, Anime Wow, NANI, Rick Roll, Sad Violin, Drumroll, Roblox Oof, Final Fantasy Victory Fanfare, Fail Trombone, Applause, Inception Bwaam, Illuminati, Windows Error, Coffin Dance, Emotional Damage, Directed By).
  - Ajout de sons personnalisés (URL web, fichier local PC).
  - Modification et suppression de sons.
- **Importation & Exportation** :
  - Import de fichiers audio locaux (MP3, WAV, OGG) directement depuis l'ordinateur.
  - Export complet de votre collection de sons au format JSON pour sauvegarde ou partage.
  - Import de collections JSON en un clic.
- **Moteur YouTube Direct (0ms Latence, 0 Coupure)** :
  - Recherche ultra-rapide parmi des millions de sons et musiques YouTube.
  - Extraction et streaming local sans latence via yt-dlp natif.
  - Support de vos titres likés et de l'import de playlists YouTube Music.
- **Guide Anti-Coupure Discord** : Instructions détaillées intégrées pour désactiver Krisp, l'annulation d'écho et ajuster la sensibilité d'entrée (-60 dB).

---

## 🛠️ Compilation et Démarrage

### Mode Développement :
```bash
npm run dev
```

### Compilation de l'exécutable Windows (.exe) :
```bash
npm run build:exe
```
L'exécutable `Saez Soundboard.exe` est automatiquement généré à la racine du dossier.

