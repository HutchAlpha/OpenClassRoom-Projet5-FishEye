// Récupération de l'ID du photographe dans l'URL
const params = new URLSearchParams(window.location.search);
const photographerId = parseInt(params.get('id'));

// Variables globales
let currentPhotographer = null;
let mediaList = [];
let currentIndex = 0;

// Récupération des données du photographe et des médias
async function getPhotographerData() {
    const response = await fetch('../data/photographers.json');
    const data = await response.json();
    return {
        photographer: data.photographers.find(p => p.id === photographerId),
        media: data.media.filter(m => m.photographerId === photographerId)
    };
}

// Affiche les informations photographe
async function displayPhotographer(photographer) {
    const { name, city, country, tagline, portrait } = photographer;
    const firstName = name.split(' ')[0];
    const picture = `assets/photographers/PhotographersPhotos/${portrait}`;

    document.querySelector('.photograph-header h1').textContent = name;
    document.querySelector('.photograph-header .location').textContent = `${city}, ${country}`;
    document.querySelector('.photograph-header .tagline').textContent = tagline;
    document.querySelector('.photograph-header img').src = picture;
    document.querySelector('.photograph-header img').alt = name;

    return firstName;
}

// Met à jour l'affichage du total des likes et du prix
function updateLikesDisplay() {
    const totalLikes = mediaList.reduce((total, item) => total + item.likes, 0);
    document.querySelector('.media-info .TOTALlikes').innerHTML = `${totalLikes} <span class="heart">♥</span>`;
    document.querySelector('.media-info .price').textContent = `${currentPhotographer.price} €/ Jour`;
}

// Crée l'élément média (image ou vidéo)
function createMediaElement(item, firstName, index) {
    let mediaElement;
    const container = document.createElement('div');
    container.className = 'PresentationPhotographe';
    const blockMedia = document.createElement('div');
    blockMedia.className = 'blockMedia';

    if (item.image) {
        mediaElement = document.createElement('img');
        mediaElement.src = `assets/photographers/${firstName}/${item.image}`;
        mediaElement.alt = item.title;
    } else if (item.video) {
        mediaElement = document.createElement('video');
        mediaElement.controls = true;
        const source = document.createElement('source');
        source.src = `assets/photographers/${firstName}/${item.video}`;
        source.type = 'video/mp4';
        mediaElement.appendChild(source);
    }

    // Affichage du média en mode overlay lors du clic
    mediaElement.addEventListener("click", function () {
        const overlay = document.querySelector(".overlay");
        const mainImage = document.getElementById("mainImage");
        const mainVideo = document.getElementById("mainVideo");
        const caption = document.getElementById("caption");

        currentIndex = index;
        if (overlay) {
            overlay.style.display = "flex";
            document.querySelector("header").style.display = "none";
            document.getElementById("main").style.display = "none";
            document.querySelector(".zoneFiltre").style.display = "none";
            document.querySelector(".photographer-media").style.display = "none";
            document.querySelector(".media-info").style.display = "none";

            mainVideo.style.display = item.video ? "block" : "none";
            mainImage.style.display = item.image ? "block" : "none";
            mainImage.src = `assets/photographers/${firstName}/${item.image || ''}`;
            mainVideo.src = `assets/photographers/${firstName}/${item.video || ''}`;
            mainImage.alt = item.title;
            caption.textContent = item.title;
        }
    });

    const detailMedia = document.createElement('div'); 
    detailMedia.className = 'detailMedia';
    const title = document.createElement('h3');
    title.textContent = item.title;
    
    const likes = document.createElement('span');
    likes.className = 'likes';
    let liked = false;
    likes.textContent = `${item.likes} ♥`;

    // Maj like lors du clic
    likes.addEventListener("click", () => {
        if (!liked) {
            item.likes += 1;
            liked = true;
        } else {
            item.likes -= 1;
            liked = false;
        }
        likes.textContent = `${item.likes} ♥`; 
        updateLikesDisplay();
    });
    
    detailMedia.appendChild(title);
    detailMedia.appendChild(likes);
    blockMedia.appendChild(mediaElement);
    blockMedia.appendChild(detailMedia);
    container.appendChild(blockMedia);
    
    return container;
}

// Affiche les médias et stocke le tableau dans mediaList
function displayMedia(media, firstName) {
    mediaList = media.map(item => {
        item.firstName = firstName;
        return item;
    });
    
    const mediaSection = document.querySelector('.photographer-media');
    mediaSection.innerHTML = ''; 

    mediaList.forEach((item, index) => {
        const mediaElement = createMediaElement(item, firstName, index);
        mediaSection.appendChild(mediaElement);
    });
}

// Filtre des médias
document.getElementById('sort-select').addEventListener('change', function () {
    const selected = this.value;
    let sortedMedia = [...mediaList];

    if (selected === "popularity") {
        sortedMedia.sort((a, b) => b.likes - a.likes);
    } else if (selected === "date") {
        sortedMedia.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (selected === "title") {
        sortedMedia.sort((a, b) => a.title.localeCompare(b.title));
    }

    mediaList = sortedMedia;
    const mediaContainer = document.querySelector('.photographer-media');
    mediaContainer.innerHTML = '';
    mediaList.forEach((item, index) => {
        const mediaElement = createMediaElement(item, item.firstName, index);
        mediaContainer.appendChild(mediaElement);
    });
});

// Fermeture de l'overlay
function closeOverlay() {
    const closebtn = document.querySelector(".close-btn");
    closebtn.addEventListener("click", () => {
        const overlay = document.querySelector(".overlay");
        overlay.style.display = "none";

        document.getElementById("main").style.display = "block";
        document.querySelector("header").style.display = "block";
        document.querySelector(".zoneFiltre").style.display = "flex";
        document.querySelector(".photographer-media").style.display = "flex";
        document.querySelector(".media-info").style.display = "flex";
    });
}

// Permet de naviguer entre les médias dans l'overlay
function changeImage(valeur) {
    if (!mediaList.length) return;
    
    currentIndex = (currentIndex + valeur + mediaList.length) % mediaList.length;
    const item = mediaList[currentIndex];
    const overlay = document.querySelector(".overlay");
    const mainImage = document.getElementById("mainImage");
    const mainVideo = document.getElementById("mainVideo");
    const caption = document.getElementById("caption");

    if (item.image) {
        mainImage.src = `assets/photographers/${item.firstName}/${item.image}`;
        mainImage.style.display = "flex";
        mainVideo.style.display = "none";
    } else if (item.video) {
        mainVideo.src = `assets/photographers/${item.firstName}/${item.video}`;
        mainVideo.style.display = "flex";
        mainImage.style.display = "none";
    }
    overlay.style.display = "flex";
    caption.textContent = item.title;
}

// Affiche le formulaire de contact avec le nom du photographe
async function formPhotographer(photographer) {
    const { name } = photographer;
    const contactModal = document.querySelector(".formhaut h2");
    if (contactModal) {
        contactModal.innerHTML = `Contactez-moi<br>${name}`;
    }
}

// Initialisation
async function init() {
    const { photographer, media } = await getPhotographerData();
    
    if (!photographer || !media.length) {
        window.location.href = 'index.html';
        return;
    }
    
    currentPhotographer = photographer;
    const firstName = await displayPhotographer(photographer);
    formPhotographer(photographer);
    displayMedia(media, firstName);
    updateLikesDisplay();
    closeOverlay();
}

init();
