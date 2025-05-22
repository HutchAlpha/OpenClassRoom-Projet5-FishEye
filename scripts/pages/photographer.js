//! Récupération ID du photographe dans l'URL
const params = new URLSearchParams(window.location.search);
const photographerId = parseInt(params.get('id'));

let currentPhotographer = null;
let mediaList = [];
let currentIndex = 0;

//! Récupération données photographe +  médias
async function getPhotographerData() {
  try {
    const response = await fetch("data/photographers.json");
    const data = await response.json();
    return {
      photographer: data.photographers.find(p => p.id === photographerId),
      media: data.media.filter(m => m.photographerId === photographerId)
    };
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
    return { photographer: null, media: [] };
  }
}

//! Header -_=> Informations du photographe
class Photographer {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.city = data.city;
    this.country = data.country;
    this.tagline = data.tagline;
    this.portrait = data.portrait;
  }

  get firstName() {
    return this.name.split(' ')[0];
  }

  get picture() {
    return `assets/photographers/PhotographersPhotos/${this.portrait}`;
  }

  displayProfileHeader() {
    const header = document.getElementById('header');
    const section = document.createElement('section');
    section.className = 'photograph-header';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'info';

    const h1 = document.createElement('h1');
    h1.textContent = this.name;

    const h2 = document.createElement('h2');
    h2.className = 'location';
    h2.textContent = `${this.city}, ${this.country}`;

    const p = document.createElement('p');
    p.className = 'tagline';
    p.textContent = this.tagline;

    infoDiv.appendChild(h1);
    infoDiv.appendChild(h2);
    infoDiv.appendChild(p);

    const button = document.createElement('button');
    button.className = 'contact_button';
    button.addEventListener('click', displayModal);
    button.setAttribute('alt', 'Contact Me');
    button.textContent = 'Contactez-moi';

    const img = document.createElement('img');
    img.className = 'photographer-img';
    img.setAttribute('src', this.picture);
    img.setAttribute('alt', `Photo de ${this.name}`);
    img.setAttribute('tabindex', '0');

    section.appendChild(infoDiv);
    section.appendChild(button);
    section.appendChild(img);
    header.appendChild(section);
  }
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


//! Main -_=> Creation IMG / VID
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

  mediaElement.addEventListener("click", () => {
    currentIndex = index;
    const mainImage = document.getElementById("mainImage");
    const mainVideo = document.getElementById("mainVideo");
    const caption = document.getElementById("caption");

    toggleOverlay(true);
    mainVideo.style.display = item.video ? "block" : "none";
    mainImage.style.display = item.image ? "block" : "none";
    mainImage.src = `assets/photographers/${firstName}/${item.image || ''}`;
    mainVideo.src = `assets/photographers/${firstName}/${item.video || ''}`;
    mainImage.alt = item.title;
    caption.textContent = item.title;
  });

  const detailMedia = document.createElement('div');
  detailMedia.className = 'detailMedia';
  const title = document.createElement('h3');
  title.textContent = item.title;

  //!Likes individuels
  const likes = document.createElement('span');
  likes.className = 'likes';
  likes.setAttribute('alt', 'likes');
  let liked = false;
  likes.textContent = `${item.likes} ♥`;

  likes.addEventListener("click", () => {
    item.likes += liked ? -1 : 1;
    liked = !liked;
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

//! ZoneFiltre -_=> Filtre des médias

//?Affichage initial des médias
function displayMedia(media, firstName, fullName) {
  mediaList = media.map(item => ({ ...item, firstName, fullName }));
  const mediaSection = document.querySelector('.photographer-media');
  mediaSection.innerHTML = '';
  mediaList.forEach((item, index) => {
    mediaSection.appendChild(createMediaElement(item, firstName, fullName, index));
  });
}

//?Ouvre/ferme le menu (clic ou clavier)
function toggleMenu() {
  const expanded = boutonFiltre.getAttribute('aria-expanded') === 'true';
  boutonFiltre.setAttribute('aria-expanded', String(!expanded));
  menuOptions.style.display = expanded ? 'none' : 'block';
}


function appliquerFiltre(option) {
  const critere = option.dataset.valeur;
  const btn = boutonFiltre.querySelector('.bouton-filtre');
  btn.innerHTML = `${option.textContent} <span class="fleche">&#9660;</span>`;
  boutonFiltre.setAttribute('aria-expanded', 'false');
  menuOptions.style.display = 'none';
  trierMedia(critere);
}

function trierMedia(critere) {
  const sorted = [...mediaList];
  if (critere === 'popularity') sorted.sort((a, b) => b.likes - a.likes);
  else if (critere === 'date') sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (critere === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
  const container = document.querySelector('.photographer-media');
  container.innerHTML = '';
  mediaList = sorted;
  mediaList.forEach((item, idx) => {
    container.appendChild(createMediaElement(item, item.firstName, item.fullName, idx));
  });
}
//!FIN Filtre des médias


//!Overlay
//? Navigation l'overlay
function changeImage(valeur) {
  if (!mediaList.length) return;
  currentIndex = (currentIndex + valeur + mediaList.length) % mediaList.length;
  const item = mediaList[currentIndex];
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
  document.querySelector(".overlay").style.display = "flex";
  caption.textContent = item.title;
}

function toggleOverlay(display) {
  const overlay = document.querySelector(".overlay");
  overlay.style.display = display ? "flex" : "none";
  const headerDisplay = display ? "none" : "block";
  const mainDisplay = display ? "none" : "flex";
  document.getElementById("header").style.display = headerDisplay;
  document.querySelector("header").style.display = headerDisplay;
  document.querySelector(".zoneFiltre").style.display = mainDisplay;
  document.querySelector(".photographer-media").style.display = mainDisplay;
  document.querySelector(".media-info").style.display = mainDisplay;
}

//? Navigation clavier
document.addEventListener('keydown', (e) => {
  const overlay = document.querySelector(".overlay");
  if (overlay.style.display === "flex") {
    if (e.key === 'ArrowRight') changeImage(1);
    else if (e.key === 'ArrowLeft') changeImage(-1);
    else if (e.key === 'Escape') toggleOverlay(false);
  }
});
//!FIN Overlay

//! Formulaire personnalisé
async function formPhotographer(photographer) {
  const contactModal = document.querySelector(".formhaut h2");
  if (contactModal) {
    contactModal.innerHTML = `Contactez-moi<br>${photographer.name}`;
  }
}

async function init() {
  const { photographer, media } = await getPhotographerData();
  if (!photographer || !media.length) {
    window.location.href = 'index.html';
    return;
  }
  currentPhotographer = photographer;
  const photographerInstance = new Photographer(photographer);
  photographerInstance.displayProfileHeader();
  const firstName = photographerInstance.firstName;
  const fullName = photographerInstance.name;
  displayMedia(media, firstName, fullName);
  updateLikesDisplay();
  formPhotographer(photographer);
  document.querySelector(".overlay .close-btn")?.addEventListener("click", () => toggleOverlay(false));
  document.querySelector(".overlay .next")?.addEventListener("click", () => changeImage(1));
  document.querySelector(".overlay .prev")?.addEventListener("click", () => changeImage(-1));
  document.querySelector(".form-close")?.addEventListener("click", closeModal);
}

const boutonFiltre = document.querySelector('.menu-deroulant');
const menuOptions = document.querySelector('.options-filtre');
const options = document.querySelectorAll('.option-filtre');

boutonFiltre.setAttribute('aria-haspopup', 'listbox');
boutonFiltre.setAttribute('aria-expanded', 'false');

boutonFiltre.addEventListener('click', toggleMenu);
boutonFiltre.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleMenu();
  }
});

options.forEach(option => {
  option.setAttribute('role', 'option');
  option.setAttribute('tabindex', '0');
  option.addEventListener('click', () => appliquerFiltre(option));
  option.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      appliquerFiltre(option);
    }
  });
});

init();
