import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isQuick = process.argv.includes('--quick') || process.argv.includes('--fast') || process.argv.includes('--debug');
const startTime = Date.now();

console.log(`\n🚀 Compilation de Saez Soundboard (PC) en cours (${isQuick ? 'Mode Rapide / Debug' : 'Mode Release Optimisé'})...`);

try {
  try {
    execSync('taskkill /F /IM cargo.exe /IM rustc.exe /IM "Saez Soundboard.exe" 2>nul || exit 0', { shell: 'cmd.exe' });
  } catch {}

  const env = { ...process.env };
  const buildCmd = isQuick ? 'npx tauri build --debug --no-bundle' : 'npx tauri build --no-bundle';
  execSync(buildCmd, { stdio: 'inherit', cwd: __dirname, env });

  const targetSubdir = isQuick ? 'debug' : 'release';
  const outDir = path.join(__dirname, 'src-tauri', 'target', targetSubdir);
  const possibleSources = [
    path.join(outDir, 'Saez Soundboard.exe'),
    path.join(outDir, 'saez_soundboard.exe'),
    path.join(outDir, 'saez-soundboard.exe'),
    path.join(__dirname, 'src-tauri', 'target', targetSubdir, 'Saez Soundboard.exe'),
    path.join(__dirname, 'src-tauri', 'target', targetSubdir, 'saez_soundboard.exe'),
  ];

  let sourceExe = possibleSources.find((p) => fs.existsSync(p));

  if (!sourceExe && fs.existsSync(outDir)) {
    const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.exe') && !f.includes('build') && !f.includes('wix'));
    if (files.length > 0) {
      sourceExe = path.join(outDir, files[0]);
    }
  }

  const targetExe = path.join(__dirname, 'Saez Soundboard.exe');

  if (sourceExe && fs.existsSync(sourceExe)) {
    try {
      execSync('taskkill /F /IM "Saez Soundboard.exe" 2>nul || exit 0', { shell: 'cmd.exe' });
    } catch {}
    fs.copyFileSync(sourceExe, targetExe);

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const stats = fs.statSync(targetExe);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n==================================================`);
    console.log(`✅ SUCCÈS : Saez Soundboard.exe est disponible !`);
    console.log(`📍 Emplacement : ${targetExe}`);
    console.log(`📦 Taille : ${sizeMb} Mo`);
    console.log(`⏱️ Temps de compilation : ${elapsedSeconds}s`);
    console.log(`==================================================\n`);
  } else {
    console.error(`❌ Erreur : Aucun fichier .exe compilé n'a été trouvé dans ${outDir}`);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erreur lors de la compilation :', error.message);
  process.exit(1);
}

