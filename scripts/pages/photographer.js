import { displayModal, closeModal } from "../utils/contactForm.js";

//! Récupération ID du photographe dans l'URL
const params = new URLSearchParams(window.location.search);
const photographerId = parseInt(params.get('id'));

let currentPhotographer = null;
let mediaList = [];
let currentIndex = 0;


//! Récupère les données depuis le JSON
async function getPhotographerData() {
  const response = await fetch("data/photographers.json");
  const data = await response.json();
  return {
    photographer: data.photographers.find(p => p.id === photographerId),
    media: data.media.filter(m => m.photographerId === photographerId)
  };
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

    infoDiv.append(h1, h2, p);
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

    section.append(infoDiv, button, img);
    header.appendChild(section);
  }
}


//! Classe de base Media
class Media {
  constructor(data, firstName, fullName) {
    this.title = data.title;
    this.likes = data.likes;
    this.date = data.date;
    this.firstName = firstName;
    this.fullName = fullName;
  }

  toggleLike() {
    this.likes += this.liked ? -1 : 1;
    this.liked = !this.liked;
  }
}

//! Classe ImageMedia
class ImageMedia extends Media {
  constructor(data, firstName, fullName) {
    super(data, firstName, fullName);
    this.image = data.image;
  }
  

  creation(index) {
    const container = document.createElement('div');
    container.className = 'PresentationPhotographe';
    const blockMedia = document.createElement('div');
    blockMedia.className = 'blockMedia';

    const mediaElement = document.createElement('img');
    mediaElement.src = `assets/photographers/${this.firstName}/${this.image}`;
    mediaElement.setAttribute('alt', `${this.title} - ${this.fullName}`);
    mediaElement.setAttribute('tabindex', '0');
    mediaElement.addEventListener("click", () => openOverlay(index));
    mediaElement.addEventListener("keydown", (e) => { if (e.key === "Enter") openOverlay(index); });

    const detailMedia = createDetailMedia(this);
    blockMedia.appendChild(mediaElement);
    blockMedia.appendChild(detailMedia);
    container.appendChild(blockMedia);
    return container;
  }
}

//! Main -_=> Creation IMG / VID
class VideoMedia extends Media {
  constructor(data, firstName, fullName) {
    super(data, firstName, fullName);
    this.video = data.video;
  }

  creation(index) {
    const container = document.createElement('div');
    container.className = 'PresentationPhotographe';
    const blockMedia = document.createElement('div');
    blockMedia.className = 'blockMedia';

    const mediaElement = document.createElement('video');
    const source = document.createElement('source');
    source.src = `assets/photographers/${this.firstName}/${this.video}`;
    source.type = 'video/mp4';
    mediaElement.appendChild(source);
    mediaElement.setAttribute('alt', `${this.title} - ${this.fullName}`);
    mediaElement.setAttribute('tabindex', '0');
    mediaElement.addEventListener("click", () => openOverlay(index));
    mediaElement.addEventListener("keydown", (e) => { if (e.key === "Enter") openOverlay(index); });

    const detailMedia = createDetailMedia(this);
    blockMedia.appendChild(mediaElement);
    blockMedia.appendChild(detailMedia);
    container.appendChild(blockMedia);
    return container;
  }
}

//! Factory Method
function MediaFactory(data, firstName, fullName) {
  if (data.image) return new ImageMedia(data, firstName, fullName);
  if (data.video) return new VideoMedia(data, firstName, fullName);
  throw new Error("Type de média inconnu");
}

//! Crée le bloc titre + likes
function createDetailMedia(media) {
  const detailMedia = document.createElement('div');
  detailMedia.className = 'detailMedia';

  const title = document.createElement('h3');
  title.textContent = media.title;

  const likes = document.createElement('span');
  likes.className = 'likes';
  likes.setAttribute('role', 'button');
  likes.setAttribute('tabindex', '0');
  likes.setAttribute('aria-label', 'J’aime ce média');
  likes.textContent = `${media.likes} ♥`;
  media.liked = false;

  likes.addEventListener("click", () => {
    media.toggleLike();
    likes.textContent = `${media.likes} ♥`;
    updateLikesDisplay();
  });
  likes.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      media.toggleLike();
      likes.textContent = `${media.likes} ♥`;
      updateLikesDisplay();
    }
  });

  detailMedia.appendChild(title);
  detailMedia.appendChild(likes);
  return detailMedia;
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

//! Affiche tous les médias
function displayMedia(media, firstName, fullName) {
  mediaList = media.map(item => MediaFactory(item, firstName, fullName));
  const mediaSection = document.querySelector('.photographer-media');
  mediaSection.innerHTML = '';
  mediaList.forEach((item, index) => {
    mediaSection.appendChild(item.creation(index));
  });
}

//! Affiche l'overlay média
function openOverlay(index) {
  currentIndex = (index + mediaList.length) % mediaList.length;
  const item = mediaList[currentIndex];
  const mainImage = document.getElementById("mainImage");
  const mainVideo = document.getElementById("mainVideo");
  const caption = document.getElementById("caption");

  toggleOverlay(true);
  if (item instanceof ImageMedia) {
    mainImage.src = `assets/photographers/${item.firstName}/${item.image}`;
    mainImage.style.display = "block";
    mainVideo.style.display = "none";
  } else {
    mainVideo.src = `assets/photographers/${item.firstName}/${item.video}`;
    mainVideo.style.display = "block";
    mainImage.style.display = "none";
  }
  caption.textContent = item.title;
}

//! Affiche/masque l'overlay
function toggleOverlay(display) {
  const overlay = document.querySelector(".overlay");
  overlay.style.display = display ? "flex" : "none";
  const headerDisplay = display ? "none" : "block";
  const mainDisplay = display ? "none" : "flex";
  const navDisplay = display ? "none" : "flex";
  document.getElementById("header").style.display = headerDisplay;
  document.querySelector("header").style.display = headerDisplay;
  document.querySelector(".zoneFiltre").style.display = mainDisplay;
  document.querySelector(".photographer-media").style.display = mainDisplay;
  document.querySelector(".media-info").style.display = mainDisplay;
  document.querySelector("nav").style.display = navDisplay;
}

//! Navigation clavier overlay
document.addEventListener('keydown', (e) => {
  const overlay = document.querySelector(".overlay");
  if (overlay.style.display === "flex") {
    const active = document.activeElement;
    if ((e.key === 'Enter' || e.key === ' ') && active.classList.contains('next')) {
      e.preventDefault();
      openOverlay(currentIndex + 1);
    } else if ((e.key === 'Enter' || e.key === ' ') && active.classList.contains('prev')) {
      e.preventDefault();
      openOverlay(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      openOverlay(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      openOverlay(currentIndex - 1);
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
      toggleOverlay(false);
    }
  }
});

//! Formulaire personnalisé
async function formPhotographer(photographer) {
  const contactModal = document.querySelector(".formhaut h2");
  if (contactModal) {
    contactModal.innerHTML = `Contactez-moi<br>${photographer.name}`;
  }
}

//! ZoneFiltre -_=> Filtre des médias
function appliquerFiltre(option) {
  const critere = option.dataset.valeur;
  const btn = document.querySelector('.menu-deroulant .bouton-filtre');
  btn.innerHTML = `${option.textContent} <span class="fleche">&#9660;</span>`;
  document.querySelector('.menu-deroulant').setAttribute('aria-expanded', 'false');
  document.querySelector('.options-filtre').style.display = 'none';
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
    container.appendChild(item.creation(idx));
  });
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
  document.querySelector(".overlay .next")?.addEventListener("click", () => openOverlay(currentIndex + 1));
  document.querySelector(".overlay .prev")?.addEventListener("click", () => openOverlay(currentIndex - 1));
  document.querySelector(".form-close")?.addEventListener("click", closeModal);



  //! Filtre clavier accessible
  const boutonFiltre = document.querySelector('.menu-deroulant');
  const menuOptions = document.querySelector('.options-filtre');
  const options = document.querySelectorAll('.option-filtre');

  boutonFiltre.setAttribute('tabindex', '0');
  boutonFiltre.setAttribute('aria-haspopup', 'listbox');
  boutonFiltre.setAttribute('aria-expanded', 'false');

  boutonFiltre.addEventListener('click', () => {
    const expanded = boutonFiltre.getAttribute('aria-expanded') === 'true';
    boutonFiltre.setAttribute('aria-expanded', String(!expanded));
    menuOptions.style.display = expanded ? 'none' : 'block';
  });

  boutonFiltre.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const expanded = boutonFiltre.getAttribute('aria-expanded') === 'true';
      boutonFiltre.setAttribute('aria-expanded', String(!expanded));
      menuOptions.style.display = expanded ? 'none' : 'block';
    }
  });

  options.forEach(option => {
    option.setAttribute('role', 'option');
    option.setAttribute('tabindex', '0');
    option.addEventListener('click', () => appliquerFiltre(option));
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        appliquerFiltre(option);
      }
    });
  });
}

init();
