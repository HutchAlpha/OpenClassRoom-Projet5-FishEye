//! Récupération ID du photographe dans l'URL
const params = new URLSearchParams(window.location.search);
const photographerId = parseInt(params.get('id'));

let currentPhotographer = null;
let mediaList = [];
let currentIndex = 0;

//! Récupération données photographe +  médias
async function getPhotographerData() {
    const response = await fetch("data/photographers.json");
    const data = await response.json();
    return {
        photographer: data.photographers.find(p => p.id === photographerId),
        media: data.media.filter(m => m.photographerId === photographerId)
    };
}

//! Affichage infos photographe
async function displayPhotographer(photographer) {
    const { name, city, country, tagline, portrait } = photographer;
    const firstName = name.split(' ')[0];
    const picture = `assets/photographers/PhotographersPhotos/${portrait}`;

    document.querySelector('.photograph-header h1').textContent = name;
    document.querySelector('.photograph-header .location').textContent = `${city}, ${country}`;
    document.querySelector('.photograph-header .tagline').textContent = tagline;
    document.querySelector('.photograph-header img').src = picture;
    document.querySelector('.photograph-header img').alt = name;

    return { firstName, fullName: name };
}

//! Maj affichage total (likes et prix)
function updateLikesDisplay() {
    const totalLikes = mediaList.reduce((total, item) => total + item.likes, 0);
    document.querySelector('.media-info .TOTALlikes').innerHTML = `
  <span alt="${totalLikes} likes"> 
    ${totalLikes} <span class="heart" aria-hidden="true">♥</span> 
  </span>`;
    document.querySelector('.media-info .price').textContent = `${currentPhotographer.price} €/ Jour`;
}


function createMediaElement(item, firstName, fullName, index) {
    let mediaElement;
    const container = document.createElement('div');
    container.className = 'PresentationPhotographe';
    const blockMedia = document.createElement('div');
    blockMedia.className = 'blockMedia';

    if (item.image) {
        mediaElement = document.createElement('img');
        mediaElement.src = `assets/photographers/${firstName}/${item.image}`;
        mediaElement.setAttribute('alt', `${item.title} - ${fullName}`);
        mediaElement.setAttribute('tabindex', '0');

    } else if (item.video) {
        mediaElement = document.createElement('video');
        mediaElement.controls = true;
        const source = document.createElement('source');
        source.src = `assets/photographers/${firstName}/${item.video}`;
        source.type = 'video/mp4';
        mediaElement.appendChild(source);
        mediaElement.setAttribute('alt', `${item.title} - ${fullName}`);
    }

    //! Affichage du média en mode overlay lors du clic
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
    likes.setAttribute('alt', 'likes');
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


//! Filtre des médias
//? Stockage en tableau dans mediaList
function displayMedia(media, firstName, fullName) {

    mediaList = media.map(item => {
        item.firstName = firstName;
        item.fullName = fullName;
        return item;
    });
    
    const mediaSection = document.querySelector('.photographer-media');
    mediaSection.innerHTML = ''; 

    mediaList.forEach((item, index) => {
        const mediaElement = createMediaElement(item, firstName, fullName, index);
        mediaSection.appendChild(mediaElement);
    });
    console.log('mediaList après enrichissement :', mediaList);
}

//? Filtre des médias
const boutonFiltre = document.querySelector('.bouton-filtre');
const menuOptions = document.querySelector('.options-filtre');
const options = document.querySelectorAll('.option-filtre');

boutonFiltre.addEventListener('click', () => {
  const isExpanded = boutonFiltre.getAttribute('aria-expanded') === 'true';
  boutonFiltre.setAttribute('aria-expanded', !isExpanded);
  menuOptions.style.display = isExpanded ? 'none' : 'block';
});

options.forEach(option => {
  option.addEventListener('click', () => {
    const valeur = option.getAttribute('data-valeur');
    boutonFiltre.innerHTML = `${option.textContent} <span class="fleche">&#9660;</span>`;
    boutonFiltre.setAttribute('aria-expanded', 'false');
    menuOptions.style.display = 'none';

    // Simuler sélection
    trierMedia(valeur);
  });
});

function trierMedia(critere) {
  let mediasTries = [...mediaList];

  if (critere === "popularity") {
    mediasTries.sort((a, b) => b.likes - a.likes);
  } else if (critere === "date") {
    mediasTries.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (critere === "title") {
    mediasTries.sort((a, b) => a.title.localeCompare(b.title));
  }

  mediaList = mediasTries;
  const container = document.querySelector('.photographer-media');
  container.innerHTML = '';
  mediaList.forEach((item, index) => {
    const element = createMediaElement(item, item.firstName, item.fullName, index);

    container.appendChild(element);
  });
}
//!FIN Filtre des médias

//!Overlay
//? Navigation l'overlay
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

//? Fermeture de l'overlay
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
//? Navigation clavier
document.addEventListener('keydown', (e) => {
    const overlay = document.querySelector(".overlay");
    if (overlay.style.display === "flex") {
        if (e.key === 'ArrowRight') {
            changeImage(1);
        } else if (e.key === 'ArrowLeft') {
            changeImage(-1); 
        } else if (e.key === 'Escape') {
            overlay.style.display = "none";
            document.getElementById("main").style.display = "block";
            document.querySelector("header").style.display = "block";
            document.querySelector(".zoneFiltre").style.display = "flex";
            document.querySelector(".photographer-media").style.display = "flex";
            document.querySelector(".media-info").style.display = "flex";
        }
    }
});

//!FIN Overlay

//!Formulaire Contact
//? Formulaire personnalisé
async function formPhotographer(photographer) {
    const { name } = photographer;
    const contactModal = document.querySelector(".formhaut h2");
    if (contactModal) {
        contactModal.innerHTML = `Contactez-moi<br>${name}`;
    }
}
//!FIN Formulaire Contact



//! Initialisation
async function init() {
    const { photographer, media } = await getPhotographerData();
    
    if (!photographer || !media.length) {
        window.location.href = 'index.html';
        return;
    }
    
    currentPhotographer = photographer;
    const { firstName, fullName } = await displayPhotographer(photographer);
    formPhotographer(photographer);
    displayMedia(media, firstName, fullName);
    updateLikesDisplay();
    closeOverlay();
}

init();
