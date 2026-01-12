// Image data (add your own images here; categories for filtering)
const images = [
    { src: "img/natr.jpg", category: "nature", caption: "Beautiful Forest" },
    { src: "img/urbon1.jpg", category: "urban", caption: "City Skyline" },
    { src: "img/anim.jpg", category: "animals", caption: "Wildlife Pattern" },
    { src: "img/natr2.jpg", category: "nature", caption: "Mountain View" },
    { src: "img/urbon2.jpg", category: "urban", caption: "Street Scene" },
    { src: "img/anim2.jpg", category: "animals", caption: "Animal Shapes" },
    // Add more images as needed
];

let currentIndex = 0;
let filteredImages = [...images];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// DOM Elements
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeBtn = document.getElementById('closeLightbox');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const zoomBtn = document.getElementById('zoomBtn');
const downloadBtn = document.getElementById('downloadBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const shuffleBtn = document.querySelector('.shuffle-btn');
const searchInput = document.getElementById('searchInput');

// Lazy Load Images with Error Handling
function lazyLoad() {
    const imgs = document.querySelectorAll('.gallery-item img[data-src]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onerror = () => img.src = 'https://via.placeholder.com/250x200/4a7c4a/fff?text=Image+Error';
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    imgs.forEach(img => observer.observe(img));
}

// Render Gallery
function renderGallery() {
    gallery.innerHTML = '';
    filteredImages.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const isFavorited = favorites.includes(img.src);
        item.innerHTML = `
            <img data-src="${img.src}" alt="${img.caption}" class="lazy">
            <div class="overlay"><i class="fas fa-eye"></i></div>
            <i class="fas fa-heart fav-icon ${isFavorited ? 'favorited' : ''}" data-src="${img.src}"></i>
        `;
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('fav-icon')) return; // Prevent lightbox if clicking heart
            openLightbox(index);
        });
        const favIcon = item.querySelector('.fav-icon');
        favIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(img.src, favIcon);
        });
        gallery.appendChild(item);
    });
    lazyLoad();
}

// Toggle Favorite
function toggleFavorite(src, icon) {
    if (favorites.includes(src)) {
        favorites = favorites.filter(fav => fav !== src);
        icon.classList.remove('favorited');
    } else {
        favorites.push(src);
        icon.classList.add('favorited');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Open Lightbox
function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // ensure any previous zoom state is cleared
    lightboxImg.classList.remove('zoomed');
    lightbox.classList.remove('zoomed');
}

// Update Lightbox Content
function updateLightbox() {
    const img = filteredImages[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.classList.remove('zoomed');
    lightboxCaption.textContent = img.caption;
}

// Close Lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
    // cleanup zoom state so UI is consistent next open
    lightboxImg.classList.remove('zoomed');
    lightbox.classList.remove('zoomed');
}

// Navigation
function nextImage() {
    currentIndex = (currentIndex + 1) % filteredImages.length;
    updateLightbox();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    updateLightbox();
}

// Zoom in Lightbox
function toggleZoom() {
    const zoomed = lightboxImg.classList.toggle('zoomed');
    if (zoomed) {
        lightbox.classList.add('zoomed');
    } else {
        lightbox.classList.remove('zoomed');
    }
}

// Download Image
function downloadImage() {
    const link = document.createElement('a');
    link.href = lightboxImg.src;
    link.download = filteredImages[currentIndex].caption.replace(/\s+/g, '_') + '.jpg';
    link.click();
}

// Filter Images
function filterImages(category) {
    filteredImages = category === 'all' ? [...images] : images.filter(img => img.category === category);
    applySearch();
    renderGallery();
    filterBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${category}"]`).classList.add('active');
}

// Shuffle Images
function shuffleImages() {
    filteredImages = [...filteredImages].sort(() => Math.random() - 0.5);
    renderGallery();
}

// Search Functionality
function applySearch() {
    const query = searchInput.value.toLowerCase();
    filteredImages = filteredImages.filter(img => img.caption.toLowerCase().includes(query));
}

// Event Listeners
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', prevImage);
nextBtn.addEventListener('click', nextImage);
zoomBtn.addEventListener('click', toggleZoom);
downloadBtn.addEventListener('click', downloadImage);
filterBtns.forEach(btn => btn.addEventListener('click', () => filterImages(btn.dataset.filter)));
shuffleBtn.addEventListener('click', shuffleImages);
searchInput.addEventListener('input', () => {
    filterImages(document.querySelector('.filter-btn.active').dataset.filter);
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'ArrowRight') nextImage();
        else if (e.key === 'ArrowLeft') prevImage();
        else if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'z' || e.key === 'Z') toggleZoom();
    }
});

// Touch Gestures for Mobile
let startX = 0;
lightbox.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
lightbox.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) nextImage();
    else if (endX - startX > 50) prevImage();
});

// Initialize
renderGallery();

// Generate background particles dynamically for better visibility
function generateParticles(count = 40) {
    const bg = document.querySelector('.background');
    if (!bg) return;
    // Clear existing inline particles, then create many
    bg.querySelectorAll('.particle').forEach(n => n.remove());
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const left = (Math.random() * 110) - 5; // allow slight overflow
        const size = 4 + Math.random() * 18; // 4-22px
        const delay = -Math.random() * 12; // negative to start mid-animation
        const duration = 8 + Math.random() * 14; // 8-22s
        const opacity = 0.4 + Math.random() * 0.6;
        p.style.left = left + '%';
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.animationDelay = delay + 's';
        p.style.animationDuration = duration + 's';
        p.style.opacity = opacity;
        p.style.bottom = (-10 - Math.random() * 40) + 'px';
        bg.appendChild(p);
    }
}

// Generate particles on load and on resize (throttled)
generateParticles(45);
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => generateParticles(Math.floor(window.innerWidth / 25)), 250);
});