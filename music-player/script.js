const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");
const volumeSlider = document.getElementById("volume-slider");
const autoplayBtn = document.getElementById("autoplay-btn");
const songTitle = document.getElementById("song-title");
const artist = document.getElementById("artist");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const albumImg = document.getElementById("album-img");
const songList = document.getElementById("song-list");

// Sample playlist (replace with real data/URLs)
const playlist = [
  {
    title: "Song 1",
    artist: "Artist 1",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?fit=crop&w=200&h=200",
  },
  {
    title: "Song 2",
    artist: "Artist 2",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    img: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?fit=crop&w=200&h=200",
  },
  {
    title: "Song 3",
    artist: "Artist 3",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?fit=crop&w=200&h=200",
  },
    {
    title: "Song 4",
    artist: "Artist 4",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?fit=crop&w=200&h=200",
  },
  {
    title: "Song 5",
    artist: "Artist 5",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    img: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?fit=crop&w=200&h=200",
  },
  {
    title: "Song 6",
    artist: "Artist 6",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?fit=crop&w=200&h=200",
  },
];


 
let currentSongIndex = 0;
let isAutoplay = true;

// Load playlist
function loadPlaylist() {
  songList.innerHTML = "";
  playlist.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = `${song.title} - ${song.artist}`;
    li.addEventListener("click", () => loadSong(index));
    songList.appendChild(li);
  });
}

// Load song
function loadSong(index) {
  currentSongIndex = index;
  const song = playlist[index];
  audio.src = song.src;
  songTitle.textContent = song.title;
  artist.textContent = song.artist;
  albumImg.src = song.img;
  updateActiveSong();
  audio.load();
}

// Update active song in playlist
function updateActiveSong() {
  document.querySelectorAll("#song-list li").forEach((li, index) => {
    li.classList.toggle("active", index === currentSongIndex);
  });
}

// Play/Pause
playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
});

// Next song
nextBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadSong(currentSongIndex);
  if (!audio.paused) audio.play();
});

// Previous song
prevBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentSongIndex);
  if (!audio.paused) audio.play();
});

// Progress bar
audio.addEventListener("timeupdate", () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// Volume
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

// Duration loaded
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Autoplay toggle
autoplayBtn.addEventListener("click", () => {
  isAutoplay = !isAutoplay;
  autoplayBtn.classList.toggle("active", isAutoplay);
});

// Autoplay on end
audio.addEventListener("ended", () => {
  if (isAutoplay) {
    nextBtn.click();
  }
});

// Format time
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

// Initialize
loadPlaylist();
loadSong(0);
