import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="bg-shape bg-shape-1"></div>
  <div class="bg-shape bg-shape-2"></div>
  <div id="bgTitle" class="bg-title">Mupl</div>
  
  <div class="player-container">
    <div class="header">
      <h1>DriveStream</h1>
      <p>Play audio directly from Google Drive</p>
    </div>

    <div id="loadingSpinner" class="loading-spinner"></div>
    <div id="errorMessage" class="error-message"></div>
    <div id="trackList" class="track-list"></div>

    <div id="audioSection" class="audio-section">
      <div class="controls-extra">
        <div class="center-controls">
          <button id="customPlayBtn" class="custom-play-btn" title="Play/Pause">
            <svg class="play-icon" viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
            <svg class="pause-icon" viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" style="display:none">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        </div>
        <div class="right-controls">
          <div class="volume-container">
            <button id="volumeBtn" class="volume-btn" title="Volume">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
            <div id="volumePopup" class="volume-popup">
              <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="1" class="volume-slider">
            </div>
          </div>
          <button id="repeatBtn" class="repeat-btn" title="Toggle Repeat">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </button>
        </div>
      </div>
      <audio id="audioPlayer" controls controlslist="nodownload noplaybackrate">
        <source id="audioSource" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
    </div>
  </div>
`;

// Extract ID and Type from Google Drive URL
function extractDriveInfo(url) {
  // Folder matching
  const matchFolder = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder) return { type: 'folder', id: matchFolder[1] };

  // File matching
  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD) return { type: 'file', id: matchD[1] };

  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId) return { type: 'file', id: matchId[1] };

  return null;
}

const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const trackListContainer = document.getElementById('trackList');
const audioSection = document.getElementById('audioSection');
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');
const bgTitle = document.getElementById('bgTitle');
const repeatBtn = document.getElementById('repeatBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumePopup = document.getElementById('volumePopup');
const volumeSlider = document.getElementById('volumeSlider');
const customPlayBtn = document.getElementById('customPlayBtn');
const playIcon = customPlayBtn.querySelector('.play-icon');
const pauseIcon = customPlayBtn.querySelector('.pause-icon');

let currentFiles = [];
let currentIndex = -1;

async function loadFolder(folderId) {
  loadingSpinner.style.display = 'block';

  try {
    const res = await fetch(`/api/folder?id=${folderId}`);
    if (!res.ok) throw new Error('Failed to load folder');
    const files = await res.json();
    
    loadingSpinner.style.display = 'none';

    if (files.length === 0) {
      showError('No playable audio files found in this folder.');
      return;
    }

    renderTrackList(files);
  } catch (err) {
    loadingSpinner.style.display = 'none';
    showError('폴더 정보를 불러오는 데 실패했습니다. 폴더가 공개 설정되어 있는지 확인하세요.');
  }
}

function renderTrackList(files) {
  trackListContainer.innerHTML = '';
  currentFiles = files;
  
  files.forEach((file, index) => {
    // Remove the file extension for a cleaner display
    const cleanName = file.name.replace(/\.[a-zA-Z0-9]+$/, '');

    const item = document.createElement('div');
    item.className = 'track-item';
    item.innerHTML = `
      <svg class="track-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="5.5" cy="17.5" r="2.5"></circle>
        <circle cx="17.5" cy="15.5" r="2.5"></circle>
        <path d="M8 17V5l12-2v12"></path>
      </svg>
      <div class="track-item-name">${cleanName}</div>
    `;
    
    item.addEventListener('click', () => {
      playTrack(index);
    });
    
    trackListContainer.appendChild(item);
  });

  trackListContainer.style.display = 'flex';
}

function playTrack(index) {
  if (index < 0 || index >= currentFiles.length) return;
  
  currentIndex = index;
  const file = currentFiles[index];
  const cleanName = file.name.replace(/\.[a-zA-Z0-9]+$/, '');
  
  document.querySelectorAll('.track-item').forEach((el, i) => {
    if (i === index) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  playFile(file.id, cleanName);
}

function playFile(fileId, title) {
  const streamUrl = `/api/stream?id=${fileId}`;

  // Update background title
  bgTitle.textContent = title;
  audioSection.style.display = 'flex';
  
  // Update audio source and play
  audioSource.src = streamUrl;
  audioPlayer.load();
  
  audioPlayer.play().catch(err => {
    console.error("Playback failed:", err);
  });
}

// Handle repeat toggle
repeatBtn.addEventListener('click', () => {
  audioPlayer.loop = !audioPlayer.loop;
  if (audioPlayer.loop) {
    repeatBtn.classList.add('active');
  } else {
    repeatBtn.classList.remove('active');
  }
});

// Handle volume popup toggle
volumeBtn.addEventListener('click', (e) => {
  volumePopup.classList.toggle('show');
  e.stopPropagation(); // prevent clicking outside from immediately closing it
});

// Adjust volume
volumeSlider.addEventListener('input', (e) => {
  audioPlayer.volume = e.target.value;
  // Update icon based on volume level
  const vol = parseFloat(e.target.value);
  if (vol === 0) {
    volumeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>`;
  } else if (vol < 0.5) {
    volumeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>`;
  } else {
    volumeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>`;
  }
});

// Close popup when clicking outside
document.addEventListener('click', (e) => {
  if (!volumePopup.contains(e.target) && e.target !== volumeBtn) {
    volumePopup.classList.remove('show');
  }
});

// Handle audio loading errors (e.g., file is private)
audioSource.addEventListener('error', () => {
  // Only show error if a source was actually set
  if (audioSource.getAttribute('src')) {
    showError("오디오 로드 실패! 파일이 '링크가 있는 모든 사용자'로 공유되었는지 확인하세요.");
  }
});

audioPlayer.addEventListener('ended', () => {
  if (!audioPlayer.loop) {
    if (currentIndex >= 0 && currentIndex < currentFiles.length - 1) {
      playTrack(currentIndex + 1);
    }
  }
});

customPlayBtn.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play().catch(err => console.error("Playback failed:", err));
  } else {
    audioPlayer.pause();
  }
});

audioPlayer.addEventListener('play', () => {
  playIcon.style.display = 'none';
  pauseIcon.style.display = 'block';
});

audioPlayer.addEventListener('pause', () => {
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
});

// Only repeat functionality is kept since disc icon is removed.

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = 'block';
  audioSection.style.display = 'none';
  trackListContainer.style.display = 'none';
  audioPlayer.pause();
}

// Automatically load the default folder on startup
window.addEventListener('DOMContentLoaded', () => {
  loadFolder('1SS9kZ16KErhHA-QMZmMm_QsO8aqS7O9C');
});
