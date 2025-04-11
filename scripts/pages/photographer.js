// Récupération id URL
const params = new URLSearchParams(window.location.search);
const photographerId = parseInt(params.get('id'));

async function getPhotographerData() {
    const response = await fetch('../data/photographers.json');
    const data = await response.json();
    return {
        photographer: data.photographers.find(p => p.id === photographerId),
        media: data.media.filter(m => m.photographerId === photographerId)
    };
}

// Affiche les informations du photographe
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

let currentIndex = 0;
let mediaList = [];

// Création d'un élément média (image/vidéo)
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

    mediaElement.addEventListener("click", function () {
        const overlay = document.querySelector(".overlay");
        const mainImage = document.getElementById("mainImage");
        const mainVideo = document.getElementById("mainVideo");
        const caption = document.getElementById("caption");

        const header = document.querySelector("header");
        const main = document.getElementById("main");
        const zoneFiltre = document.querySelector(".zoneFiltre");
        const photographerMedia = document.querySelector(".photographer-media");
        const contactModal = document.querySelector(".media-info");

        currentIndex = index;

        if (overlay) {
            overlay.style.display = "flex";
            
            main.style.display = "none";
            header.style.display = "none";
            zoneFiltre.style.display = "none";
            photographerMedia.style.display = "none";
            contactModal.style.display = "none";

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
    likes.textContent = `${item.likes} ♥`;

    detailMedia.appendChild(title);
    detailMedia.appendChild(likes);
    blockMedia.appendChild(mediaElement);
    blockMedia.appendChild(detailMedia);
    container.appendChild(blockMedia);

    return container;
}

// Affiche les médias
function displayMedia(media, firstName) {
    mediaList = media.map(item => ({ ...item, firstName }));
    const mediaSection = document.querySelector('.photographer-media');
    mediaSection.innerHTML = ''; // Reset du contenu

    const TOTALlikes = media.reduce((total, item) => total + item.likes, 0);

    media.forEach((item, index) => {
        const mediaElement = createMediaElement(item, firstName, index);
        mediaSection.appendChild(mediaElement);
    });

    return TOTALlikes;
}

//Filtre
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

    // Réaffichage des médias triés dans le conteneur dédié
    const mediaContainer = document.querySelector('.photographer-media');

    mediaContainer.innerHTML = '';
    sortedMedia.forEach((item, index) => {
    const mediaElement = createMediaElement(item, item.firstName, index);
    mediaContainer.appendChild(mediaElement);
    });
});

//FIN Filtre

// Affichage des détails lors du clic sur l'image/vidéo
function closeOverlay() {
    const closebtn = document.querySelector(".close-btn");

    const header = document.querySelector("header");
        const main = document.getElementById("main");
        const zoneFiltre = document.querySelector(".zoneFiltre");
        const photographerMedia = document.querySelector(".photographer-media");
        const contactModal = document.querySelector(".media-info");

    closebtn.addEventListener("click", () => {
        const overlay = document.querySelector(".overlay");
        overlay.style.display = "none";
        
        main.style.display = "block";
        header.style.display = "block";
        zoneFiltre.style.display = "flex";
        photographerMedia.style.display = "flex";
        contactModal.style.display = "flex";
    });
}

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

function Prix(photographer, TOTALlikes) {
    const { price } = photographer;
    document.querySelector('.media-info .TOTALlikes').innerHTML = `${TOTALlikes} <span class="heart">♥</span>`;
    document.querySelector('.media-info .price').textContent = `${price} €/ Jour`;
}

async function init() {
    const { photographer, media } = await getPhotographerData();
    
    if (!photographer || !media.length) {
        window.location.href = 'index.html';
        return;
    }
    
    const firstName = await displayPhotographer(photographer); 
    const TOTALlikes = displayMedia(media, firstName);
    Prix(photographer, TOTALlikes);
}

init();
