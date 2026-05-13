import './style.css';

document.querySelector('#app').innerHTML = `
<div class="app-layout">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Mupl</h2>
      <p>Premium Player</p>
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
    </header>

    <div class="content-body">
      <div class="album-section">
        <div class="album-art">
          <img src="/album_placeholder.png" alt="Album Art">
        </div>
        <div class="track-info">
          <div class="track-info-text">
            <h1 id="trackTitleDisplay">Select a track</h1>
            <p id="trackArtistDisplay">Google Drive</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-player-bar">
      <div class="progress-container">
        <span id="currentTimeDisplay">0:00</span>
        <input type="range" id="progressBar" class="progress-bar" value="0" min="0" max="100" step="0.1">
        <span id="totalTimeDisplay">0:00</span>
      </div>
      
      <div class="controls-row">
        <div class="left-controls">
          <button class="icon-btn hidden" id="shuffleBtn" title="Shuffle">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </button>
          <button class="icon-btn" id="prevBtn" title="Previous">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>
        </div>
        
        <div class="center-controls">
          <button id="customPlayBtn" class="play-pause-btn" title="Play/Pause">
            <svg class="play-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg class="pause-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="currentColor" style="display:none">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        </div>
        
        <div class="right-controls">
          <button class="icon-btn" id="nextBtn" title="Next">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
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
const trackTitleDisplay = document.getElementById('trackTitleDisplay');
const statusMsg = document.getElementById('statusMsg');

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

audioPlayer.addEventListener('play', () => {
  playIcon.style.display = 'none';
  pauseIcon.style.display = 'block';
});

audioPlayer.addEventListener('pause', () => {
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
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

// Progress Bar
audioPlayer.addEventListener('timeupdate', () => {
  if (audioPlayer.duration) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = progress;
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  }
});

audioPlayer.addEventListener('loadedmetadata', () => {
  totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
});

progressBar.addEventListener('input', (e) => {
  if (audioPlayer.duration) {
    const seekTime = (e.target.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
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
});
