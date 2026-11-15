/**
 * Bike Life Audio Engine - Générateur audio procédural haute fidélité (Web Audio API)
 * Permet de disposer de véritables boucles musicales (Phonk, Drill, Brazilian Funk, Trap, Bass Music)
 * sans dépendance réseau, instantanées et 100% compatibles.
 */
import type { BikeLifeGenre } from '../types/soundboard';

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Encode un AudioBuffer Web Audio API en Blob WAV standard 16-bit PCM
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const numSamples = buffer.length * numChannels;
  const blockAlign = numChannels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * (bitDepth / 8);
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt Chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data Chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave and write 16-bit PCM samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Synthétise en temps réel une véritable boucle musicale Bike Life via OfflineAudioContext
 */
export async function generateBikeLifeBeatWavUrl(genre: BikeLifeGenre): Promise<string> {
  const sampleRate = 44100;
  let bpm = 140;

  if (genre === 'Phonk') bpm = 160;
  else if (genre === 'Drill') bpm = 142;
  else if (genre === 'Brazilian Funk') bpm = 130;
  else if (genre === 'Bass Music') bpm = 128;
  else if (genre === 'Remix') bpm = 148;
  else bpm = 140;

  const secondsPerBeat = 60 / bpm;
  const totalBeats = 16; // 4 mesures
  const duration = totalBeats * secondsPerBeat;

  const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * duration), sampleRate);

  // Sub Master Gain & Limiter
  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = 0.85;
  masterGain.connect(offlineCtx.destination);

  // 1. KICK (Gros 808 percutant)
  const kickGain = offlineCtx.createGain();
  kickGain.connect(masterGain);

  const triggerKick = (time: number, isSubSlide = false) => {
    const osc = offlineCtx.createOscillator();
    const g = offlineCtx.createGain();
    osc.type = 'sine';

    const startFreq = genre === 'Phonk' || genre === 'Brazilian Funk' ? 180 : 150;
    const endFreq = isSubSlide ? 32 : 45;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.12);

    g.gain.setValueAtTime(0.95, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + (isSubSlide ? 0.45 : 0.28));

    osc.connect(g);
    g.connect(kickGain);

    osc.start(time);
    osc.stop(time + (isSubSlide ? 0.46 : 0.29));
  };

  // 2. SNARE / CLAP
  const snareGain = offlineCtx.createGain();
  snareGain.connect(masterGain);

  const triggerSnare = (time: number) => {
    // Noise buffer
    const bufferSize = sampleRate * 0.18;
    const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = offlineCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = genre === 'Drill' ? 1400 : 1800;
    filter.Q.value = 1.2;

    const g = offlineCtx.createGain();
    g.gain.setValueAtTime(0.7, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    whiteNoise.connect(filter);
    filter.connect(g);
    g.connect(snareGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.19);
  };

  // 3. HI-HATS
  const hatGain = offlineCtx.createGain();
  hatGain.connect(masterGain);

  const triggerHat = (time: number, isPitchRolled = false) => {
    const osc = offlineCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(isPitchRolled ? 8500 : 6500, time);

    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const g = offlineCtx.createGain();
    g.gain.setValueAtTime(0.28, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(filter);
    filter.connect(g);
    g.connect(hatGain);

    osc.start(time);
    osc.stop(time + 0.055);
  };

  // 4. INSTRUMENT MÉLODIQUE CARACTÉRISTIQUE (Cowbell Phonk, Horns Brazilian Funk, Synth Arp Bass)
  const triggerMelodyNote = (time: number, freq: number, decay = 0.22) => {
    const osc = offlineCtx.createOscillator();
    const osc2 = offlineCtx.createOscillator();
    const g = offlineCtx.createGain();

    if (genre === 'Phonk') {
      // Cowbell Memphis 808 authentique
      osc.type = 'triangle';
      osc2.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 1.48, time);
    } else if (genre === 'Brazilian Funk') {
      // Brass stab percutant
      osc.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 0.5, time);
    } else {
      // Synth Drill / Trap sombre
      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 2, time);
    }

    g.gain.setValueAtTime(0.45, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(g);
    osc2.connect(g);
    g.connect(masterGain);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + decay + 0.01);
    osc2.stop(time + decay + 0.01);
  };

  // Gamme pentatonique A-mineur (Classique Phonk & Drill)
  const notes = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];

  // SÉQUENCAGE DU RYTHME
  for (let beat = 0; beat < totalBeats; beat++) {
    const t = beat * secondsPerBeat;

    // Kicks
    if (genre === 'Drill') {
      // Drill kick syncopé : beat 0, 1.75, 4, 5.75, 8, 9.75, etc.
      if (beat % 4 === 0) triggerKick(t);
      if (beat % 4 === 1) triggerKick(t + secondsPerBeat * 0.75, true);
    } else if (genre === 'Brazilian Funk') {
      // Rythme Tamborzão
      if (beat % 2 === 0) triggerKick(t);
      if (beat % 4 === 2) triggerKick(t + secondsPerBeat * 0.5);
    } else {
      // Trap / Phonk / Bass Music
      if (beat % 4 === 0) triggerKick(t);
      if (beat % 4 === 2 && (beat === 2 || beat === 10)) triggerKick(t + secondsPerBeat * 0.5, true);
    }

    // Snares
    if (genre === 'Drill' || genre === 'Trap') {
      // Half-time snare au 3ème temps de chaque mesure
      if (beat % 4 === 2) triggerSnare(t);
    } else {
      // 2ème et 4ème temps classiques
      if (beat % 2 === 1) triggerSnare(t);
    }

    // Hi-hats rapides (doubles croches & roulements)
    for (let sub = 0; sub < 4; sub++) {
      const hatTime = t + sub * (secondsPerBeat / 4);
      const isRoll = (beat === 3 || beat === 7 || beat === 15) && sub >= 2;
      triggerHat(hatTime, isRoll);
    }

    // Mélodies
    const noteIdx = (beat * 2 + (beat % 3)) % notes.length;
    triggerMelodyNote(t, notes[noteIdx], secondsPerBeat * 0.6);
  }

  // Rendu de l'audio
  const renderedBuffer = await offlineCtx.startRendering();
  const blob = audioBufferToWavBlob(renderedBuffer);
  return URL.createObjectURL(blob);
}

