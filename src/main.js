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
      <audio id="audioPlayer" controls>
        <source id="audioSource" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <div class="controls-extra">
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
      // Remove active class from all
      document.querySelectorAll('.track-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      playFile(file.id, cleanName);
    });
    
    trackListContainer.appendChild(item);
  });

  trackListContainer.style.display = 'flex';
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

// Handle audio loading errors (e.g., file is private)
audioSource.addEventListener('error', () => {
  // Only show error if a source was actually set
  if (audioSource.getAttribute('src')) {
    showError("오디오 로드 실패! 파일이 '링크가 있는 모든 사용자'로 공유되었는지 확인하세요.");
  }
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
