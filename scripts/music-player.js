// Romantic Audio Controller - Synthesized fallback and custom MP3 player

let audioCtx = null;
let synthIntervalId = null;
let isPlaying = false;

// Audio HTML elements
let playBtn, playIcon, pauseIcon, diskArt;
let audioEl = null;

// Synthesizer State
let currentChordIdx = 0;
// Progression in F-major / Bb-major (very emotional, dreamlike):
// Fmaj9 -> Cmaj7 -> Dmin9 -> Bbmaj9
const CHORDS = [
  [174.61, 220.00, 261.63, 329.63, 349.23], // F, A, C, E, F (Fmaj7/Fmaj9)
  [130.81, 164.81, 196.00, 246.94, 261.63], // C, E, G, B, C (Cmaj7)
  [146.83, 174.61, 220.00, 293.66, 329.63], // D, F, A, D, E (Dmin9)
  [116.54, 146.83, 174.61, 220.00, 233.08]  // Bb, D, F, A, Bb (Bbmaj9)
];

function initPlayer() {
  playBtn = document.getElementById('play-pause-btn');
  playIcon = document.getElementById('play-icon');
  pauseIcon = document.getElementById('pause-icon');
  diskArt = document.getElementById('disk-art');
  
  if (!playBtn) return;

  // Try creating audio element to check for custom MP3
  audioEl = new Audio();
  audioEl.src = 'assets/music/music_file.mp3';
  audioEl.loop = true;

  playBtn.addEventListener('click', togglePlay);
}

function togglePlay() {
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

async function playMusic() {
  isPlaying = true;
  
  // UI Updates
  playIcon.style.display = 'none';
  pauseIcon.style.display = 'block';
  diskArt.classList.add('playing');

  // Try playing custom MP3 first
  try {
    // We try to fetch the MP3 headers to see if it really exists/has size
    const response = await fetch(audioEl.src, { method: 'HEAD' });
    const fileExists = response.ok && response.headers.get('content-length') > 1000;
    
    if (fileExists) {
      audioEl.play();
      document.getElementById('music-title').innerText = "Sweet Melodies";
      return;
    }
  } catch (e) {
    // If fetch failed or server returned error, fallback silently to Synth
    console.log("No MP3 file detected, falling back to Web Audio Synthesis.");
  }

  // Fallback Web Audio Synthesizer
  startSynth();
}

function pauseMusic() {
  isPlaying = false;

  // UI Updates
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
  diskArt.classList.remove('playing');

  // Pause audio element if active
  if (audioEl) {
    audioEl.pause();
  }

  // Stop Web Audio synth loop
  stopSynth();
}

// --- WEB AUDIO API SYNTHESIZER ---

function startSynth() {
  // Initialize context on user click
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  document.getElementById('music-title').innerText = "Harp Soundscapes (Synth)";

  // Arpeggiate notes on loop
  let noteIndex = 0;
  
  const playNextNote = () => {
    if (!isPlaying) return;

    const chord = CHORDS[currentChordIdx];
    const frequency = chord[noteIndex];
    
    // Procedural Harp Pluck Synthesis
    playHarpPluck(frequency);

    // Advance indexes
    noteIndex++;
    if (noteIndex >= chord.length) {
      noteIndex = 0;
      currentChordIdx = (currentChordIdx + 1) % CHORDS.length;
    }
  };

  // Play immediately, then every 600ms
  playNextNote();
  synthIntervalId = setInterval(playNextNote, 700);
}

function stopSynth() {
  if (synthIntervalId) {
    clearInterval(synthIntervalId);
    synthIntervalId = null;
  }
}

// Synthesize a single string pluck (Harp-like sound)
function playHarpPluck(freq) {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  
  // 1. Oscillator Node (soft Triangle wave)
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  // 2. Gain Envelope (Fast attack, long slow exponential decay)
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.001, now);
  // Pluck attack (15ms)
  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.015);
  // Long release (2.5 seconds)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

  // 3. Lowpass Filter (makes it warmer and softer, like wood/strings)
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  // Cut off higher harmonics over time to simulate vibration losing energy
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 1.5);
  filter.Q.setValueAtTime(1.0, now);

  // 4. Feedback Delay (Dreamy spacious echo)
  const delay = audioCtx.createDelay();
  delay.delayTime.setValueAtTime(0.35, now);

  const delayGain = audioCtx.createGain();
  delayGain.gain.setValueAtTime(0.35, now); // Feedback volume

  // Wire connections:
  // osc -> filter -> gainNode -> destination
  // gainNode -> delay -> delayGain -> delay (feedback loop)
  // delay -> destination
  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Delay loop wiring
  gainNode.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(delay);
  delay.connect(audioCtx.destination);

  // Start & Stop
  osc.start(now);
  osc.stop(now + 2.6);
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  initPlayer();
});
