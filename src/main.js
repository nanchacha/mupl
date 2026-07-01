import * as THREE from 'three';
import './style.css';

document.querySelector('#app').innerHTML = `
<div class="app-layout">
  <div id="sidebarOverlay" class="sidebar-overlay"></div>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title-area">
        <h2>Mupl</h2>
        <p>Premium Player</p>
      </div>
      <button id="closeSidebarBtn" class="icon-btn mobile-only" title="Close Playlist">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="yt-upload-container">
      <input type="text" id="ytUrlInput" placeholder="Paste YouTube Link..." />
      <button id="ytUploadBtn" class="primary-btn" title="Extract and Save to Drive">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </button>
    </div>

    <div id="trackList" class="track-list">
      <!-- Tracks loaded here -->
    </div>
  </aside>

  <main class="main-content">
    <header class="top-bar">
      <div class="playing-info">
        <span class="label">PLAYING FROM FOLDER</span>
        <h3 id="playlistName">Mupl Default Library</h3>
      </div>
      <button id="playlistToggleBtn" class="icon-btn mobile-only" title="Toggle Playlist">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
    </header>

    <div class="bottom-player-bar">
      <div class="progress-container">
        <span id="currentTimeDisplay">0:00</span>
        <input type="range" id="progressBar" class="progress-bar" value="0" min="0" max="100" step="0.1">
        <span id="totalTimeDisplay">0:00</span>
      </div>
      
      <div class="controls-row">
        <div class="left-controls">
          <div class="track-info-text-mini">
            <h3 id="trackTitleDisplay">Select a track</h3>
            <p id="trackArtistDisplay">Google Drive</p>
          </div>
          <button class="icon-btn hidden" id="shuffleBtn" title="Shuffle">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </button>
        </div>
        
        <div class="center-controls">
          <button class="icon-btn" id="prevBtn" title="Previous">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>
          <button id="customPlayBtn" class="play-pause-btn" title="Play/Pause">
            <svg class="play-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg class="pause-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="currentColor" style="display:none">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <button class="icon-btn" id="nextBtn" title="Next">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
        </div>
        
        <div class="right-controls">
          <button class="icon-btn" id="repeatBtn" title="Repeat">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </button>
          <div class="volume-wrapper">
            <button id="volumeBtn" class="icon-btn" title="Volume">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
            <input type="range" id="volumeSlider" class="volume-slider" min="0" max="1" step="0.01" value="1">
          </div>
        </div>
      </div>
      
      <audio id="audioPlayer" class="hidden"></audio>
    </div>
  </main>
  
  <div id="statusMsg" class="status-msg"></div>
</div>
`;

const trackListContainer = document.getElementById('trackList');
const audioPlayer = document.getElementById('audioPlayer');
audioPlayer.crossOrigin = 'anonymous';
const trackTitleDisplay = document.getElementById('trackTitleDisplay');
const statusMsg = document.getElementById('statusMsg');

const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const playlistToggleBtn = document.getElementById('playlistToggleBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');

playlistToggleBtn.addEventListener('click', () => {
  sidebar.classList.add('mobile-open');
  sidebarOverlay.classList.add('mobile-open');
});

closeSidebarBtn.addEventListener('click', () => {
  sidebar.classList.remove('mobile-open');
  sidebarOverlay.classList.remove('mobile-open');
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('mobile-open');
  sidebarOverlay.classList.remove('mobile-open');
});

const ytUrlInput = document.getElementById('ytUrlInput');
const ytUploadBtn = document.getElementById('ytUploadBtn');

ytUploadBtn.addEventListener('click', async () => {
  const url = ytUrlInput.value.trim();
  if (!url) return;
  
  ytUploadBtn.disabled = true;
  ytUrlInput.disabled = true;
  statusMsg.textContent = 'Extracting and uploading to Drive...';
  
  try {
    const res = await fetch('/api/yt-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Upload failed');
    }
    
    const data = await res.json();
    statusMsg.textContent = 'Upload complete! Refreshing playlist...';
    
    // Refresh the folder
    ytUrlInput.value = '';
    await loadFolder('1SS9kZ16KErhHA-QMZmMm_QsO8aqS7O9C');
  } catch (err) {
    console.error(err);
    statusMsg.textContent = 'Error: ' + err.message;
  } finally {
    ytUploadBtn.disabled = false;
    ytUrlInput.disabled = false;
    setTimeout(() => {
      if (statusMsg.textContent.startsWith('Error') || statusMsg.textContent.includes('complete')) {
        statusMsg.textContent = '';
      }
    }, 4000);
  }
});

const customPlayBtn = document.getElementById('customPlayBtn');
const playIcon = customPlayBtn.querySelector('.play-icon');
const pauseIcon = customPlayBtn.querySelector('.pause-icon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const repeatBtn = document.getElementById('repeatBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');

const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const totalTimeDisplay = document.getElementById('totalTimeDisplay');

let currentFiles = [];
let currentIndex = -1;

async function loadFolder(folderId) {
  statusMsg.textContent = 'Loading playlist...';
  
  try {
    const res = await fetch(`/api/folder?id=${folderId}`);
    if (!res.ok) throw new Error('Failed to load folder');
    const files = await res.json();
    
    statusMsg.textContent = '';

    if (files.length === 0) {
      statusMsg.textContent = 'No playable audio files found.';
      return;
    }

    renderTrackList(files);
  } catch (err) {
    statusMsg.textContent = 'Failed to load folder.';
  }
}

function renderTrackList(files) {
  trackListContainer.innerHTML = '';
  currentFiles = files;
  
  files.forEach((file, index) => {
    const cleanName = file.name.replace(/\.[a-zA-Z0-9]+$/, '');

    const item = document.createElement('div');
    item.className = 'track-item';
    item.innerHTML = `
      <svg class="track-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
      <div class="track-item-name">${cleanName}</div>
    `;
    
    item.addEventListener('click', () => {
      playTrack(index);
    });
    
    trackListContainer.appendChild(item);
  });
}

function playTrack(index) {
  if (index < 0 || index >= currentFiles.length) return;
  
  currentIndex = index;
  const file = currentFiles[index];
  const cleanName = file.name.replace(/\.[a-zA-Z0-9]+$/, '');
  
  document.querySelectorAll('.track-item').forEach((el, i) => {
    if (i === index) el.classList.add('active');
    else el.classList.remove('active');
  });

  if (window.innerWidth <= 768) {
    sidebar.classList.remove('mobile-open');
    sidebarOverlay.classList.remove('mobile-open');
  }

  playFile(file.id, cleanName);
}

function playFile(fileId, title) {
  const streamUrl = `/api/stream?id=${fileId}`;
  
  trackTitleDisplay.textContent = title;
  trackTitleDisplay.classList.remove('scroll-text');
  
  // Wait for DOM to render the new text size before measuring
  requestAnimationFrame(() => {
    if (trackTitleDisplay.scrollWidth > trackTitleDisplay.parentElement.clientWidth) {
      trackTitleDisplay.classList.add('scroll-text');
    }
  });
  
  audioPlayer.src = streamUrl;
  audioPlayer.load();
  audioPlayer.play().catch(err => console.error("Playback failed:", err));
}

// Controls
customPlayBtn.addEventListener('click', () => {
  if (!audioPlayer.src) return;
  if (audioPlayer.paused) audioPlayer.play();
  else audioPlayer.pause();
});

let progressAnimId = null;

function updateProgress() {
  if (audioPlayer.duration) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = progress;
    progressBar.style.setProperty('--progress', progress + '%');
    progressBar.style.setProperty('--progress-raw', progress);
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  }
  progressAnimId = requestAnimationFrame(updateProgress);
}

audioPlayer.addEventListener('play', () => {
  playIcon.style.display = 'none';
  pauseIcon.style.display = 'block';
  if (!progressAnimId) {
    progressAnimId = requestAnimationFrame(updateProgress);
  }
});

audioPlayer.addEventListener('pause', () => {
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
  if (progressAnimId) {
    cancelAnimationFrame(progressAnimId);
    progressAnimId = null;
  }
});

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) playTrack(currentIndex - 1);
});

nextBtn.addEventListener('click', () => {
  if (currentIndex < currentFiles.length - 1) playTrack(currentIndex + 1);
});

repeatBtn.addEventListener('click', () => {
  audioPlayer.loop = !audioPlayer.loop;
  repeatBtn.classList.toggle('active', audioPlayer.loop);
});

audioPlayer.addEventListener('ended', () => {
  if (!audioPlayer.loop && currentIndex < currentFiles.length - 1) {
    playTrack(currentIndex + 1);
  }
});

// Progress Bar (now handled by requestAnimationFrame in play/pause)

audioPlayer.addEventListener('loadedmetadata', () => {
  totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
});

progressBar.addEventListener('input', (e) => {
  if (audioPlayer.duration) {
    const seekTime = (e.target.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
    progressBar.style.setProperty('--progress', e.target.value + '%');
    progressBar.style.setProperty('--progress-raw', e.target.value);
    currentTimeDisplay.textContent = formatTime(seekTime);
  }
});

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Volume
volumeSlider.addEventListener('input', (e) => {
  audioPlayer.volume = e.target.value;
  updateVolumeIcon(e.target.value);
});

function updateVolumeIcon(vol) {
  vol = parseFloat(vol);
  if (vol === 0) {
    volumeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  } else if (vol < 0.5) {
    volumeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
  } else {
    volumeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
  }
}

// Initial Load
window.addEventListener('DOMContentLoaded', () => {
  loadFolder('1SS9kZ16KErhHA-QMZmMm_QsO8aqS7O9C');
  initThreeJS();
});

// --- Three.js Setup & Audio Analyzer ---

let analyser = null;
let dataArray = null;
let audioContext = null;

// Three.js Objects
let scene, camera, renderer;
let turntableBase, platter, record, tonearmPivot, tonearmArm;
let isPlaying = false;
let currentRotation = 0;

function initAudioAnalyzer() {
  if (audioContext) return; // Already initialized
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audioPlayer);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  } catch (e) {
    console.error("AudioContext init failed:", e);
  }
}

function initThreeJS() {
  // Create Canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'webgl-canvas';
  document.body.prepend(canvas);

  // Scene setup
  scene = new THREE.Scene();
  // No background color, let it be transparent or we can add a subtle color
  // Actually we'll use a deep dark background with some fog
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  // Position camera to look down slightly at the turntable
  camera.position.set(0, 8, 12);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 2.5);
  spotLight.position.set(5, 15, 5);
  spotLight.castShadow = true;
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.5;
  scene.add(spotLight);

  const pointLight = new THREE.PointLight(0x00d2ff, 1.2, 20); // Cyan glow
  pointLight.position.set(-5, 5, -5);
  scene.add(pointLight);

  // Turntable Base
  const baseGeo = new THREE.BoxGeometry(10, 1, 8);
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: 0xe8e8e8, // Sleek white/silver base
    roughness: 0.3, 
    metalness: 0.1 
  });
  turntableBase = new THREE.Mesh(baseGeo, baseMat);
  turntableBase.position.y = -0.5;
  turntableBase.receiveShadow = true;
  scene.add(turntableBase);

  // Platter
  const platterGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.2, 64);
  const platterMat = new THREE.MeshStandardMaterial({ 
    color: 0xb0b0b0, // Lighter metallic
    metalness: 0.9,
    roughness: 0.1
  });
  platter = new THREE.Mesh(platterGeo, platterMat);
  platter.position.y = 0.1;
  platter.castShadow = true;
  scene.add(platter);

  // Record
  const recordGeo = new THREE.CylinderGeometry(3.4, 3.4, 0.05, 64);
  const recordMat = new THREE.MeshStandardMaterial({ 
    color: 0x050505,
    roughness: 0.4,
    metalness: 0.1
  });
  record = new THREE.Mesh(recordGeo, recordMat);
  record.position.y = 0.15;
  platter.add(record); // Add to platter so it spins with it

  // Record Label (Center)
  const labelGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.06, 32);
  const labelMat = new THREE.MeshStandardMaterial({ color: 0xffc107 }); // Yellow accent
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.y = 0.01;
  record.add(label);

  // Label Marker (makes rotation extremely obvious)
  const markerGeo = new THREE.BoxGeometry(1.6, 0.07, 0.2);
  const markerMat = new THREE.MeshStandardMaterial({ color: 0xff3333 }); // Red stripe
  const marker = new THREE.Mesh(markerGeo, markerMat);
  marker.position.set(0.3, 0.01, 0);
  label.add(marker);

  // Center Hole
  const centerHoleGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
  const centerHoleMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const centerHole = new THREE.Mesh(centerHoleGeo, centerHoleMat);
  centerHole.position.y = 0.03;
  label.add(centerHole);

  // Record Grooves (Rings)
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  for(let i = 1.5; i < 3.3; i += 0.2) {
    const ringGeo = new THREE.RingGeometry(i, i + 0.02, 64);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    record.add(ring);
  }

  // Tonearm
  tonearmPivot = new THREE.Group();
  tonearmPivot.position.set(4, 0.5, -3);
  scene.add(tonearmPivot);

  const pivotBaseGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
  const pivotBaseMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.9, roughness: 0.1 });
  const pivotBase = new THREE.Mesh(pivotBaseGeo, pivotBaseMat);
  tonearmPivot.add(pivotBase);

  const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 4.5, 16);
  const armMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1, roughness: 0.1 });
  tonearmArm = new THREE.Mesh(armGeo, armMat);
  tonearmArm.rotation.x = Math.PI / 2;
  tonearmArm.position.set(0, 0.5, 2);
  tonearmPivot.add(tonearmArm);

  const headshellGeo = new THREE.BoxGeometry(0.3, 0.2, 0.6);
  const headshellMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const headshell = new THREE.Mesh(headshellGeo, headshellMat);
  headshell.position.set(0, 0, 2.2);
  tonearmArm.add(headshell);

  // Particles
  const particlesGeo = new THREE.BufferGeometry();
  const particlesCount = 200;
  const posArray = new Float32Array(particlesCount * 3);
  for(let i=0; i<particlesCount*3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particlesMesh);

  // Resize Handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Start Animation
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate platter if playing
  if (isPlaying) {
    currentRotation += 0.06; // Faster rotation (~33 RPM feel)
    platter.rotation.y = -currentRotation; // Rotate clockwise
  }

  // Audio Reactivity
  if (analyser && dataArray && isPlaying) {
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average bass (lower frequencies)
    let bassSum = 0;
    for(let i=0; i<10; i++) {
      bassSum += dataArray[i];
    }
    const avgBass = bassSum / 10;
    
    // Scale label based on bass
    const scale = 1 + (avgBass / 255) * 0.15;
    record.children[0].scale.set(scale, 1, scale); // Scale the label

    // Pulse lights based on bass
    scene.children.forEach(child => {
      if(child.isPointLight) {
        child.intensity = 1.2 + (avgBass / 255) * 3;
      }
    });

    // Make tonearm bounce slightly to the bass (like needle jumping)
    tonearmPivot.position.y = 0.5 + (avgBass / 255) * 0.04;

    // Dynamic Camera zoom based on heavy bass
    const targetZ = 12 + (avgBass / 255) * 0.8;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
  } else {
    // Relax camera back to default
    camera.position.z += (12 - camera.position.z) * 0.05;
    tonearmPivot.position.y += (0.5 - tonearmPivot.position.y) * 0.1;
  }

  // Tonearm movement based on progress
  let progress = 0;
  if (audioPlayer.duration) {
    progress = audioPlayer.currentTime / audioPlayer.duration;
  }
  // Base rotation (idle): 0. 
  // Playing start rotation: ~0.4 rad
  // Playing end rotation: ~0.8 rad
  const targetRotation = isPlaying ? 0.4 + (progress * 0.4) : 0;
  // Smoothly move tonearm
  tonearmPivot.rotation.y += (targetRotation - tonearmPivot.rotation.y) * 0.05;

  renderer.render(scene, camera);
}

// Hook into existing play/pause logic
const originalPlay = audioPlayer.play.bind(audioPlayer);
const originalPause = audioPlayer.pause.bind(audioPlayer);

audioPlayer.play = function() {
  if(audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  initAudioAnalyzer();
  isPlaying = true;
  return originalPlay();
};

audioPlayer.pause = function() {
  isPlaying = false;
  return originalPause();
};
